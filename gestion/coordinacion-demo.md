# Coordinación preview de dashboards — 2026-11-04

Codex toma la preparación de una demo interactiva de administrador/cliente solicitada por Pablo, sin producción. Rama aislada `codex/dashboard-demo` desde landing publicada `4a2f2c2e9893bac3fca3acc9614a3ceb40e32f1e`. No modifica ni integra cambios nuevos del otro checkout (`5541d5ee`, establecimientos), que continúa con su propia rama.

Reserva: adaptador de datos ficticios exclusivo de demo, arranque condicionado, aviso/accesos/reinicio de demo, build preview, pruebas de flujos y gestion. Conserva las pantallas reales de la base; sin backend/DB/SMTP nuevos ni conexión operativa a producción. Solo preview manual Vercel autorizado y push de esta rama, sin PR/promoción/main.

Criterio: accesos ficticios admin/cliente, resúmenes/facturas/pagos/servicios/documentos interactivos, cambios locales reiniciables, roles de lectura, aislamiento del navegador respecto a cualquier API real y build normal sin demo. La simulación no valida ni reemplaza la seguridad/persistencia del backend real. Evidencia y URL al terminar en comunicacion-ia.md y preview-dashboards.md.
