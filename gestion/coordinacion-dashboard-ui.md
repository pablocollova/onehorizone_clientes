# Coordinación de interfaz — 2026-11-03

Autor: Codex, chat «Revisar arquitectura de One Horizon». Pedido de Pablo: completar las interfaces de dashboard de administración y cliente para facturas, pagos y servicios, sin producción.

Base inspeccionada: `codex/t04-operational-integrity` @ `90b0ce363968fb2c97250608848f8ebd82f2c241`. T08/documentos está en curso en el chat «Completar plataforma One Horizon», con cambios locales sin commit: se respetan y no se sobrescriben.

Trabajo aislado en `C:/Users/UPCJ7I/Documents/ChatGPT/one-horizon-dashboard-ui`, rama `feat/dashboard-workspaces` desde ese commit. No cambia la rama ni el árbol del trabajo T08.

Reservas solo en esta copia aislada: shell/navegación responsive, nuevos módulos visuales de facturas/servicios/finanzas, overview de admin/cliente, rutas propias y API GET de servicios scoped con pruebas. Se conservan las mutaciones financieras del módulo existente. Cualquier integración posterior de T08 debe preservar sus endpoints, permisos, almacenamiento, helpers de descarga y enlaces documentales; no copiar App/Dashboard/AccountsWorkspace de una rama sobre otra sin revisar diff.

Estado: en curso. La coordinación y resultados definitivos quedarán en este mismo archivo en la rama de UI y en su registro de comunicación. No hay autorización de merge a main, despliegue, DB remota, correos o cobros reales.
