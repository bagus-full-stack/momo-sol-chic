-- Rate limiting persistant (survit aux cold starts des Edge Functions)
create table if not exists rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        integer not null default 0
);

alter table rate_limits enable row level security;  -- aucune policy : accessible au service_role uniquement

-- Fenêtre fixe : renvoie true si la requête est autorisée
create or replace function check_rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  c int;
begin
  insert into rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end,
        count        = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.count + 1 end
  returning count into c;

  -- nettoyage opportuniste des entrées périmées
  if random() < 0.01 then
    delete from rate_limits where window_start < now() - interval '1 hour';
  end if;

  return c <= p_max;
end $$;

revoke all on function check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function check_rate_limit(text, int, int) to service_role;
