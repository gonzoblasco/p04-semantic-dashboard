# Semantic Dashboard — Agent Instructions

## 🎯 Project Vision

An intelligent dashboard implementing semantic search over support queries using OpenAI embeddings and Supabase pgvector. Part of the Full Stack AI Developer curriculum (Project 04).

## 🧠 AI Features & Architecture

- **Model**: OpenAI `text-embedding-3-small` (1536 dimensions).
- **Vector Store**: Supabase (Postgres) with `pgvector` extension.
- **Search Type**: Cosine similarity via `match_support_items` SQL RPC.
- **Real-time**: Dynamically adjust `match_threshold` and `match_count` from the UI.

## 🛠 Project Conventions

- **Proxy**: Root `proxy.ts` handles external API orchestration.
- **Actions**: Server Actions located in `lib/actions/`.
- **Database**: Direct Supabase client usage (No Prisma/ORM).
- **Authentication**: Supabase Auth with SSR support.
- **Styles**: Tailwind CSS v4 + radix-ui (via shadcn/ui).

## 🚦 Critical Workflow

1.  **Embeddings**: Queries must be embedded via `/api/search` before querying the DB.
2.  **Auth**: All dashboard and API routes require an active Supabase session.
3.  **RLS**: Row Level Security is active; users only access their own `support_items`.
