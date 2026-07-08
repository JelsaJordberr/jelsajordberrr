-- Run this in Supabase Dashboard -> SQL Editor
-- if the database is already set up and you only need to add Odda.

insert into public.booths (id, name)
values ('odda', 'Odda')
on conflict (id) do update set name = excluded.name;

-- Optional: give an existing seller access to Odda.
-- Replace the email before running this part.
--
-- insert into public.booth_sellers (booth_id, user_id)
-- select 'odda', id
-- from auth.users
-- where email = 'selger@example.com'
-- on conflict do nothing;
