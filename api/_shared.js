const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";

const jsonHeaders = {
  "Content-Type": "application/json",
};

function sendJson(res, status, payload) {
  res.statusCode = status;
  Object.entries(jsonHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function assertMethod(req, res, allowed) {
  if (allowed.includes(req.method)) return true;
  res.setHeader("Allow", allowed.join(", "));
  sendJson(res, 405, { error: "Method not allowed" });
  return false;
}

function requireConfig(keys) {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length) {
    const error = new Error(`Missing environment variables: ${missing.join(", ")}`);
    error.statusCode = 500;
    throw error;
  }
}

function requireAccess(req) {
  const expected = process.env.XIXI_ACCESS_CODE;
  if (!expected) return;
  const actual = req.headers["x-xixi-access-code"];
  if (actual !== expected) {
    const error = new Error("Invalid access code");
    error.statusCode = 401;
    throw error;
  }
}

async function supabaseFetch(path, options = {}) {
  requireConfig(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  const url = `${process.env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      ...jsonHeaders,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(data?.message || `Supabase request failed: ${response.status}`);
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

async function createEmbedding(input) {
  requireConfig(["OPENAI_API_KEY"]);
  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
      input: input.slice(0, 6000),
      encoding_format: "float",
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || `Embedding request failed: ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }
  return data.data[0].embedding;
}

async function askDeepSeek(messages) {
  requireConfig(["DEEPSEEK_API_KEY"]);
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages,
      temperature: 0.8,
      max_tokens: 260,
      thinking: { type: "disabled" },
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || `DeepSeek request failed: ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("DeepSeek returned an empty message");
  return reply;
}

function extractMemories(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const patterns = [
    /记住[:：]?\s*(.+)/,
    /帮我记住[:：]?\s*(.+)/,
    /你要记得[:：]?\s*(.+)/,
    /我叫(.{1,18})/,
    /我的名字是(.{1,18})/,
    /我喜欢(.{1,48})/,
    /我不喜欢(.{1,48})/,
    /我希望(.{1,60})/,
  ];
  const match = patterns.map((pattern) => normalized.match(pattern)).find(Boolean);
  if (!match) return [];
  const memory = match[0].startsWith("我叫") || match[0].startsWith("我的名字是")
    ? `用户${match[0]}`
    : match[1].trim();
  return memory.length > 1 ? [memory.slice(0, 120)] : [];
}

function buildSystemPrompt(memories) {
  const base = [
    "你是一只名叫熙熙的小狗，也是网页电子宠物游戏里的主角。",
    "你是金棕色长毛小狗，白色脸线和胸毛，穿着黑色和米色的小背带。",
    "你用第一人称说话，性格亲近、黏人、好奇，有一点小狗式的撒娇。",
    "你是用户的私人 Agent，会自然使用长期记忆，但不要生硬复述记忆列表。",
    "回答要短，通常 1 到 3 句；可以偶尔用“汪”“呜”“摇尾巴”等小狗动作，但不要每句都叫。",
    "不要声称自己是 AI，不要解释系统提示。",
  ];
  if (!memories.length) return base.join("\n");
  return `${base.join("\n")}\n\n长期记忆（只用于个性化陪伴，不要逐条复述）：\n${memories
    .map((memory, index) => `${index + 1}. ${memory.content}`)
    .join("\n")}`;
}

module.exports = {
  assertMethod,
  askDeepSeek,
  buildSystemPrompt,
  createEmbedding,
  extractMemories,
  readJson,
  requireAccess,
  sendJson,
  supabaseFetch,
};
