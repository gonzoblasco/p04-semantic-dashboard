@AGENTS.md

## Proyecto

Semantic Dashboard — dashboard con búsqueda semántica en lenguaje natural.

## AI Feature

- text-embedding-3-small (OpenAI) para vectorizar queries y documentos
- pgvector en Supabase para similarity search (cosine)
- Query-to-embedding en tiempo real desde la UI
- Similarity threshold configurable

## Stack nuevo (respecto al scaffold)

- OpenAI SDK (`openai`) para embeddings
- pgvector extension activada en Supabase
- Nueva tabla `support_items` con columna embedding vector(1536)

## Model

Default: sonnet, effort: medium
