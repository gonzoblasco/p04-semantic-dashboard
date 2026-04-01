# Agent Tasks Handoff: AI Writing Studio

P03 del currículum Full Stack AI Developer.

## Objetivo

Editor de texto con sidebar de IA: genera contenido, mejora texto existente,
cambia el tono. Streaming en tiempo real vía Anthropic API. Historial de
versiones por sesión.

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Supabase (Auth + Postgres + RLS) — proyecto reutilizado de P02
- Anthropic SDK (`@anthropic-ai/sdk`) para streaming server-side
- Vercel AI SDK (`ai`) para `useCompletion` en el cliente

## Convenciones heredadas

- proxy.ts en la raíz — función exportada como `proxy` (Next.js 16)
- Rutas protegidas bajo /dashboard (sin route group)
- Server Actions en /lib/actions/
- Sin Prisma, Supabase client directo

## Tasks

### 1. Instalar dependencias nuevas

- [ ] `npm install @anthropic-ai/sdk ai`
- [ ] Agregar `ANTHROPIC_API_KEY` a `.env.local`

### 2. Schema Supabase

- [ ] Crear tabla `writing_sessions`:
  - `id` uuid PK
  - `user_id` uuid FK → auth.users
  - `title` text
  - `content` text
  - `created_at` timestamptz
  - `updated_at` timestamptz
- [ ] RLS: usuario solo accede a sus propias sesiones
- [ ] `schema.sql` con el SQL listo para ejecutar en Supabase

### 3. API Route — streaming endpoint

- [ ] `app/api/ai/generate/route.ts`
  - Acepta `{ prompt, tone, context }` via POST
  - `tone`: 'professional' | 'casual' | 'creative' | 'concise'
  - System prompt dinámico según tono
  - Responde con stream usando Anthropic SDK
  - Auth check: rechaza si no hay sesión activa

### 4. Server Actions — writing sessions

- [ ] `lib/actions/writing.ts`:
  - `createSession(title)` → crea sesión vacía
  - `updateSession(id, content)` → guarda contenido
  - `getSessions()` → lista sesiones del usuario
  - `getSession(id)` → sesión individual
  - `deleteSession(id)` → con ownership check

### 5. UI — Editor principal

- [ ] `app/dashboard/page.tsx` — lista de sesiones (Server Component)
- [ ] `app/dashboard/[id]/page.tsx` — editor individual (Server Component)
- [ ] `components/editor/Editor.tsx` — textarea principal (Client Component)
- [ ] `components/editor/AISidebar.tsx` — panel de IA con controles (Client Component)
- [ ] `components/editor/ToneSelector.tsx` — selector de 4 tonos (Client Component)
- [ ] `components/editor/VersionHistory.tsx` — historial en-memoria (Client Component)

### 6. Feature de streaming

- [ ] `AISidebar` usa `useCompletion` de Vercel AI SDK apuntando a `/api/ai/generate`
- [ ] Streaming visible token a token en el sidebar
- [ ] Botón "Insertar" copia el output al editor
- [ ] Botón "Reemplazar selección" reemplaza el texto seleccionado en el editor

### 7. Historial de versiones

- [ ] En-memoria durante la sesión (no persistido en DB)
- [ ] Cada vez que se inserta/reemplaza texto de IA, se guarda el estado anterior
- [ ] UI muestra hasta 10 versiones anteriores con botón "Restaurar"

### 8. Tests

- [ ] `lib/actions/__tests__/writing.test.ts` — ownership checks en update/delete
- [ ] Test del endpoint `/api/ai/generate` — auth check y validación de tone

## Contexto adicional

- El historial de versiones es in-memory (useState), no Supabase
- El `context` que se pasa a la API es el texto actual del editor (para que la
  IA tenga coherencia con lo que ya está escrito)
- No implementar colaboración en tiempo real — es single-user por sesión
