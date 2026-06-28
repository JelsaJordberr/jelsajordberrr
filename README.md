# Jelsa Jordbær

## Supabase-oppsett for bodstatus

Frontend-konfigurasjonen ligger øverst i `js/supabase-status.js`. Lim inn prosjektets URL i
`SUPABASE_URL` og den publiserbare (anon) nøkkelen i `SUPABASE_ANON_KEY`. En publiserbar nøkkel kan
ligge i nettleserkode; legg aldri inn service-role-nøkkelen eller andre hemmeligheter her.

### Database

Nettsiden trenger tabellen `public.booths`:

```sql
create table public.booths (
  id text primary key,
  name text not null,
  status text not null default 'closed' check (status in ('open', 'closed')),
  message text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into public.booths (id, name) values
  ('haugesund', 'Haugesund'),
  ('akra', 'Åkra'),
  ('sand', 'Sand')
on conflict (id) do nothing;
```

Slå på Row Level Security. Offentlig lesing og oppdatering begrenset til brukerens tildelte boder
kan settes opp slik:

```sql
alter table public.booths enable row level security;

create policy "Alle kan lese bodstatus"
on public.booths for select
using (true);

create policy "Selgere kan oppdatere tildelte boder"
on public.booths for update to authenticated
using (
  id in (
    select jsonb_array_elements_text(
      coalesce(auth.jwt() -> 'app_metadata' -> 'booth_ids', '[]'::jsonb)
    )
  )
)
with check (
  id in (
    select jsonb_array_elements_text(
      coalesce(auth.jwt() -> 'app_metadata' -> 'booth_ids', '[]'::jsonb)
    )
  )
);
```

Opprett selgere under **Authentication → Users** i Supabase. Tildel boder i brukerens
`app_metadata`, for eksempel `{"booth_ids":["haugesund"]}`. `app_metadata` må endres fra et
betrodd administrasjonsmiljø, ikke av brukeren i frontend. Etter at en tildeling endres, må
selgeren logge ut og inn igjen for å få et nytt token.

### Sider og testing

- `html/status-haugesund.html` bruker bod-ID `haugesund`.
- `html/status-akra.html` bruker bod-ID `akra`.
- `html/status-sand.html` bruker bod-ID `sand`.

Start nettstedet via en lokal webserver eller den publiserte nettsiden. Åpne en statusside og
kontroller at statusen lastes uten innlogging. Velg **For jordbærselgere**, logg inn med en bruker
fra Supabase, endre status eller melding og lagre. Test også en bod brukeren ikke er tildelt; den
skal avvises av RLS. En åpen statusside sjekker stille etter nye data hvert 20. sekund.
