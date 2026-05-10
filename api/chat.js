const {
  assertMethod,
  askDeepSeek,
  buildSystemPrompt,
  createEmbedding,
  extractMemories,
  readJson,
  requireAccess,
  sendJson,
  supabaseFetch,
} = require("./_shared");

async function upsertUser(userId) {
  await supabaseFetch("/users?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify([{ id: userId }]),
  });
}

async function ensureConversation(userId, conversationId) {
  if (conversationId) return conversationId;
  const rows = await supabaseFetch("/conversations", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ user_id: userId, title: "熙熙的小屋" }),
  });
  return rows[0].id;
}

async function saveMessage(conversationId, role, content) {
  const rows = await supabaseFetch("/messages", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ conversation_id: conversationId, role, content }),
  });
  return rows[0];
}

async function matchMemories(userId, embedding) {
  return supabaseFetch("/rpc/match_memories", {
    method: "POST",
    body: JSON.stringify({
      p_user_id: userId,
      p_query_embedding: embedding,
      p_match_count: 8,
    }),
  });
}

async function saveMemory(userId, sourceMessageId, content) {
  const embedding = await createEmbedding(content);
  const rows = await supabaseFetch("/memories", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: userId,
      source_message_id: sourceMessageId,
      content,
      embedding,
      importance: 0.75,
      type: "user_fact",
    }),
  });
  return rows[0];
}

module.exports = async function handler(req, res) {
  if (!assertMethod(req, res, ["POST"])) return;
  try {
    requireAccess(req);
    const body = await readJson(req);
    const text = String(body.message || "").trim();
    const userId = String(body.userId || "").trim();
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    if (!text) return sendJson(res, 400, { error: "message is required" });
    if (!userId) return sendJson(res, 400, { error: "userId is required" });

    await upsertUser(userId);
    const conversationId = await ensureConversation(userId, body.conversationId);
    const userMessage = await saveMessage(conversationId, "user", text);
    const queryEmbedding = await createEmbedding(text);
    const relevantMemories = await matchMemories(userId, queryEmbedding);

    const newMemories = [];
    for (const memoryText of extractMemories(text)) {
      const memory = await saveMemory(userId, userMessage.id, memoryText);
      newMemories.push(memory);
    }

    const messages = [
      { role: "system", content: buildSystemPrompt([...newMemories, ...relevantMemories]) },
      ...history
        .filter((message) => ["user", "assistant"].includes(message.role) && message.content)
        .map((message) => ({ role: message.role, content: String(message.content).slice(0, 1200) })),
      { role: "user", content: text },
    ];
    const reply = await askDeepSeek(messages);
    await saveMessage(conversationId, "assistant", reply);

    sendJson(res, 200, {
      reply,
      conversationId,
      memories: [...newMemories, ...relevantMemories].slice(0, 8),
      newMemories,
    });
  } catch (error) {
    console.error(error);
    sendJson(res, error.statusCode || 500, {
      error: error.message || "Unexpected server error",
    });
  }
};
