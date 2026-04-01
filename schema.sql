-- Enable pgvector extension
create extension if not exists vector;

-- Table: support_items
create table if not exists support_items (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  buyer_nickname  text        not null,
  product_title   text        not null,
  question_text   text        not null,
  category        text        not null check (category in ('envio', 'garantia', 'precio', 'tecnico', 'general')),
  status          text        not null default 'pending' check (status in ('pending', 'resolved', 'escalated')),
  created_at      timestamptz not null default now(),
  embedding       vector(1536)
);

-- RLS
alter table support_items enable row level security;

create policy "Users can manage their own support items"
  on support_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Similarity search function
create or replace function match_support_items(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (
  id uuid,
  buyer_nickname text,
  product_title text,
  question_text text,
  category text,
  status text,
  created_at timestamptz,
  similarity float
)
language sql stable
as $$
  select
    id, buyer_nickname, product_title, question_text,
    category, status, created_at,
    1 - (embedding <=> query_embedding) as similarity
  from support_items
  where user_id = p_user_id
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
