# Corrección de invitaciones y revocación de sesiones

Fecha: 2026-11-02. Responsable: Codex. Rama: `fix/invitations-session-revocation`, creada desde `f79c36377f81b924db43820fe5786cd9421b8e36`. Trabajo autorizado por Pablo; no autoriza despliegue ni merge a main.

Implementación publicada en commit `14fe6e7838b84f66f4208882c24c4814b9b3ec21`; informe disponible en https://github.com/pablocollova/onehorizone_clientes/blob/fix/invitations-session-revocation/gestion/seguridad-invitaciones-sesiones.md. Estado: listo para revisión, no desplegado. Ver comunicación IA para comprobaciones de publicación.

## VERIFICADO-CÓDIGO: cambios implementados en la rama

- Los endpoints `/api/admin/users/invite` y `/api/admin/invites` comparten `backend/src/services/invitations.js`. Un CLIENT_ADMIN solo invita dentro de su empresa y nunca crea un PLATFORM_ADMIN. No se puede modificar una invitación ajena por conocer su email. Tampoco se usa una reinvitación como mecanismo de transferencia entre empresas para el administrador global.
- Se validan email, rol, nombre y cliente, se normaliza el email y se comprueba que el cliente exista. La ruta `/invites` conserva su rol por defecto y respuesta con inviteLink; `/users/invite` conserva el rol obligatorio y no expone enlace en su respuesta.
- Reinvitación en transacción Serializable: usuario y token se actualizan juntos, se invalidan enlaces previos, conflictos concurrentes devuelven 409. Email se entrega después del commit; un fallo SMTP devuelve error y requiere reintentar. No se afirma atomicidad entre PostgreSQL y SMTP.
- `requireAuth` consulta el usuario vigente: rechaza cuentas inexistentes, no ACTIVE o borradas; compara rol, empresa y sessionVersion. Fallos de DB no habilitan un fallback que confíe solo en JWT.
- `POST /api/auth/logout` incrementa sessionVersion y revoca **todas las sesiones de esa cuenta**, incluida la actual. El frontend espera confirmación antes de limpiar credenciales; ante fallo de red/servidor conserva la sesión y permite reintentar, mostrando error. Un 401 limpia las credenciales porque la sesión ya no es válida.
- Migración 1 añade User.sessionVersion; migración 2 instala trigger PostgreSQL que incrementa versión al cambiar contraseña, rol, empresa, estado o deletedAt. Los tokens no resucitan al revertir un cambio. Las ediciones de perfil que no alteran esos campos conservan la sesión.
- Activación transaccional y de uso único: exige cuenta INVITED sin baja, consume enlace y actualiza cuenta juntos, revoca enlaces hermanos y sesiones anteriores. No permite reactivar una cuenta deshabilitada mediante una invitación antigua.
- Consentimiento anónimo sigue público; consentimiento que presenta Bearer exige una sesión vigente y no atribuye eventos a una cuenta con token revocado.
- Barrera adicional para pruebas destructivas: DATABASE_URL_TEST se analiza como URL, exige loopback y nombre terminado en `_test`, sin query ni fragmento (pg permite sobreescribir host con query). SMTP se deshabilita expresamente en tests. No se aceptan URLs remotas ni nombres de prueba escondidos en credenciales/query.

## VERIFICADO-EJECUCIÓN

- Se reprodujeron seis fallos con los handlers y middleware originales, usando las nuevas pruebas: ambos endpoints devolvían 200 al intentar secuestrar una invitación ajena; cuatro cambios de estado/rol/baja seguían permitiendo acceso con token antiguo. Se restauró después el código corregido. Registro local de esa reproducción fuera del repositorio, sin datos reales.
- Docker no inició su daemon. Se preparó PostgreSQL 16 temporal en `127.0.0.1:55432`, base nueva `onehorizon_security_test`, UTF8. No usa Railway, no reutiliza DB existente ni se conecta a producción.
- Se aplicaron las siete migraciones en esa base local; `prisma validate` PASS.
- Backend: 57/57 PASS (18 existentes, 25 de seguridad, 14 de barrera de DB).
- Frontend: 35/35 PASS (32 existentes y tres casos de cierre/reintento), con la opción de Node 26 documentada anteriormente `NODE_OPTIONS=--no-experimental-webstorage`.
- E2E: 9/9 PASS (ocho existentes y cierre de sesión con token revocado/nuevo login). Primera ejecución: 8 PASS y fallo de selector ambiguo en GDPR; se corrigió `getByText('horizon_admin', { exact: true })` y se repitió la suite completa con éxito. Chromium local y configuración temporal de ejecutable por instalación bloqueada al descomprimir en Node 26; no se cambió configuración E2E del repositorio para ese problema de entorno.
- Revisión de frontend con ESLint: PASS. No se ejecutó build, siguiendo la convención previa. Los tests completos backend limpian datos; no ejecutarlos simultáneamente con E2E sobre la misma DB.

## Comandos y entorno de prueba

Con PostgreSQL local de prueba migrado, configurar DATABASE_URL y DATABASE_URL_TEST hacia la misma base loopback terminada en `_test`, JWT_SECRET solo de test y NODE_ENV=test. No copiar una URL de producción. Se ejecutó Prisma generate, migrate deploy y validate con `--config backend/prisma.config.ts`, y `npm run test --prefix backend`. Frontend: `npm run test:frontend` con NODE_OPTIONS indicado arriba y `npm run lint --prefix frontend`.

Para E2E se hizo seed únicamente en esa base local, se levantaron API en puerto 54000 y frontend en 54173, SMTP desactivado y VITE_API_URL/FRONTEND_URL/CORS_ORIGINS locales; se ejecutó Playwright con E2E_SKIP_WEBSERVER=1, E2E_BASE_URL/VITE_API_URL locales y un worker. No se usó la API pública ni se enviaron correos reales.

## Límites y preparación de una futura salida (NO autorizada)

- No se modificó producción ni se ejecutaron migraciones remotas. Las correcciones de esta rama no protegen todavía la versión pública.
- Una futura salida debe aplicar **ambas migraciones** con Prisma Migrate antes de activar el backend nuevo. `db push` no instala el trigger SQL. Los JWT anteriores sin sessionVersion serán rechazados: todos deberán iniciar sesión de nuevo. No eliminar campos/trigger ni volver al middleware anterior como rollback improvisado.
- El cierre de sesión es global por cuenta, no por dispositivo. No se añadió panel de sesiones ni refresh tokens. La comprobación exige disponibilidad de DB y añade consultas; los middlewares existentes redundantes pueden revalidar más de una vez por petición. Optimizarlo es una tarea posterior, sin debilitar controles.
- H03 (relaciones financieras entre empresas), rate limiting completo de login, política de contraseñas, saneamiento de correos y demás hallazgos del diagnóstico siguen fuera de esta corrección. No equivale a auditoría de seguridad completa.
- Para otra IA: leer este archivo, comunicacion-ia y decisiones; revisar diff contra la rama documental, no hacer merge/despliegue. Mantener exclusión de autodeploy para esta rama en raíz y frontend; Railway revisado sigue main. No abrir PR en esta tarea.
