-- Tem na Geladeira: base de dados para publicação online no Supabase.
-- Execute no SQL Editor de um projeto NOVO ou revise antes de aplicar a projeto existente.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  bio text not null default '',
  role text not null default 'user' check (role in ('user','admin')),
  creator_status text not null default 'none' check (creator_status in ('none','pending','approved','rejected')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name text not null unique, emoji text not null default '🍽️', sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(), name text not null unique, emoji text not null default '🥗', group_name text not null default 'Outros',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(), name text not null, category_id uuid references public.categories(id) on delete set null,
  category_name text not null default 'Sem categoria', description text not null default '', time_minutes int,
  servings int not null default 2, image_url text, ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb, author_id uuid references public.profiles(id) on delete set null,
  status text not null default 'approved' check (status in ('pending','approved','rejected')),
  featured_day boolean not null default false, featured_week boolean not null default false,
  featured_breakfast boolean not null default false, views bigint not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.recipe_votes (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote smallint not null check (vote in (-1,1)), created_at timestamptz not null default now(),
  primary key(recipe_id,user_id)
);
create table if not exists public.recipe_ratings (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5), updated_at timestamptz not null default now(),
  primary key(recipe_id,user_id)
);
create table if not exists public.recipe_comments (
  id uuid primary key default gen_random_uuid(), recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, body text not null check (length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(follower_id,followed_id), check(follower_id <> followed_id)
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null, recipe_id uuid references public.recipes(id) on delete cascade,
  kind text not null check (kind in ('new_recipe','new_follower','comment','system')), message text not null,
  read_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.recipe_views (
  id bigint generated always as identity primary key, recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null, viewed_at timestamptz not null default now()
);

-- Auto-create profile for each Auth signup. Role is always user; do not trust client-supplied role.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name','')) on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.ingredients enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_votes enable row level security;
alter table public.recipe_ratings enable row level security;
alter table public.recipe_comments enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.recipe_views enable row level security;

-- Drop policies by known name first, so this script can be rerun.
drop policy if exists "profiles public read" on public.profiles;
drop policy if exists "profile owner update safe fields" on public.profiles;
drop policy if exists "categories public read" on public.categories;
drop policy if exists "categories admin manage" on public.categories;
drop policy if exists "ingredients public read" on public.ingredients;
drop policy if exists "ingredients admin manage" on public.ingredients;
drop policy if exists "recipes public read approved" on public.recipes;
drop policy if exists "recipes owner insert pending" on public.recipes;
drop policy if exists "recipes owner update or admin" on public.recipes;
drop policy if exists "recipes admin delete" on public.recipes;
drop policy if exists "votes public read" on public.recipe_votes;
drop policy if exists "votes owner manage" on public.recipe_votes;
drop policy if exists "ratings public read" on public.recipe_ratings;
drop policy if exists "ratings owner manage" on public.recipe_ratings;
drop policy if exists "comments public read" on public.recipe_comments;
drop policy if exists "comments authenticated insert" on public.recipe_comments;
drop policy if exists "comments owner or admin delete" on public.recipe_comments;
drop policy if exists "follows public read" on public.follows;
drop policy if exists "follows owner manage" on public.follows;
drop policy if exists "notifications owner read" on public.notifications;
drop policy if exists "notifications owner update" on public.notifications;
drop policy if exists "views insert public" on public.recipe_views;

create policy "profiles public read" on public.profiles for select using (true);
-- Column-level grants prevent a normal user from changing role. Admin assignment is done in SQL Editor.
grant select on public.profiles to anon, authenticated;
revoke update on public.profiles from anon, authenticated;
grant update (display_name, avatar_url, bio) on public.profiles to authenticated;
create policy "profile owner update safe fields" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "categories public read" on public.categories for select using (true);
create policy "categories admin manage" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "ingredients public read" on public.ingredients for select using (true);
create policy "ingredients admin manage" on public.ingredients for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "recipes public read approved" on public.recipes for select using (status = 'approved' or author_id = auth.uid() or public.is_admin());
create policy "recipes owner insert pending" on public.recipes for insert to authenticated with check (author_id = auth.uid() and status = 'pending' and exists(select 1 from public.profiles p where p.id = auth.uid() and p.creator_status = 'approved'));
create policy "recipes owner update or admin" on public.recipes for update to authenticated using ((author_id = auth.uid() and status = 'pending') or public.is_admin()) with check ((author_id = auth.uid() and status = 'pending') or public.is_admin());
create policy "recipes admin delete" on public.recipes for delete to authenticated using (public.is_admin());
create policy "votes public read" on public.recipe_votes for select using (true);
create policy "votes owner manage" on public.recipe_votes for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "ratings public read" on public.recipe_ratings for select using (true);
create policy "ratings owner manage" on public.recipe_ratings for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "comments public read" on public.recipe_comments for select using (true);
create policy "comments authenticated insert" on public.recipe_comments for insert to authenticated with check (user_id = auth.uid());
create policy "comments owner or admin delete" on public.recipe_comments for delete to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "follows public read" on public.follows for select using (true);
create policy "follows owner manage" on public.follows for all to authenticated using (follower_id = auth.uid() or public.is_admin()) with check (follower_id = auth.uid() or public.is_admin());
create policy "notifications owner read" on public.notifications for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "notifications owner update" on public.notifications for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "views insert public" on public.recipe_views for insert with check (user_id is null or user_id = auth.uid());

insert into public.categories(name,emoji,sort_order) values
 ('Café da manhã','🍳',1),('Almoço e jantar','🍲',2),('Lanches','🥪',3),('Bolos e tortas','🎂',4),('Sobremesas','🍮',5),('Acompanhamentos','🥗',6),('Bebidas','🥤',7),('Saladas','🥬',8)
on conflict (name) do nothing;

-- Depois de criar sua conta no site e confirmar o e-mail, promova SOMENTE seu usuário administrador:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'SEU-EMAIL-AQUI');
-- Não compartilhe service_role key; use apenas a chave publicável/anon no frontend.
