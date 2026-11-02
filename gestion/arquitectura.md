# Arquitectura

## VERIFICADO-CÓDIGO

Monorepositorio npm sin workspaces declarados, con instalaciones raíz, `frontend/` y `backend/` separadas.

```text
Navegador
  React 19 + Router 7 + Vite 7 + Tailwind 4 + i18next ES/EN
  Web pública / login / activación / portal / administración
         | fetch, VITE_API_URL, JWT Bearer desde localStorage
  Express 5: app.js -> autenticación -> resolución tenant -> rutas
         | Prisma 7 + adapter-pg
  PostgreSQL (Compose local: postgres:16)
  SMTP opcional para activaciones (fallback a consola)
```

Fuentes: `frontend/package.json`, `frontend/src/App.jsx`, `frontend/src/lib/api.js`, `backend/package.json`, `backend/src/app.js`, `backend/src/prisma.js`, `docker-compose.yml`.

Roles: `PLATFORM_ADMIN` global, `CLIENT_ADMIN` y `CLIENT_USER` asociados a `Client`. Middleware tenant fuerza el cliente de los roles de cliente. No es una garantía automática sobre cada escritura: revisar asociaciones y consultas individualmente.

Modelo: User, InviteToken, Client, Location, Vendor, Invoice, Payment, Document, ServiceRecord, ConsentLog, GdprRequest, AuditLog. Importes persistidos en céntimos. Document referencia `storagePath`; esto no prueba un servicio de almacenamiento operativo. No se encontraron modelos de contrato, tarea o catálogo de servicios contratados en el schema auditado.

API pública: raíz, health, `/api/auth/*`, consentimiento GDPR. GDPR privado aplica su propia autenticación dentro de su router. API protegida: `/me`, `/api/dashboard`, clientes y establecimientos bajo `/api` y alias raíz, `/invoices`, `/api/admin/*`. Conservar contratos y alias hasta tener inventario de consumidores y pruebas.

## Despliegue: configuración verificada, operación pendiente

- `backend/nixpacks.toml` y `backend/procfile`: generan Prisma/aplican `prisma migrate deploy` al arrancar y ejecutan servidor. Cambiar una rama vinculada puede por tanto tener efectos en DB si el proveedor la despliega.
- `backend/src/server.js`: escucha `0.0.0.0`, `PORT` o 4000.
- `backend/src/app.js`: CORS configurable, fallback localhost.
- Vite: proxy local solo `/api`; llamadas a `/me` y `/invoices` requieren URL API explícita u otra configuración de proxy. Verificar con el entorno real.
- No se encontró `.github/`, `.vercel/` ni configuración versionada de hosting frontend en el árbol auditado. La documentación anterior menciona Vercel y el backend contiene indicios Railway/Nixpacks; proveedor activo, ramas, dominios y automatismos siguen sin verificar.
- Se necesitan nombres de variables (sin valores): backend DATABASE_URL, JWT_SECRET, PORT, CORS_ORIGINS, FRONTEND_URL y SMTP_HOST/PORT/USER/PASS, EMAIL_FROM; pruebas DATABASE_URL_TEST; frontend VITE_API_URL. Contrastar ejemplos con usos reales antes de preparar entorno.

## PROPUESTO

Actualización implementada en `fix/invitations-session-revocation`, sin desplegar: JWT incluye sessionVersion; autenticación consulta usuario/estado/rol/empresa/version vigentes. Logout revoca todas las sesiones. Dos migraciones añaden el campo y un trigger SQL para invalidar tokens ante cambios de identidad. Invitaciones y activación usan transacciones Serializable. Detalles y límites en [invitaciones y sesiones](seguridad-invitaciones-sesiones.md). La arquitectura descrita arriba conserva la evidencia de la base auditada.

Conservar React/Express/Prisma/PostgreSQL y desplegar por separado web y API cuando se apruebe. Añadir validación centralizada, autorización por objeto, observabilidad y entornos aislados. Introducir almacenamiento privado de documentos con autorización de descarga; contratos, tareas y renovaciones solo después de definir sus estados y relaciones. No introducir microservicios ni migrar stack durante la recuperación.

Antes de publicar: identificar proveedor, rama de producción y previews, migraciones automáticas, secretos, rewrites SPA y API, backups y restauración. La aprobación debe identificar commit, entorno y efectos de datos, con plan de reversión.

## Evolución operativa acordada (2026-11-02)

D13-D18 y [modelo operativo](modelo-operativo.md) amplían el destino: pagos con estados y asignaciones múltiples, destinatarios One Horizon/proveedor, desembolsos y reembolsos diferenciados, presupuestos versionados, catálogo ampliable y trabajos planificados, recuperación y cuatro roles. Son requisitos/diseño objetivo, no todos módulos existentes. Esta rama añade PLATFORM_USER al enum y a los permisos de lectura; migración aditiva solo local. Persistencia financiera nueva y resto de entidades objetivo no se han creado. Las APIs y el stack actual se conservan.
