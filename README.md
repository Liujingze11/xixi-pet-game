# Xixi Pet Game

Xixi Pet Game is a browser pet prototype where Xixi, a small dog, can move around, react, chat, and evolve into a private cloud-backed agent.

## Current Cloud Architecture

- Static frontend: `index.html`, `styles.css`, `game.js`
- Serverless API: `api/chat.js`, `api/memories.js`
- Database and vector memory: Supabase Postgres with `pgvector`
- Chat model: DeepSeek chat completions
- Embeddings: OpenAI `text-embedding-3-small`

## Local Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Supabase Setup

Run this SQL migration in Supabase SQL Editor:

```text
supabase/migrations/001_xixi_agent_memory.sql
```

## Environment Variables

Set these in Vercel:

- `DEEPSEEK_API_KEY`
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `XIXI_ACCESS_CODE`

Optional:

- `DEEPSEEK_MODEL`
- `EMBEDDING_MODEL`

## Deployment Note

GitHub Pages can serve the static pet UI, but it cannot run `/api/*`. Deploy this repository to Vercel for the private Agent and vector memory backend.
