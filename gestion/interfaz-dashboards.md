# Dashboard de administración y clientes

Fecha: 2026-11-03, Europe/Paris. Responsable: Codex, chat «Revisar arquitectura de One Horizon».
Rama: `codex/dashboard-workspaces`. Base de interfaz: `90b0ce363968fb2c97250608848f8ebd82f2c241`. Se integró mediante merge revisado la entrega documental del otro Codex, `03f3d4c6a1dc7a2f76609504331c1a18ea62f8dc`, sin editar su checkout ni cambiar su rama.

## VERIFICADO-CÓDIGO

- Navegación compartida con contexto de administración/empresa, resumen, facturas, pagos, servicios y documentos; menú móvil, estados activos, cierre de sesión real y controles por rol. Empresas, usuarios, invitaciones y privacidad conservan sus funciones existentes. CSS limitado al portal; la landing no se rediseñó en esta entrega.
- Administración: resumen de conteos reales, facturas con filtros por empresa/estado/búsqueda, alta y edición con céntimos exactos y validaciones del backend; servicios con búsqueda/empresa/estado, alta y actualización de estado. No hay suma global de monedas ni conteo de facturas presentado como deuda.
- Clientes: resumen propio con saldos por moneda/destinatario, alertas de históricos, facturas, trabajos y acceso documental. La nueva consulta de servicios impone la empresa en servidor y omite costes internos/modalidad financiera a roles cliente. Un filtro de empresa ajena recibe 403.
- Cuenta corriente: se reutilizan las mutaciones financieras existentes. Se organiza en Pagos e imputaciones, Facturas de cuenta, Monedas y adelantos e Historial, con filtros de pagos. Siguen disponibles registro → revisión → confirmación → imputación, EUR/GBP/USD y cotización manual complementaria, adelantos de proveedor y auditoría; sin cobrar ni transferir dinero.
- Documentos: se conservan endpoints, permisos, migración y helpers del commit T08. Enlaces desde facturas y recibos abren documentos filtrados. Administradores cargan/organizan en su ámbito; lectores descargan. Adjuntar un archivo no confirma ni imputa un pago. Los archivos históricos sin bytes confiables continúan identificados como no descargables.
- Roles: PLATFORM_ADMIN escribe global; PLATFORM_USER consulta global; CLIENT_ADMIN administra pagos/documentos propios; CLIENT_USER consulta su empresa. Los clientes no crean facturas ni servicios administrativos. El backend conserva la autorización, aunque alguien manipule la interfaz.

## Archivos y coordinación

`frontend/src/layouts/WorkspaceLayout.jsx`, `frontend/src/workspace.css`, componentes en `frontend/src/components/workspace/`, páginas en `frontend/src/pages/workspace/`, organización de `AccountsWorkspace.jsx` y rutas de `App.jsx`. Nuevas lecturas mínimas en `backend/src/routes/workspace.js` y sus pruebas; no se cambia la lógica financiera ni de invitaciones. La integración documental conserva la entrega y las notas del otro Codex.

Antes de continuar, leer este documento, `comunicacion-ia.md`, `cuenta-corriente-pagos.md` y `documentacion-privada.md`. Revisar el diff contra los dos commits base; no sustituir App/AccountsWorkspace con una versión antigua. El checkout original permanece en la rama del otro Codex; este trabajo está aislado en `one-horizon-dashboard-ui`.

## Verificación local

La evidencia final, comandos y resultados se registran en la entrada de entrega de `comunicacion-ia.md`. PostgreSQL, API y frontend exclusivos de esta tarea, en loopback; datos ficticios y correo simulado. Se aplicaron las diez migraciones solo en una base nueva de pruebas. El navegador comprueba UI → API → persistencia para facturas, servicios, pagos y documentos; las capturas temporales se revisan visualmente y no se versionan.

Para repetir: usar una base local nueva cuyo nombre termine en `_test`, aplicar migraciones y generar Prisma, ejecutar backend/frontend y preparar datos ficticios con seed. No usar entornos o credenciales reales. En Windows/Node de esta sesión, Vitest frontend requiere `NODE_OPTIONS=--no-experimental-webstorage`; no es un cambio de la aplicación. `playwright.workspace.config.cjs` exige URLs HTTP loopback, usa servidores ya iniciados y ejecuta `workspace-ui`, `accounts` y `documents`. Pasar `VITE_API_URL` de la API local y, si corresponde, `E2E_BASE_URL` y `E2E_CHROMIUM_PATH` locales. La suite histórica E2E completa no se considera validada por estos seis recorridos.

## PENDIENTE / PROPUESTO

- T23: catálogo, solicitud, presupuesto, aceptación y agenda contractual siguen pendientes. «Servicios» en esta entrega administra registros de trabajo existentes; no representa ese ciclo comercial completo.
- T08: gestión de establecimientos propia sigue pendiente; no se presenta su placeholder como funcionalidad entregada.
- T24/T25: conciliación histórica, reversiones/devoluciones, almacenamiento documental persistente con backup y archivos históricos. Ver los límites de los módulos originales; no se inventan reglas contables.
- T22 y D11/D12 no se modifican. La autorización para esta interfaz no aprueba otras decisiones de seguridad o negocio.
- Build advierte de un bundle principal superior a 500 kB; futura división por rutas propuesta, sin bloquear el build actual.
- Revisión independiente de otra IA pendiente. Esta entrega no autoriza merge a main, despliegue, cambios remotos de DB o almacenamiento, correos ni cobros reales. La rama está excluida explícitamente en ambos `vercel.json`.
