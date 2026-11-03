# Coordinación de interfaz — 2026-11-03

Autor: Codex, chat «Revisar arquitectura de One Horizon». Pedido de Pablo: completar las interfaces de dashboard de administración y cliente para facturas, pagos y servicios, sin producción.

Base inspeccionada: `codex/t04-operational-integrity` @ `90b0ce363968fb2c97250608848f8ebd82f2c241`. T08/documentos está en curso en el chat «Completar plataforma One Horizon», con cambios locales sin commit: se respetan y no se sobrescriben.

Trabajo aislado en `C:/Users/UPCJ7I/Documents/ChatGPT/one-horizon-dashboard-ui`, rama `codex/dashboard-workspaces` desde ese commit. No cambia la rama ni el árbol del trabajo T08.

Reservas solo en esta copia aislada: shell/navegación responsive, nuevos módulos visuales de facturas/servicios/finanzas, overview de admin/cliente, rutas propias y API GET de servicios scoped con pruebas. Se conservan las mutaciones financieras del módulo existente. Cualquier integración posterior de T08 debe preservar sus endpoints, permisos, almacenamiento, helpers de descarga y enlaces documentales; no copiar App/Dashboard/AccountsWorkspace de una rama sobre otra sin revisar diff.

Estado: implementación y pruebas locales terminadas; cierre de validación/publicación en curso. Se integró la entrega documental ya confirmada del otro Codex, `03f3d4c6a1dc7a2f76609504331c1a18ea62f8dc`, mediante merge en la copia aislada. Se preservaron rutas, enlaces, helpers, permisos y esquema de documentos. No se editó su código ni se cambió la rama en el checkout original.

Entrega detallada en `gestion/interfaz-dashboards.md` y registro final en `gestion/comunicacion-ia.md`, rama `codex/dashboard-workspaces`. Backend 162/162 y frontend 60/60 PASS; lint y build comprobados. La UI incluye resumen admin/cliente, facturas con alta/edición/filtros, servicios con alta/estado y cuenta corriente organizada por secciones. Documentos privados T08 integrados. T23 (catálogo/solicitud/presupuesto/aceptación) sigue pendiente; no declararlo implementado por esta interfaz.

La rama tiene exclusión exacta de Vercel en ambas raíces. No hay autorización de merge a main, despliegue, DB remota, correos o cobros reales. Las otras IA deben consultar la rama de UI y su SHA remoto final antes de continuar, no asumir que estos cambios están en main ni en la rama original del otro Codex.
