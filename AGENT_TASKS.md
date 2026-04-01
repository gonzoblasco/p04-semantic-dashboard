# Agent Tasks Handoff: Semantic Dashboard

P04 del currículum Full Stack AI Developer.

## Objetivo

Dashboard con búsqueda semántica en lenguaje natural sobre una colección de
preguntas de compradores (simulando SoporteML). El usuario escribe en lenguaje
natural y el sistema retorna los resultados más similares semánticamente usando
embeddings + pgvector.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Supabase (Auth + Postgres + RLS + pgvector) — proyecto reutilizado de P03
- OpenAI SDK (`openai`) para text-embedding-3-small
- Tabla nueva: `support_items` con columna vector(1536)

## Convenciones heredadas

- proxy.ts en la raíz — función exportada como `proxy`
- Rutas protegidas bajo /dashboard
- Server Actions en /lib/actions/
- Sin Prisma, Supabase client directo

## Tasks

### 1. Instalar dependencias nuevas

- [ ] `npm install openai`
- [ ] Agregar `OPENAI_API_KEY` a `.env.local`
- [ ] Agregar `OPENAI_API_KEY` a `.env.example` (sin valor real)

### 2. Schema Supabase

- [ ] Crear tabla `support_items`:
  - `id` uuid PK default gen_random_uuid()
  - `user_id` uuid FK → auth.users
  - `buyer_nickname` text not null
  - `product_title` text not null
  - `question_text` text not null
  - `category` text not null (envio | garantia | precio | tecnico | general)
  - `status` text not null default 'pending' (pending | resolved | escalated)
  - `created_at` timestamptz default now()
  - `embedding` vector(1536)
- [ ] RLS: usuario solo accede a sus propios items
- [ ] Crear función SQL para similarity search:

```sql
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
```

- [ ] `schema.sql` con todo el SQL listo para documentar

### 3. Seed data

- [ ] `lib/seed/support-items.ts` — script que inserta 40 preguntas ficticias
      variadas en categorías y texto para que la búsqueda semántica sea interesante.
      Incluir preguntas sobre: envíos a distintas provincias, garantías, precios,
      specs técnicas, devoluciones, stock.
- [ ] El script genera embeddings para cada pregunta llamando a OpenAI y las
      inserta con el vector incluido.
- [ ] Exportar función `runSeed()` que se pueda invocar desde una API route.
- [ ] `app/api/seed/route.ts` — GET protegido que llama runSeed() (solo para dev)

### 4. API Route — embedding de queries

- [ ] `app/api/search/route.ts`
  - Acepta POST `{ query: string, threshold?: number, limit?: number }`
  - threshold default: 0.5, limit default: 10
  - Genera embedding de la query con text-embedding-3-small
  - Llama a `match_support_items` via Supabase RPC
  - Retorna array de resultados con similarity score
  - Auth check: rechaza si no hay sesión activa
  - Validación: query requerida, max 500 chars

### 5. Server Actions — support items

- [ ] `lib/actions/support.ts`:
  - `getItems(filters?)`: retorna todos los items del usuario.
    Filtros opcionales: category, status.
  - `getStats()`: retorna conteos por categoría y por status para
    los KPI cards del dashboard.

### 6. UI — Dashboard principal

- [ ] `app/dashboard/page.tsx` — Server Component, carga stats y lista inicial
- [ ] `components/dashboard/StatsBar.tsx` — 4 KPI cards:
      Total items | Pendientes | Resueltos | Escalados
- [ ] `components/dashboard/SearchBar.tsx` — Client Component:
      input de texto, botón buscar, estado de loading
- [ ] `components/dashboard/ResultsTable.tsx` — Client Component:
      tabla con columnas: Comprador | Producto | Pregunta | Categoría | Estado |
      Similitud (barra de progreso con %)
- [ ] `components/dashboard/ThresholdSlider.tsx` — Client Component:
      slider 0.0–1.0 paso 0.05, valor visible, persiste en sessionStorage
- [ ] `components/dashboard/SemanticDashboard.tsx` — Client Component
      orquestador: combina SearchBar + ThresholdSlider + ResultsTable,
      maneja el estado de búsqueda y llama a /api/search

### 7. UX de búsqueda

- [ ] Estado inicial: muestra todos los items (sin búsqueda activa)
- [ ] Durante búsqueda: skeleton loader en la tabla
- [ ] Con resultados: tabla ordenada por similarity DESC, barra de color
      semántico (verde ≥ 0.8, amarillo ≥ 0.6, rojo < 0.6)
- [ ] Sin resultados: mensaje "No se encontraron coincidencias. Probá bajar
      el umbral de similitud."
- [ ] Badge visible que indica si la vista es "Semántica" o "Todos"

### 8. Tests

- [ ] `app/api/search/__tests__/route.test.ts`:
  - POST sin auth → 401
  - POST sin query → 400
  - POST con query > 500 chars → 400
- [ ] `lib/actions/__tests__/support.test.ts`:
  - getItems() solo retorna items del usuario autenticado

## Orden de ejecución recomendado

Tasks 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
Correr $pr-review entre task 4 y 5, y al final antes de cerrar P04.
