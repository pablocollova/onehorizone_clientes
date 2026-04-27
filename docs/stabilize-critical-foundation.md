# Stabilize Critical Foundation

## Resumen

Este cambio estabiliza la base tecnica del portal One Horizon antes de seguir agregando funcionalidades. El objetivo fue corregir bugs criticos conocidos, eliminar riesgos de seguridad/versionado y dejar una suite local de QA para validar backend, frontend y flujos E2E antes de subir cambios.

## Bugs Y Riesgos Corregidos

- Auth ya no registra passwords ni request bodies sensibles en login.
- `JWT_SECRET` es obligatorio en produccion; el fallback local queda limitado a desarrollo/test.
- `/me` usa `req.user.id` correctamente y devuelve usuario publico sin `password`.
- Login rechaza usuarios que no tengan `status: ACTIVE`.
- GDPR `data/export/rectify/delete` usa datos sanitizados y no expone hashes, tokens ni passwords.
- GDPR export ya no acepta token por query string.
- Contrato de locations queda normalizado como `{ clientId, locations }`.
- Prisma schema y migraciones quedan alineados con los modelos GDPR.
- Seed canonico queda en `backend/prisma/seed.js` con passwords bcrypt y usuarios `ACTIVE`.
- Seed legacy `backend/seed.js` fue eliminado porque creaba usuarios incompatibles.
- Artefactos locales sensibles/generados fueron eliminados del repo: logs, token y outputs.
- Scripts PowerShell manuales fueron actualizados a rutas `/api/*` y credenciales seed actuales.
- `PrivacySettings` ahora muestra errores GDPR en UI; antes solo los enviaba a `console.error`.

## Testing Y QA Agregado

Se agrego una fundacion de pruebas local con DB aislada:

- Backend: `Vitest + Supertest`.
- Frontend: `Vitest + React Testing Library + MSW`.
- E2E: `Playwright`.
- DB de test: `onehorizon_test`, creada/migrada/seedeada por `backend/scripts/setup-test-db.js`.

## Cobertura Actual

Backend integration tests:

- health/root/detailed health.
- auth login, credenciales invalidas, usuarios `DISABLED`/`INVITED`, activation invalida y resend invite.
- `/me` autenticado y tokens invalidos.
- clients y locations scoped con contrato `{ clientId, locations }`.
- dashboard platform admin y client scoped.
- invoices tenant-scoped y filtros.
- admin clients/users/invoices/service records/invites.
- GDPR consent/data/export/rectify/delete.

Frontend tests:

- AuthContext, Login, Dashboard.
- PrivacySettings, Activate.
- Admin Clients, Users, Invite, Invoices, ServiceRecords.
- Button, Navbar, Footer, Sidebar, CookieConsentBanner.

E2E Playwright:

- Login client y dashboard.
- Login platform admin y admin clients.
- Crear cliente.
- Crear invoice con locations.
- Crear service record con locations.
- Invite, activacion y login de usuario nuevo.
- GDPR view/export.
- Guard de rutas admin para usuario no admin.

## Comandos De Verificacion

```bash
npm run qa
```

El comando ejecuta:

```bash
npm run lint --prefix frontend
npm run prisma:validate
npm run test:backend
npm run test:frontend
npm run test:e2e
```

Ultimo resultado local conocido:

- Frontend lint: PASS.
- Prisma validate: PASS.
- Backend tests: 18/18 PASS.
- Frontend tests: 32/32 PASS.
- E2E: 8/8 PASS.
- `git diff --check`: PASS con warnings LF/CRLF solamente.

## Notas Operativas

- No se ejecuto build por convencion del proyecto.
- No se debe commitear directo a `main` porque Vercel puede desplegar desde esa rama.
- La rama de trabajo es `fix/stabilize-critical-foundation`.
- Para correr backend/E2E tests se requiere PostgreSQL local levantado por Docker Compose.
