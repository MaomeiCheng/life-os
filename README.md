# life-os

## Dev (Codespaces)

### Start DB (Postgres)
If you reconnect to Codespaces and DB is not reachable, start the postgres container:

```bash
docker start lifeos-postgres || true
docker ps --filter "name=lifeos-postgres"
```

If the container does not exist, create it (data will persist in the `lifeos_pgdata` volume):

```bash
docker run -d --name lifeos-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=lifeos \
  -p 5432:5432 \
  -v lifeos_pgdata:/var/lib/postgresql/data \
  postgres:16
```

### Migrate / Seed
```bash
cd apps/web
pnpm prisma migrate dev
pnpm db:seed
```

### Start Web
```bash
cd apps/web
pnpm dev
```

Notes:
- Keep `.env` / `.env.local` uncommitted (local-only).
- Do NOT remove `lifeos_pgdata` unless you accept data loss.
