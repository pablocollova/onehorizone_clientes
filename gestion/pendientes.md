# Pendientes

Estado inicial 2026-11-02. Todos los cambios funcionales siguientes están propuestos, no realizados. Prioridades y evidencia en diagnóstico; criterios completos en roadmap.

| ID | Prioridad | Trabajo | Estado / responsable |
| --- | --- | --- | --- |
| T01 | P0 | Identificar hosting activo, ramas, previews, migraciones automáticas y backups; habilitar publicación documental sin despliegue | Parcial: Vercel/Railway y ramas revisados; documentación publicada con protección de rama. Backups y preparación operativa siguen pendientes. Ver publicacion-github.md |
| T02 | P0 | Reproducir y corregir reasignación de INVITED entre clientes en ambos endpoints; probar email ya invitado ajeno | Implementado y probado en fix/invitations-session-revocation / Codex; revisado por Claude (R01, sin P0), no desplegado |
| T03 | P0 | Revalidar usuario/estado/rol o mecanismo de revocación de sesión; probar baja con token previo | Implementado y probado en fix/invitations-session-revocation / Codex; revisado por Claude (R01, sin P0), no desplegado |
| T04 | P1 | Validar relaciones client/location/invoice y entradas monetarias, fechas y enums | Pendiente / sin asignar |
| T05 | P1 | Conectar formulario a destino real y definir atención comercial | Pendiente / sin asignar; Pablo define destino |
| T06 | P1 | Conectar estado de cuenta y corregir saldo/pagos/monedas; quitar métricas ficticias | Pendiente / sin asignar |
| T07 | P1 | Preparar PostgreSQL local aislado y reejecutar backend/E2E sin contactar servicios externos | Completado para rama de seguridad con PostgreSQL temporal loopback: backend y E2E PASS; Docker daemon sigue no disponible |
| T08 | P1 | Sustituir placeholders por entregas cliente acotadas: establecimientos, documentos, archivos, pagos | Pendiente / sin asignar |
| T09 | P2 | Retención por usuario con username único y programación observable; activación transaccional y SMTP fail-closed fuera de dev | Parcial: activación transaccional probada en rama de seguridad. Retención y SMTP pendientes |
| T10 | P2 | Limpiar dependencias versionadas y revisar frontend/.env sin divulgar contenido; no borrar historial ni rotar sin evidencia | Pendiente / sin asignar |
| T11 | P2 | Unificar marca Family, revisar políticas enlazadas, textos, móvil, accesibilidad y SEO | Pendiente / sin asignar |
| T12 | P2 | Definir catálogo, contratos, tareas, renovaciones y alcance de servicios con negocio | Pendiente / Pablo + implementador por asignar |
| T13 | P1 | Endurecer validación de DATABASE_URL_TEST por URL parseada, nombre real y host permitido; rechazar producción | Implementado y probado en fix/invitations-session-revocation / Codex; solo loopback y nombre terminado en _test |
| T14 | P1 | Documentar y preparar la salida: Railway ejecuta `prisma migrate deploy` al arrancar, por lo que un merge a main aplica ambas migraciones en producción y fuerza nuevo login. Checklist previo: backup verificado, ventana, comunicación a usuarios | Pendiente / sin asignar. Hallazgo 1 de revisión R01 (Claude) |
| T15 | P1 | Restringir `inviteLink` en `/api/admin/invites` (hoy un CLIENT_ADMIN puede activar la cuenta del invitado) y SMTP fail-closed fuera de dev (el fallback registra enlaces en logs) | Pendiente de decisión D11 / Pablo. Hallazgo 2 R01 |
| T16 | P2 | Normalizar email en login y resend-invite (invitación ya guarda minúsculas: login con mayúsculas devuelve 401); revisar duplicados que difieran solo en mayúsculas con consulta de solo lectura | Pendiente / sin asignar. Hallazgos 3 y 7 R01 |
| T17 | P2 | Respuesta uniforme en invitaciones para no revelar si un email existe en otra empresa (403/400/200 distinguibles por CLIENT_ADMIN) | Pendiente / sin asignar. Hallazgo 4 R01 |
| T18 | P2 | Manejo global de 401 en frontend (limpiar sesión y redirigir) y reintento anónimo del consentimiento cuando el token está revocado | Pendiente / sin asignar. Hallazgo 5 R01 |
| T19 | P2 | Flujo para corregir la empresa de una invitación pendiente (p. ej. cancelar y reinvitar), ahora bloqueado con 403 también para PLATFORM_ADMIN | Pendiente de decisión D12 / Pablo. Hallazgo 6 R01 |
| R01 | — | Revisión de T02/T03/T13 (Claude) sobre `4ad7b908` | Terminada: sin P0; hallazgos en comunicacion-ia.md. Revisión de otro agente pendiente |

## Datos aún no confirmados

Proveedor y URL de producción, equivalencia de su commit con main, destino/responsable de leads, capacidad operativa por servicio, reglas de saldo y conciliación, almacenamiento documental, roles de negocio adicionales, volúmenes, plazos y alcance de lanzamiento. Consultar fuentes conectadas disponibles antes de pedir información al usuario. Solicitar solo datos restantes, nunca secretos en chats o Markdown.
