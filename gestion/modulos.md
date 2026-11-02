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
