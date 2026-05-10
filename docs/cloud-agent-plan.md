# Xixi Private Agent Cloud Plan

This project is moving from a static GitHub Pages toy into a cloud-backed private agent.

## Target Architecture

```text
Browser UI
  -> /api/chat
    -> Supabase Postgres
    -> Supabase pgvector memory search
    -> OpenAI embeddings
    -> DeepSeek chat completion
```

The browser no longer owns provider API keys. It sends a message, user id, conversation id, and a private access code to the backend. The backend saves chat history, creates embeddings, retrieves semantically relevant memories, builds Xixi's system prompt, calls DeepSeek, and returns the reply.

## Environment Variables

Create these in Vercel:

- `DEEPSEEK_API_KEY`
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `XIXI_ACCESS_CODE`
- `DEEPSEEK_MODEL` optional, defaults to `deepseek-v4-flash`
- `EMBEDDING_MODEL` optional, defaults to `text-embedding-3-small`

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/migrations/001_xixi_agent_memory.sql`.
4. Copy the project URL and service role key into Vercel environment variables.

## Deployment

GitHub Pages can only serve the static frontend. The `/api/*` routes need a serverless host such as Vercel.

Recommended:

1. Import `Liujingze11/xixi-pet-game` into Vercel.
2. Set the environment variables above.
3. Deploy.

After deployment, use the Vercel URL as the real cloud app URL. GitHub Pages can remain as a static preview, but it will not run the cloud memory backend.
