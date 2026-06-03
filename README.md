# One Horizon Client Portal

Portal React/Vite con API Express, Prisma 7 y PostgreSQL para clientes y administradores de One Horizon.

## Requisitos
- Node.js 20+
- npm
- Docker para PostgreSQL local

## Instalacion
```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

## Variables de entorno
Copiar los ejemplos y completar valores locales:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

No versionar `.env` ni secretos reales. Para desarrollo local alcanza con el `JWT_SECRET` de ejemplo, pero produccion debe definir un secreto fuerte propio.

## Base de datos local
Levantar PostgreSQL local con Docker Compose:

```bash
docker compose up -d db
```

Aplicar migraciones y seed canonico desde `backend/prisma/seed.js`:

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

## Base de datos de test
Los tests backend corren con `NODE_ENV=test` y `DATABASE_URL_TEST`. El guard en `backend/src/prisma.js` aborta si la URL de test no apunta a una base cuyo nombre contenga `onehorizon_test` o `_test`. Esto evita limpiar datos reales por error.

Crear la DB de test local, aplicar migraciones y opcionalmente instalar browsers de Playwright:

```bash
createdb onehorizon_test
npx prisma migrate deploy --schema backend/prisma/schema.prisma
npx playwright install
```

En Windows, si usas Docker/Postgres local, creala con tu cliente preferido y asegurate de tener en `backend/.env`:

```bash
DATABASE_URL_TEST="postgresql://onehorizon:onehorizon@localhost:5432/onehorizon_test"
```

Credenciales seed, todas con password `admin123`:

- `platform_admin` sin cliente, rol `PLATFORM_ADMIN`
- `horizon_admin`, cliente Horizon Corp, rol `CLIENT_ADMIN`
- `manager`, cliente Horizon Corp, rol `CLIENT_ADMIN`
- `atlantic_admin`, cliente Atlantic Group, rol `CLIENT_ADMIN`
- `atlantic_user`, cliente Atlantic Group, rol `CLIENT_USER`

## Ejecutar en local
Terminal backend:

```bash
npm run dev --prefix backend
```

Terminal frontend:

```bash
npm run dev --prefix frontend
```

Frontend: `http://localhost:5173`. API: `http://localhost:4000`.

## Smoke checks sin build
Con backend y frontend ya levantados:

```bash
curl http://localhost:4000/health
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"username":"platform_admin","password":"admin123"}'
curl http://localhost:4000/me -H "Authorization: Bearer <TOKEN>"
curl http://localhost:4000/api/clients/<CLIENT_ID>/locations -H "Authorization: Bearer <TOKEN>"
curl http://localhost:4000/api/gdpr/me/data -H "Authorization: Bearer <TOKEN>"
curl http://localhost:4000/api/gdpr/me/export -H "Authorization: Bearer <TOKEN>" -o gdpr_export.json
```

El contrato de locations es `{ "clientId": "...", "locations": [] }`. GDPR export no acepta token por query string.

Tambien hay scripts manuales en `backend/scripts/` para PowerShell. Ejecutar desde `backend/`:

```powershell
. .\scripts\test-login.ps1
.\scripts\test-me.ps1
.\scripts\test-clients.ps1
```

Los logs, tokens y outputs generados por pruebas locales no se versionan.

## Verificacion disponible
```bash
npm run lint --prefix frontend
npm run test:frontend
npm run test:backend
npm run test:e2e
npm run qa
npm run prisma:validate
```

`npm run test:backend` requiere `DATABASE_URL_TEST` y una DB de test migrada. Los tests limpian/crean datos solamente contra esa DB aislada.

`npm run test:e2e` levanta backend y frontend con Playwright usando los comandos `dev`; requiere DB local migrada/seeded y credenciales seed disponibles. Si ya tenes servicios levantados, podés evitar el web server automático:

```bash
E2E_SKIP_WEBSERVER=1 E2E_BASE_URL=http://127.0.0.1:5173 VITE_API_URL=http://127.0.0.1:4000 npm run test:e2e
```

Los browsers de Playwright se instalan una vez con:

```bash
npx playwright install
```
