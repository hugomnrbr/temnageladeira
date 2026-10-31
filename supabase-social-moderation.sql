-- Tem na Geladeira: correção compatível da tabela de avaliações + denúncias.
-- Pode executar novamente com segurança no Supabase SQL Editor.

begin;

create table if not exists public.recipe_ratings (
  recipe_key text,
  user_id uuid references auth.users(id) on delete cascade,
  rating smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Corrige também instalações em que a tabela já existia com colunas incompletas.
alter table public.recipe_ratings add column if not exists recipe_key text;
alter table public.recipe_ratings add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.recipe_ratings add column if not exists rating smallint;
alter table public.recipe_ratings add column if not exists created_at timestamptz not null default now();
alter table public.recipe_ratings add column if not exists updated_at timestamptz not null default now();

create unique index if not exists recipe_ratings_recipe_user_uidx
  on public.recipe_ratings(recipe_key, user_id);
create index if not exists recipe_ratings_recipe_key_idx
  on public.recipe_ratings(recipe_key);

alter table public.recipe_ratings enable row level security;
drop policy if exists "Recipe ratings are publicly readable" on public.recipe_ratings;
create policy "Recipe ratings are publicly readable"
  on public.recipe_ratings for select to anon, authenticated using (true);
drop policy if exists "Users manage own recipe ratings" on public.recipe_ratings;
create policy "Users manage own recipe ratings"
  on public.recipe_ratings for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select on public.recipe_ratings to anon, authenticated;
grant insert, update, delete on public.recipe_ratings to authenticated;

create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.recipe_comments(id) on delete cascade,
  recipe_key text not null,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null default 'Conteúdo inadequado' check (char_length(reason) between 3 and 300),
  status text not null default 'pending' check (status in ('pending','reviewed','dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  unique (comment_id, reporter_id)
);
create index if not exists comment_reports_status_created_idx
  on public.comment_reports(status, created_at desc);
alter table public.comment_reports enable row level security;

drop policy if exists "Users submit own comment reports" on public.comment_reports;
create policy "Users submit own comment reports"
  on public.comment_reports for insert to authenticated
  with check (reporter_id = auth.uid());
drop policy if exists "Admins read comment reports" on public.comment_reports;
create policy "Admins read comment reports"
  on public.comment_reports for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','master')));
drop policy if exists "Admins update comment reports" on public.comment_reports;
create policy "Admins update comment reports"
  on public.comment_reports for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','master')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','master')));

drop policy if exists "Admins delete recipe comments" on public.recipe_comments;
create policy "Admins delete recipe comments"
  on public.recipe_comments for delete to authenticated
  using (user_id = auth.uid() or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','master')
  ));

grant select, insert on public.comment_reports to authenticated;
grant update on public.comment_reports to authenticated;
grant select, delete on public.recipe_comments to authenticated;

-- Atualiza o cache de esquema usado pela API REST do Supabase.
notify pgrst, 'reload schema';

commit;
