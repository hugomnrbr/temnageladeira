begin;

create table if not exists public.tn_recipe_metrics (
  recipe_key text primary key,
  views_total bigint not null default 0 check (views_total >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.tn_recipe_interactions (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_key text not null,
  is_liked boolean not null default true,
  liked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, recipe_key)
);
create index if not exists tn_recipe_interactions_liked_at_idx on public.tn_recipe_interactions (liked_at desc) where is_liked;
create index if not exists tn_recipe_interactions_recipe_idx on public.tn_recipe_interactions (recipe_key) where is_liked;

alter table public.tn_recipe_metrics enable row level security;
alter table public.tn_recipe_interactions enable row level security;
drop policy if exists "Public read recipe metrics" on public.tn_recipe_metrics;
create policy "Public read recipe metrics" on public.tn_recipe_metrics for select to anon, authenticated using (true);
drop policy if exists "Users read own recipe interactions" on public.tn_recipe_interactions;
create policy "Users read own recipe interactions" on public.tn_recipe_interactions for select to authenticated using (user_id = auth.uid());
grant select on public.tn_recipe_metrics to anon, authenticated;
grant select on public.tn_recipe_interactions to authenticated;

create or replace function public.tn_record_recipe_view(p_recipe_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_recipe_key is null or length(trim(p_recipe_key)) = 0 or length(p_recipe_key) > 160 then
    raise exception 'Invalid recipe key';
  end if;
  insert into public.tn_recipe_metrics(recipe_key, views_total, updated_at)
  values (p_recipe_key, 1, now())
  on conflict (recipe_key) do update
    set views_total = public.tn_recipe_metrics.views_total + 1,
        updated_at = now();
end;
$$;

create or replace function public.tn_set_recipe_like(p_recipe_key text, p_liked boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_recipe_key is null or length(trim(p_recipe_key)) = 0 or length(p_recipe_key) > 160 then
    raise exception 'Invalid recipe key';
  end if;
  insert into public.tn_recipe_interactions(user_id, recipe_key, is_liked, liked_at, updated_at)
  values (auth.uid(), p_recipe_key, coalesce(p_liked,false), now(), now())
  on conflict (user_id, recipe_key) do update
    set is_liked = excluded.is_liked,
        liked_at = case when excluded.is_liked then now() else public.tn_recipe_interactions.liked_at end,
        updated_at = now();
end;
$$;
revoke all on function public.tn_record_recipe_view(text) from public;
grant execute on function public.tn_record_recipe_view(text) to anon, authenticated;
revoke all on function public.tn_set_recipe_like(text, boolean) from public;
grant execute on function public.tn_set_recipe_like(text, boolean) to authenticated;

create or replace view public.tn_recipe_metrics_public as
select m.recipe_key, m.views_total,
       count(i.user_id) filter (where i.is_liked) as likes_total,
       count(i.user_id) filter (where i.is_liked and i.liked_at >= date_trunc('week', now())) as likes_this_week,
       m.updated_at
from public.tn_recipe_metrics m
left join public.tn_recipe_interactions i on i.recipe_key = m.recipe_key
group by m.recipe_key, m.views_total, m.updated_at;
grant select on public.tn_recipe_metrics_public to anon, authenticated;

create table if not exists public.tn_weekly_plans (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  plan jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);
alter table public.tn_weekly_plans enable row level security;
drop policy if exists "Users manage own weekly plans" on public.tn_weekly_plans;
create policy "Users manage own weekly plans" on public.tn_weekly_plans for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.tn_weekly_plans to authenticated;

create table if not exists public.tn_user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_key text not null,
  earned_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb,
  primary key (user_id, achievement_key)
);
alter table public.tn_user_achievements enable row level security;
drop policy if exists "Users read own achievements" on public.tn_user_achievements;
create policy "Users read own achievements" on public.tn_user_achievements for select to authenticated using (user_id = auth.uid());
grant select on public.tn_user_achievements to authenticated;

commit;
