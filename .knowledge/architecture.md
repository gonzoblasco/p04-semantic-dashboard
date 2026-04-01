# Architecture

## Stack

- Next.js 15 App Router + TypeScript
- Supabase (Auth, Postgres, RLS)
- Tailwind + shadcn/ui
- Server Actions para mutations

## Estructura

- /app/(auth)/ — rutas públicas
- /app/(dashboard)/ — rutas protegidas
- /lib/supabase/ — cliente server y browser
- /lib/actions/ — mutations

## Notas de versión

- Next.js 16: el archivo de middleware se llama `proxy.ts` (no `middleware.ts`)

## P03 — AI Writing Studio

- Streaming: /api/ai/generate con @anthropic-ai/sdk
- Auth check en API routes: createClient().auth.getUser() antes de procesar
- Model: claude-sonnet-4-6 (constante MODEL en route.ts)
- Historial de versiones: in-memory con useState, no persistido
