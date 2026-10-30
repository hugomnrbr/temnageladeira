-- Sincronização do catálogo de receitas e fotos do Tem na Geladeira.
-- Execute este arquivo no Supabase SQL Editor (pode ser executado novamente).
alter table public.recipes add column if not exists needs jsonb not null default '[]'::jsonb;
drop policy if exists "recipes admin insert" on public.recipes;
create policy "recipes admin insert" on public.recipes for insert to authenticated with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','master')));
drop policy if exists "recipes admin update all" on public.recipes;
create policy "recipes admin update all" on public.recipes for update to authenticated using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','master'))) with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','master')));
drop policy if exists "recipes admin delete all" on public.recipes;
create policy "recipes admin delete all" on public.recipes for delete to authenticated using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','master')));
grant select on public.recipes to anon, authenticated;
grant insert, update, delete on public.recipes to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('recipe-images','recipe-images',true,5242880,array['image/jpeg','image/png','image/webp','image/gif']) on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];
drop policy if exists "Recipe photos are publicly readable" on storage.objects;
create policy "Recipe photos are publicly readable" on storage.objects for select to anon,authenticated using(bucket_id='recipe-images');
drop policy if exists "Admins upload recipe photos" on storage.objects;
create policy "Admins upload recipe photos" on storage.objects for insert to authenticated with check(bucket_id='recipe-images' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','master')));
drop policy if exists "Admins update recipe photos" on storage.objects;
create policy "Admins update recipe photos" on storage.objects for update to authenticated using(bucket_id='recipe-images' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','master'))) with check(bucket_id='recipe-images' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','master')));
drop policy if exists "Admins delete recipe photos" on storage.objects;
create policy "Admins delete recipe photos" on storage.objects for delete to authenticated using(bucket_id='recipe-images' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','master')));
