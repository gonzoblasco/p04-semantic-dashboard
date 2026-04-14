# 🔍 Semantic Dashboard — AI-Powered Support Search

> **Project 04** of the Full Stack AI Developer curriculum. An intelligent dashboard that implements semantic search over customer support queries using vector embeddings.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🚀 Overview

The **Semantic Dashboard** is a specialized tool designed to handle high volumes of customer support questions (simulating a platform like MercadoLibre Support). Unlike traditional keyword-based search, this project utilizes **Natural Language Processing (NLP)** to find items based on their meaning.

### Key Capabilities:

- **Semantic Search**: Search for "shipping problems in rural areas" and find questions about "postal service issues" or "delivery delays" even if they don't share exact words.
- **Dynamic Thresholding**: Adjust the similarity sensitivity in real-time to broaden or narrow results.
- **Real-time Analytics**: KPI cards that provide a snapshot of support tickets by status (Pending, Resolved, Escalated).
- **Proactive Scaling**: Categorize and prioritize tickets intelligently using vector similarity scores.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (Postgres + `pgvector`)
- **AI Models**: OpenAI `text-embedding-3-small` (1536-dimensional vectors)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: React Hooks & Server Actions
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🧬 Technical Implementation

### Vector Search Logic

The heart of the project is the integration between OpenAI embeddings and Supabase's `pgvector` extension. We use **Cosine Similarity** to calculate the distance between search queries and stored support items.

#### SQL Function: `match_support_items`

```sql
create or replace function match_support_items(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (...)
language sql stable
as $$
  select *
  from support_items
  where user_id = p_user_id
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by (1 - (embedding <=> query_embedding)) desc
  limit match_count;
$$;
```

### Proactive Search Flow

1. **Input**: User types search query in natural language.
2. **Embedding**: The query is sent to OpenAI via a secure API route to generate a 1536-dimensional vector.
3. **RPC Call**: The vector is sent to Supabase using a Remote Procedure Call (RPC) that invokes the `match_support_items` function.
4. **Ranking**: Results are returned ordered by their similarity score (0.0 to 1.0).

---

## 📂 Project Structure

```text
├── app/
│   ├── api/search/      # Vector generation & RPC orchestration
│   ├── dashboard/       # Main dashboard interface
│   └── (auth)/          # Authentication flow (Supabase Auth)
├── components/
│   ├── dashboard/       # SemanticDashboard, SearchBar, ResultsTable, StatsBar
│   └── ui/              # shadcn/ui shared components
├── lib/
│   ├── actions/         # Server Actions (CRUD, Stats)
│   └── seed/            # Mock data generator (embeddings included)
└── schema.sql           # Database schema & vector search functions
```

---

## 🚦 Getting Started

### 1. Prerequisites

- A Supabase project with `pgvector` enabled.
- An OpenAI API Key.

### 2. Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

### 3. Installation

```bash
npm install
npm run dev
```

### 4. Database Setup

Run the contents of `schema.sql` in your Supabase SQL Editor to enable `pgvector` and create the search function. You can then use the `/api/seed` route (authed required) to populate your database with sample support queries.

---

## 🧪 Testing

Run unit and integration tests using Vitest:

```bash
npm test
```

---

_This project is part of a training program in AI and Full Stack Development. It demonstrates best practices in handling vector databases and AI integration within the Next.js ecosystem._
