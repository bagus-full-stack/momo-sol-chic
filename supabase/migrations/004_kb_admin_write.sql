-- L'admin connecté gère les chunks ; l'embedding est écrit par la fonction embed (service_role)
drop policy if exists "knowledge_write_service" on knowledge_chunks;

create policy "knowledge_write_admin"
  on knowledge_chunks for all
  using (auth.role() in ('authenticated', 'service_role'))
  with check (auth.role() in ('authenticated', 'service_role'));

-- Un chunk modifié doit être réindexé
create or replace function reset_chunk_index() returns trigger language plpgsql as $$
begin
  if new.content is distinct from old.content then
    new.embedding := null;
    new.indexed_at := null;
  end if;
  return new;
end $$;

drop trigger if exists knowledge_chunks_reset on knowledge_chunks;
create trigger knowledge_chunks_reset before update on knowledge_chunks
  for each row execute function reset_chunk_index();

-- Seuil du cahier des charges : 0.4
create or replace function match_knowledge_chunks(
  query_embedding vector(768),
  match_threshold float default 0.4,
  match_count     int    default 5
)
returns table (id uuid, content text, category text, similarity float)
language sql stable as $$
  select id, content, category, 1 - (embedding <=> query_embedding) as similarity
  from knowledge_chunks
  where embedding is not null
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
