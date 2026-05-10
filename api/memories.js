const {
  assertMethod,
  readJson,
  requireAccess,
  sendJson,
  supabaseFetch,
} = require("./_shared");

async function listMemories(userId) {
  return supabaseFetch(
    `/memories?user_id=eq.${encodeURIComponent(userId)}&select=id,content,type,importance,created_at,last_used_at&order=created_at.desc&limit=24`,
  );
}

async function clearMemories(userId) {
  await supabaseFetch(`/memories?user_id=eq.${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}

module.exports = async function handler(req, res) {
  if (!assertMethod(req, res, ["GET", "DELETE"])) return;
  try {
    requireAccess(req);
    const userId = req.method === "GET"
      ? String(new URL(req.url, "http://localhost").searchParams.get("userId") || "").trim()
      : String((await readJson(req)).userId || "").trim();
    if (!userId) return sendJson(res, 400, { error: "userId is required" });
    if (req.method === "DELETE") {
      await clearMemories(userId);
      return sendJson(res, 200, { memories: [] });
    }
    const memories = await listMemories(userId);
    sendJson(res, 200, { memories });
  } catch (error) {
    console.error(error);
    sendJson(res, error.statusCode || 500, {
      error: error.message || "Unexpected server error",
    });
  }
};
