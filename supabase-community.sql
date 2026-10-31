-- Tem na Geladeira: comunidade, perfis públicos, seguidores e receitas compartilhadas
-- Execute depois do supabase-admin-roles.sql no Supabase SQL Editor.

begin;

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists bio text not null default '',
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint user_follows_no_self check (follower_id <> following_id)
);
create index if not exists user_follows_following_idx on public.user_follows(following_id);

create table if not exists public.community_recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  description text not null default '',
  category text not null default 'Outras',
  prep_time text not null default '',
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  image_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists community_recipes_author_idx on public.community_recipes(author_id, created_at desc);
create index if not exists community_recipes_feed_idx on public.community_recipes(status, created_at desc);

create table if not exists public.recipe_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.community_recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);
create table if not exists public.recipe_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.community_recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table if not exists public.community_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('follow','like','recipe')),
  message text not null,
  recipe_id uuid references public.community_recipes(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists community_notifications_recipient_idx on public.community_notifications(recipient_id, created_at desc);

alter table public.user_follows enable row level security;
alter table public.community_recipes enable row level security;
alter table public.recipe_saves enable row level security;
alter table public.recipe_likes enable row level security;
alter table public.community_notifications enable row level security;

drop policy if exists "Profiles public readable for community" on public.profiles;
create policy "Profiles public readable for community" on public.profiles
  for select to anon, authenticated using (true);
drop policy if exists "Users update own community profile" on public.profiles;
create policy "Users update own community profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Follow relationships are publicly readable" on public.user_follows;
create policy "Follow relationships are publicly readable" on public.user_follows
  for select to anon, authenticated using (true);
drop policy if exists "Users follow from their own account" on public.user_follows;
create policy "Users follow from their own account" on public.user_follows
  for insert to authenticated with check (follower_id = auth.uid() and follower_id <> following_id);
drop policy if exists "Users unfollow from their own account" on public.user_follows;
create policy "Users unfollow from their own account" on public.user_follows
  for delete to authenticated using (follower_id = auth.uid());

drop policy if exists "Approved recipes are public" on public.community_recipes;
create policy "Approved recipes are public" on public.community_recipes
  for select to anon, authenticated using (status = 'approved' or author_id = auth.uid() or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','master')
  ));
drop policy if exists "Users submit own recipes" on public.community_recipes;
create policy "Users submit own recipes" on public.community_recipes
  for insert to authenticated with check (author_id = auth.uid() and status = 'pending');
drop policy if exists "Authors update own pending recipes" on public.community_recipes;
create policy "Authors update own pending recipes" on public.community_recipes
  for update to authenticated using (author_id = auth.uid() and status = 'pending') with check (author_id = auth.uid() and status = 'pending');
drop policy if exists "Admins review community recipes" on public.community_recipes;
create policy "Admins review community recipes" on public.community_recipes
  for update to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','master'))) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','master')));

drop policy if exists "Users read own recipe saves" on public.recipe_saves;
create policy "Users read own recipe saves" on public.recipe_saves for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users save recipes for themselves" on public.recipe_saves;
create policy "Users save recipes for themselves" on public.recipe_saves for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Users remove own saves" on public.recipe_saves;
create policy "Users remove own saves" on public.recipe_saves for delete to authenticated using (user_id = auth.uid());

drop policy if exists "Recipe likes are public" on public.recipe_likes;
create policy "Recipe likes are public" on public.recipe_likes for select to anon, authenticated using (true);
drop policy if exists "Users like as themselves" on public.recipe_likes;
create policy "Users like as themselves" on public.recipe_likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Users remove own likes" on public.recipe_likes;
create policy "Users remove own likes" on public.recipe_likes for delete to authenticated using (user_id = auth.uid());

drop policy if exists "Users read own notifications" on public.community_notifications;
create policy "Users read own notifications" on public.community_notifications for select to authenticated using (recipient_id = auth.uid());
drop policy if exists "Users mark own notifications read" on public.community_notifications;
create policy "Users mark own notifications read" on public.community_notifications for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

create or replace function public.tn_community_notify_follow()
returns trigger language plpgsql security definer set search_path = public
as $$
declare actor_name text;
begin
  select coalesce(display_name, 'Alguém') into actor_name from public.profiles where id = new.follower_id;
  insert into public.community_notifications(recipient_id, actor_id, kind, message)
  values (new.following_id, new.follower_id, 'follow', actor_name || ' começou a seguir você.');
  return new;
end;
$$;
drop trigger if exists tn_community_follow_notification on public.user_follows;
create trigger tn_community_follow_notification after insert on public.user_follows
for each row execute function public.tn_community_notify_follow();

grant select on public.profiles, public.user_follows, public.community_recipes, public.recipe_likes to anon, authenticated;
grant update (display_name, avatar_url, bio, updated_at) on public.profiles to authenticated;
grant insert, delete on public.user_follows to authenticated;
grant insert, select, update on public.community_recipes to authenticated;
grant select, insert, delete on public.recipe_saves to authenticated;
grant select, insert, delete on public.recipe_likes to authenticated;
grant select, update on public.community_notifications to authenticated;


create table if not exists public.user_recipe_collections (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_key text not null,
  recipe_title text not null,
  recipe_category text not null default '',
  recipe_snapshot jsonb not null default '{}'::jsonb,
  is_favorite boolean not null default false,
  is_saved boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, recipe_key)
);
alter table public.user_recipe_collections enable row level security;
drop policy if exists "Users read own recipe collections" on public.user_recipe_collections;
create policy "Users read own recipe collections" on public.user_recipe_collections for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users add own recipe collections" on public.user_recipe_collections;
create policy "Users add own recipe collections" on public.user_recipe_collections for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Users update own recipe collections" on public.user_recipe_collections;
create policy "Users update own recipe collections" on public.user_recipe_collections for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Users remove own recipe collections" on public.user_recipe_collections;
create policy "Users remove own recipe collections" on public.user_recipe_collections for delete to authenticated using (user_id = auth.uid());
grant select, insert, update, delete on public.user_recipe_collections to authenticated;


-- Feedback e comentários das receitas do catálogo principal.
create table if not exists public.recipe_feedback (
 recipe_key text not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 vote text not null check (vote in ('up','down')),
 created_at timestamptz not null default now(),
 primary key (recipe_key,user_id)
);
-- Compatibilidade com a tabela recipe_comments criada anteriormente por
-- supabase-production.sql (que usa recipe_id e exige essa coluna).
-- Mantém os comentários antigos e permite também comentários do catálogo via recipe_key.
create table if not exists public.recipe_comments (
 id uuid primary key default gen_random_uuid(),
 recipe_key text,
 user_id uuid not null references auth.users(id) on delete cascade,
 display_name text not null default 'Usuário',
 body text not null check (char_length(body) between 1 and 500),
 created_at timestamptz not null default now()
);
alter table public.recipe_comments
  add column if not exists recipe_key text,
  add column if not exists display_name text not null default 'Usuário';
alter table public.recipe_comments
  alter column recipe_id drop not null;
create index if not exists recipe_comments_recipe_idx on public.recipe_comments(recipe_key,created_at);
alter table public.recipe_feedback enable row level security;
alter table public.recipe_comments enable row level security;
drop policy if exists "Recipe feedback is publicly readable" on public.recipe_feedback;
create policy "Recipe feedback is publicly readable" on public.recipe_feedback for select to anon,authenticated using (true);
drop policy if exists "Users manage own recipe feedback" on public.recipe_feedback;
create policy "Users manage own recipe feedback" on public.recipe_feedback for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists "Recipe comments are publicly readable" on public.recipe_comments;
create policy "Recipe comments are publicly readable" on public.recipe_comments for select to anon,authenticated using (true);
drop policy if exists "Authenticated users add own recipe comments" on public.recipe_comments;
create policy "Authenticated users add own recipe comments" on public.recipe_comments for insert to authenticated with check (user_id=auth.uid());
drop policy if exists "Users delete own recipe comments" on public.recipe_comments;
create policy "Users delete own recipe comments" on public.recipe_comments for delete to authenticated using (user_id=auth.uid() or exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','master')));
grant select on public.recipe_feedback,public.recipe_comments to anon,authenticated;
grant insert,update,delete on public.recipe_feedback to authenticated;
grant insert,delete on public.recipe_comments to authenticated;


-- Garante que toda conta autenticada tenha um perfil público consultável.
create or replace function public.tn_community_create_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role, creator_status)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(coalesce(new.email,''), '@', 1), 'Usuário'),
    'user',
    'none'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists tn_community_profile_on_signup on auth.users;
create trigger tn_community_profile_on_signup
after insert on auth.users
for each row execute function public.tn_community_create_profile();

-- Recupera contas já cadastradas que ainda não possuem perfil.
insert into public.profiles (id, display_name, role, creator_status)
select u.id,
       coalesce(nullif(trim(u.raw_user_meta_data->>'display_name'), ''), split_part(coalesce(u.email,''), '@', 1), 'Usuário'),
       'user',
       'none'
from auth.users u
left join public.profiles p on p.id=u.id
where p.id is null
on conflict (id) do nothing;

grant select on public.profiles to anon, authenticated;

commit;
