# Jelsa Jordbær

## Supabase-oppsett for bodstatus

Prosjektet bruker Supabase til å vise om bodene er åpne eller stengt, og til å la innloggede
selgere oppdatere sin egen bod. Hele databaseoppsettet ligger i `supabase/setup.sql`.

### 1. Opprett Supabase-prosjekt

1. Gå til [Supabase](https://supabase.com/) og opprett et nytt prosjekt.
2. Velg et sterkt databasepassord og riktig region.
3. Vent til prosjektet er ferdig opprettet.

### 2. Kjør databaseoppsettet

1. Åpne **SQL Editor** i Supabase.
2. Lim inn innholdet fra `supabase/setup.sql`.
3. Trykk **Run**.

Hvis databasen allerede er satt opp og du bare vil legge til Odda, kan du i stedet kjøre
`supabase/add-odda.sql`.

Dette lager:

- `public.booths` med bodene `haugesund`, `akra`, `sand` og `odda`
- `public.booth_sellers` for å koble selgere til bodene de får endre
- Row Level Security slik at alle kan lese status, men bare tildelte selgere kan oppdatere
- automatisk `updated_at` og `updated_by` når en bod oppdateres

### 3. Legg inn Supabase-nøklene i nettsiden

Frontend-konfigurasjonen ligger øverst i `js/supabase-status.js`. Lim inn prosjektets URL i
`SUPABASE_URL` og den publiserbare nøkkelen i `SUPABASE_ANON_KEY`.

Du finner verdiene i Supabase under **Project Settings → API Keys** eller i prosjektets
**Connect**-dialog. En publiserbar nøkkel kan ligge i nettleserkode; legg aldri inn
`service_role`-nøkkelen eller andre hemmeligheter her.

### 4. Opprett selgere

1. Gå til **Authentication → Users**.
2. Opprett én bruker per selger med e-post og passord.
3. Gå tilbake til **SQL Editor** og gi brukeren tilgang til riktig bod:

```sql
insert into public.booth_sellers (booth_id, user_id)
select 'haugesund', id
from auth.users
where email = 'selger@example.com'
on conflict do nothing;
```

Bytt ut `haugesund` med `akra`, `sand` eller `odda` ved behov. Samme selger kan få flere boder ved
å kjøre én linje per bod.

For å gi en selger tilgang til Odda direkte:

```sql
insert into public.booth_sellers (booth_id, user_id)
select 'odda', id
from auth.users
where email = 'selger@example.com'
on conflict do nothing;
```

### 5. Test

1. Åpne `html/status-haugesund.html`, `html/status-akra.html`, `html/status-sand.html` eller `html/status-odda.html`.
2. Kontroller at status lastes uten innlogging.
3. Åpne `html/selger.html`.
4. Logg inn med en selgerbruker.
5. Endre status eller melding og lagre.
6. Test en bod selgeren ikke har tilgang til. Den skal avvises av sikkerhetsreglene.

### Sider

- `html/status-haugesund.html` bruker bod-ID `haugesund`.
- `html/status-akra.html` bruker bod-ID `akra`.
- `html/status-sand.html` bruker bod-ID `sand`.
- `html/status-odda.html` bruker bod-ID `odda`.
- `html/oversikt.html` viser alle fire.
- `html/selger.html` er innloggingssiden selgerne bruker for å oppdatere status.
