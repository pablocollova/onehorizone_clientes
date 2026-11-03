# Inventario de módulos

Todo estado de implementación siguiente es VERIFICADO-CÓDIGO; no es certificación de ejecución ni de producción.

| Módulo | Existe | Falta / límite |
| --- | --- | --- |
| Landing | Hero, públicos, servicios, ventajas, paquetes/proceso, teaser privado, contacto, ES/EN | Captación real; revisión conversión, móvil, accesibilidad y medición |
| Family | Página `/private-services` y teaser separado | Nombre comercial Family no unificado; alcance de oferta por validar |
| Acceso | Login, activación, reenvío, JWT, guards de layouts | Revocación y estado de usuario en solicitudes; endurecer invitaciones |
| Dashboard cliente | Consulta `/api/dashboard`, saldos y documentos recientes | Porcentajes estáticos; descarga y View All sin acciones; saldo no descuenta pagos |
| Estado de cuenta | Pantalla `/app/statement` | Filas de ejemplo fijas; exportar/filtrar sin acciones; sin conexión API |
| Documentos / archivos | Modelo Document y listado reciente | `/app/documents` y `/app/files` son PlaceholderPage; falta upload, almacenamiento y descarga autorizada |
| Establecimientos | Modelo Location y API lectura scoped | `/app/locations` es PlaceholderPage; falta gestión operativa |
| Facturas | Lectura scoped `/invoices`; backoffice lista, crea, modifica | Validación de importes, estados y relaciones; no implica facturación fiscal completa |
| Pagos | Modelo Payment | `/app/payments` es PlaceholderPage; no se encontró flujo de cobro/conciliación |
| Clientes y usuarios | Backoffice lista clientes/usuarios, crea clientes e invita | No afirmar CRUD completo; revisar ciclo de baja y permisos |
| Servicios operativos | Backoffice ServiceRecords con API lista/alta/modificación | No equivale a catálogo, contrato o suscripción; falta vista cliente y flujo de tareas |
| Contratos, tareas y renovaciones | No encontrados como módulos dedicados | PROPUESTO: definición funcional antes de modelo y pantallas |
| Privacidad | Banner, preferencias, acceso/export/rectificación/baja, tablas GDPR y auditoría | No constituye auditoría legal; revisar revocación y retención |
| Calidad | Vitest frontend/backend, Supertest, Playwright, scripts manuales | Ejecución actual por registrar; resultados históricos no garantizan estado actual |

Fuentes: `frontend/src/App.jsx`, `frontend/src/pages/`, `frontend/src/sections/`, `backend/src/routes/`, `backend/prisma/schema.prisma`, `e2e/`.

## Actualización en rama operativa, 2026-11-02 (Codex)

Base T16 70190d86; rama codex/t04-operational-integrity. Se incorpora una primera vista administrativa de conteos reales en /app/admin/overview (API /api/admin/overview, solo PLATFORM_ADMIN), menú Overview y entrada de /app/admin. Se validan relaciones e inputs en las escrituras administrativas existentes de facturas/trabajos. Detalle, límites y secuencia en [entregas operativas](entregas-operativas.md). El dashboard financiero cliente, estado de cuenta, pagos y almacenamiento documental no cambian en esta entrega; no se consideran terminados. Esta entrada actualiza el inventario histórico sin reescribirlo.

## Cuarto rol y alcance ampliado (2026-11-02, Codex)

PLATFORM_USER es el cuarto rol implementado en la rama local: lector interno global de los listados y resumen existentes, sin escrituras administrativas/invitaciones. CLIENT_USER sigue limitado a su empresa. El alcance confirmado de cliente_admin incluye confirmar/imputar pagos y aceptar presupuestos de su empresa, pero esos módulos aún están pendientes. Catálogo, presupuestos versionados, pagos con estados/imputaciones y recuperación de contraseña no se consideran implementados por esta ampliación de roles. Ver modelo-operativo.md y D13-D18.

## Entrega cuenta corriente/pagos manuales — 2026-11-02

Implementados en rama local: estado de cuenta real y pagos, estados En proceso/Revisión/Confirmado, confirmación e imputación por PLATFORM_ADMIN y CLIENT_ADMIN scoped, saldos por moneda/destinatario, saldo neto de cuenta y equivalentes EUR con cotización manual trazable. El dashboard cliente usa estos datos y retira tendencias ficticias. Los demás placeholders no quedan cerrados. Históricos Payment/PAID no se convierten en recibos confirmados; se advierten como revisión pendiente. Alcance exacto/API/límites en [cuenta corriente y pagos](cuenta-corriente-pagos.md).

## Documentación privada implementada en rama — 2026-11-03

/app/documents y /app/files ya no son placeholders; /app/admin/documents añade selector de empresa. Ambos administradores cargan/organizan dentro de su ámbito, lectores descargan sin escritura; factura/pago enlazan sus documentos. Bytes en filesystem privado explícito, claves opacas e integridad, sin rutas físicas en API. Los registros LEGACY no se convierten automáticamente en archivos descargables. No incluye firma/contratos operativos ni gestión de establecimientos. Detalle en documentacion-privada.md y pruebas en comunicación.
