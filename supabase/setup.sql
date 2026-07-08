-- Jelsa Jordbaer: Supabase database setup
-- Run this in Supabase Dashboard -> SQL Editor.

create table if not exists public.booths (
  id text primary key,
  name text not null,
  status text not null default 'closed' check (status in ('open', 'closed')),
  message text,
  message_expires_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.booth_sellers (
  booth_id text not null references public.booths(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (booth_id, user_id)
);

insert into public.booths (id, name) values
  ('haugesund', 'Haugesund'),
  ('akra', 'Åkra'),
  ('sand', 'Sand'),
  ('odda', 'Odda')
on conflict (id) do update set name = excluded.name;

create or replace function public.set_booth_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists set_booth_audit_fields on public.booths;
create trigger set_booth_audit_fields
before update on public.booths
for each row
execute function public.set_booth_audit_fields();

create or replace function public.can_update_booth(target_booth_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.booth_sellers
    where booth_id = target_booth_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.can_update_booth(text) from public;
grant execute on function public.can_update_booth(text) to authenticated;

grant select on public.booths to anon, authenticated;
grant update (status, message, message_expires_at) on public.booths to authenticated;

alter table public.booths enable row level security;
alter table public.booth_sellers enable row level security;

drop policy if exists "Alle kan lese bodstatus" on public.booths;
create policy "Alle kan lese bodstatus"
on public.booths
for select
to anon, authenticated
using (true);

drop policy if exists "Selgere kan oppdatere tildelte boder" on public.booths;
create policy "Selgere kan oppdatere tildelte boder"
on public.booths
for update
to authenticated
using (public.can_update_booth(id))
with check (public.can_update_booth(id));

-- After creating seller users in Authentication -> Users, give access like this:
--
-- insert into public.booth_sellers (booth_id, user_id)
-- select 'haugesund', id
-- from auth.users
-- where email = 'selger@example.com'
-- on conflict do nothing;
