# Coordinación preview de dashboards — 2026-11-04

Codex toma la preparación de una demo interactiva de administrador/cliente solicitada por Pablo, sin producción. Rama aislada `codex/dashboard-demo` desde landing publicada `4a2f2c2e9893bac3fca3acc9614a3ceb40e32f1e`. No modifica ni integra cambios nuevos del otro checkout (`5541d5ee`, establecimientos), que continúa con su propia rama.

Reserva: adaptador de datos ficticios exclusivo de demo, arranque condicionado, aviso/accesos/reinicio de demo, build preview, pruebas de flujos y gestion. Conserva las pantallas reales de la base; sin backend/DB/SMTP nuevos ni conexión operativa a producción. Solo preview manual Vercel autorizado y push de esta rama, sin PR/promoción/main.

Criterio: accesos ficticios admin/cliente, resúmenes/facturas/pagos/servicios/documentos interactivos, cambios locales reiniciables, roles de lectura, aislamiento del navegador respecto a cualquier API real y build normal sin demo. La simulación no valida ni reemplaza la seguridad/persistencia del backend real. Evidencia y URL al terminar en comunicacion-ia.md y preview-dashboards.md.

Estado final: publicado y verificado. Código `46fc9c6384ae771ad4434d99b5acf1d642781d13`; preview `dpl_3GAVSPrTfj3p8WBBzv5wyDAX2TVh`, READY, target null. URL base https://onehorizone-clientes-2rlpz6g5i-pablocollovas-projects.vercel.app/login . Se entregó enlace temporal a Pablo sin versionar su token. Cuatro E2E locales PASS; verificación remota admin/cliente/PDF/aislamiento PASS. Lint y builds demo/normal PASS; build demo productivo bloqueado y sin adapter/credenciales en build normal. La suite completa de frontend no se declara pasada: tuvo timeouts y la repetición serial quedó sin completar; detalles en comunicación.

Solo se creó el preview citado. Durante la tarea apareció otro despliegue productivo de la landing (`dpl_AGLt7XtcZuzak9HMoE7UAuMrwJnx`, SHA61407ff9), fuera de las acciones de este chat; se informó a Pablo y no se intervino. No atribuir a esta demo cambios productivos concurrentes. No se tocó main, backend, DB, dominios ni ramas/servidores de otros chats.
