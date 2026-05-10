create extension if not exists vector;

create table if not exists public.users (
  id text primary key,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  title text not null default '熙熙的小屋',
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  source_message_id uuid references public.messages(id) on delete set null,
  content text not null,
  type text not null default 'user_fact',
  importance real not null default 0.5,
  embedding vector(1536) not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists memories_user_id_idx on public.memories(user_id);
create index if not exists messages_conversation_id_created_at_idx on public.messages(conversation_id, created_at);
create index if not exists memories_embedding_hnsw_idx on public.memories using hnsw (embedding vector_cosine_ops);

create or replace function public.match_memories(
  p_user_id text,
  p_query_embedding vector(1536),
  p_match_count int default 8
)
returns table (
  id uuid,
  content text,
  type text,
  importance real,
  similarity double precision,
  created_at timestamptz,
  last_used_at timestamptz
)
language plpgsql
as $$
begin
  return query
  select
    memories.id,
    memories.content,
    memories.type,
    memories.importance,
    1 - (memories.embedding <=> p_query_embedding) as similarity,
    memories.created_at,
    memories.last_used_at
  from public.memories
  where memories.user_id = p_user_id
  order by memories.embedding <=> p_query_embedding
  limit p_match_count;

  update public.memories
  set last_used_at = now()
  where memories.id in (
    select matched.id
    from public.memories matched
    where matched.user_id = p_user_id
    order by matched.embedding <=> p_query_embedding
    limit p_match_count
  );
end;
$$;
