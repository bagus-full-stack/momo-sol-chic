-- ============================================================
-- Sol-Chic — Migration 003 : Fonctions SQL utilitaires
-- ============================================================

-- Recherche sémantique par cosinus (utilisée par la Edge Function chat)
create or replace function match_knowledge_chunks(
  query_embedding vector(768),
  match_threshold float default 0.70,
  match_count     int    default 5
)
returns table (
  id       uuid,
  content  text,
  category text,
  similarity float
)
language sql stable as $$
  select
    id,
    content,
    category,
    1 - (embedding <=> query_embedding) as similarity
  from knowledge_chunks
  where embedding is not null
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
