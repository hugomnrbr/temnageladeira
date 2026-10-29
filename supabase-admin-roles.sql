-- Tem na Geladeira: permissões Master/Admin no Supabase
-- Execute este arquivo no Supabase Dashboard > SQL Editor.
-- A conta hugomiqueas2@hotmail.com precisa existir em Authentication > Users.

begin;

alter table public.profiles
  add column if not exists role text not null default 'user';

-- Compatibilidade com esquemas que antes aceitavam apenas 'user' e 'admin'.
DO $migration$
DECLARE
  check_row record;
BEGIN
  FOR check_row IN
    SELECT c.conname
    FROM pg_constraint c
    WHERE c.conrelid = 'public.profiles'::regclass
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', check_row.conname);
  END LOOP;
END;
$migration$;
alter table public.profiles
  add constraint profiles_role_valid
  check (role in ('user', 'admin', 'master'));

-- Impede que usuários autenticados promovam a própria conta diretamente pela API.
create or replace function public.tn_protect_profile_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' and coalesce(new.role, 'user') <> 'user' then
      raise exception 'Não é permitido criar perfil com privilégios administrativos.';
    end if;
    if tg_op = 'UPDATE' and new.role is distinct from old.role then
      raise exception 'Somente a função administrativa autorizada pode alterar permissões.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tn_protect_profile_role_trigger on public.profiles;
create trigger tn_protect_profile_role_trigger
before insert or update of role on public.profiles
for each row execute function public.tn_protect_profile_role();

-- Lista apenas contas Master/Admin, e somente para a Master autenticada.
create or replace function public.tn_list_admin_accounts()
returns table(user_id uuid, email text, display_name text, role text)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'master'
  ) then
    raise exception 'Apenas a conta Master pode listar administradores.';
  end if;

  return query
    select p.id, u.email::text, p.display_name::text, p.role::text
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.role in ('master', 'admin')
    order by case when p.role = 'master' then 0 else 1 end, u.email;
end;
$$;

-- Concede ou remove a função de administrador para uma conta já cadastrada.
-- A conta Master é protegida e não pode ser rebaixada por esta função.
create or replace function public.tn_set_admin_role(target_email text, requested_role text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_id uuid;
  target_name text;
  existing_role text;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'master'
  ) then
    raise exception 'Apenas a conta Master pode alterar administradores.';
  end if;

  if lower(trim(requested_role)) not in ('admin', 'user') then
    raise exception 'Permissão solicitada inválida.';
  end if;

  select u.id, coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1))
    into target_id, target_name
  from auth.users u
  where lower(u.email) = lower(trim(target_email));

  if target_id is null then
    raise exception 'Essa conta não foi encontrada. A pessoa precisa se cadastrar primeiro no site.';
  end if;

  select p.role into existing_role
  from public.profiles p where p.id = target_id;

  if existing_role = 'master' then
    raise exception 'A conta Master não pode ser rebaixada.';
  end if;

  insert into public.profiles (id, display_name, role, creator_status)
  values (target_id, target_name, lower(trim(requested_role)), 'none')
  on conflict (id) do update
    set role = excluded.role;
end;
$$;

revoke all on function public.tn_list_admin_accounts() from public, anon;
revoke all on function public.tn_set_admin_role(text, text) from public, anon;
grant execute on function public.tn_list_admin_accounts() to authenticated;
grant execute on function public.tn_set_admin_role(text, text) to authenticated;

-- Define a conta Master solicitada. Falha de forma explícita se o e-mail não existir.
do $$
declare
  master_id uuid;
  master_name text;
begin
  select u.id, coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1))
    into master_id, master_name
  from auth.users u
  where lower(u.email) = lower('hugomiqueas2@hotmail.com');

  if master_id is null then
    raise exception 'A conta hugomiqueas2@hotmail.com ainda não existe em Supabase Authentication. Cadastre essa conta no site e execute este SQL novamente.';
  end if;

  insert into public.profiles (id, display_name, role, creator_status)
  values (master_id, master_name, 'master', 'none')
  on conflict (id) do update
    set role = 'master';
end;
$$;

commit;
