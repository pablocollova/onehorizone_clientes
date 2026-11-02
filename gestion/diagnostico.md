# Diagnóstico inicial

Fecha 2026-11-02. Base y alcance en [README](README.md). Revisión estática del código, configuración y pruebas existentes. No se accedió a datos de clientes ni a infraestructura de producción. Las consecuencias descritas son inferencias de código, pendientes de reproducción aislada.

## Prioridades

| ID | Prioridad | Hallazgo verificado y consecuencia | Evidencia |
| --- | --- | --- | --- |
| H01 | P0 | Ambos handlers de invitación buscan usuario INVITED por email global y actualizan clientId sin verificar pertenencia previa. CLIENT_ADMIN puede reasignar una invitación de otra empresa si conoce el email. | `backend/src/routes/admin.js`, `/users/invite` y `/invites` |
| H02 | P0 | requireAuth verifica firma y reconstruye identidad del JWT; no consulta estado/rol vigente en DB. Tokens duran 7 días. Baja GDPR desactiva usuario, pero el token previo sigue siendo criptográficamente válido y las rutas que no consultan el usuario pueden seguir aceptándolo. | `backend/src/middleware/auth.js`, `backend/src/routes/gdpr.js` |
| H03 | P1 | Alta/edición de Invoice y ServiceRecord admite IDs de cliente, local y factura sin comprobar coherencia entre ellos. Riesgo de asociaciones entre empresas y datos inconsistentes; reproduce como admin en test. | `backend/src/routes/admin.js` |
| H04 | P1 | Contact.handleSubmit solo hace alert y borra campos; no envía ni persiste consulta. Confirmación engañosa y pérdida de oportunidades B2B. | `frontend/src/sections/Contact.jsx` |
| H05 | P1 | Estado de cuenta muestra operaciones fijas; dashboard tiene tendencias fijas y controles documentales sin handler. Saldo suma total de facturas emitidas/vencidas sin restar Payment ni separar monedas. | `frontend/src/pages/AccountStatement.jsx`, `Dashboard.jsx`, `backend/src/routes/dashboard.js` |
| H06 | P1 | Scripts Nixpacks/procfile migran DB al iniciar. No está verificada la configuración real de ramas, backups y hosting. No publicar cambios con posibilidad de despliegue hasta aclararlo. | `backend/nixpacks.toml`, `backend/procfile`, `docs/stabilize-critical-foundation.md` |
| H07 | P2 | Retención asigna un mismo username único a todos los usuarios de un updateMany; con múltiples candidatos puede fallar. No se encontró invocación en server.js. | `backend/src/services/dataRetention.js`, `schema.prisma`, `server.js` |
| H08 | P2 | Activation actualiza usuario y token en operaciones separadas; revisar carreras/reutilización concurrente. SMTP sin configurar imprime link y devuelve éxito también sin restricción explícita de NODE_ENV. | `backend/src/routes/auth.js`, `backend/src/services/email.js` |
| H09 | P2 | Footer enlaza políticas a `#`, aunque existe `/privacy-policy`. Formularios y contenidos requieren revisión de accesibilidad y coherencia ES/EN. | `frontend/src/components/Footer.jsx`, `frontend/src/sections/Contact.jsx` |
| H10 | P2 | Raíz versiona 4531 archivos dentro de node_modules; frontend/.env sigue en el árbol pese a .gitignore. No se publican sus valores aquí ni se presupone que sean secretos. | `git ls-tree -r HEAD`, `.gitignore` |
| H11 | P1 | Protección DB de test en Prisma acepta `_test` en cualquier parte de la URL; setup-test-db también valida el nombre, pero ejecutar Vitest directamente evita esa segunda barrera. Reforzar identidad/host/nombre real de DB antes de suites que limpian datos. | `backend/src/prisma.js`, `backend/scripts/setup-test-db.js`, `backend/tests/helpers/db.js` |

## Qué preservar

La landing ya tiene estructura B2B, página privada separada y traducciones. El portal dispone de un contrato API, roles y separación por cliente. Backoffice y pruebas ya cubren flujos importantes. Recuperar y completar por módulos resulta más prudente que reescribir todo.

## Verificación de esta sesión

- VERIFICADO-EJECUCIÓN: repositorio clonado desde GitHub y base identificada; no existía carpeta gestion ni AGENTS.md en el árbol inicial auditado.
- VERIFICADO-EJECUCIÓN: PDF extraído y sus tres páginas renderizadas/consultadas; usado solo como concepto.
- VERIFICADO-EJECUCIÓN: Docker instalado pero daemon no accesible; no se levantó PostgreSQL, no se ejecutó seed ni migración.
- VERIFICADO-EJECUCIÓN: `npm run lint --prefix frontend` PASS. `npm run test:frontend` con `NODE_OPTIONS=--no-experimental-webstorage`: 7 archivos, 32/32 PASS. Primera ejecución con Node v26.10.0 sin esa opción: 32 fallos por localStorage no disponible; repetición compatible sin editar código. No confundir esta opción del entorno de test con una corrección de aplicación.
- VERIFICADO-EJECUCIÓN: 9 documentos, enlaces Markdown relativos válidos y `git diff --cached --check` sin errores; avisos de conversión LF/CRLF únicamente.
- NO EJECUTADO: backend, E2E, Prisma validate y comprobación completa en navegador. Requieren entorno preparado y DB aislada. No se ejecutó build, coherente con la convención previa de `docs/stabilize-critical-foundation.md`.
- HISTÓRICO, NO REVALIDADO: ese documento declara 18 tests backend, 32 frontend y 8 E2E aprobados en una sesión anterior. No usarlos como evidencia de este diagnóstico.

Esta auditoría no certifica seguridad, cumplimiento normativo ni equivalencia entre main y producción. El siguiente paso técnico propuesto es reproducir H01/H02 en tests aislados y corregirlos preservando los flujos válidos.
