# Publicación de documentación sin despliegue

Revisión: 2026-11-02. Rama: `docs/gestion-diagnostico-b2b`.

## VERIFICADO-EJECUCIÓN

- GitHub: `main` sigue en `79a05590be4367a108f54aafaad63bef3c2cceab`; la rama documental aún no existe remotamente en la comprobación previa.
- API GitHub: cero workflows registrados y cero webhooks propios del repositorio. Esto no descarta GitHub Apps.
- Vercel: proyecto `onehorizone-clientes`, ID `prj_PaL1SeKAg9xiCWr0xO5rDe2WpvyI`, equipo `pablocollovas-projects`. La consulta filtrada por repositorio devuelve un proyecto.
- Último despliegue de producción consultado: `dpl_Fj8wRMoTEndGWFcsYNxUA79JBKYC`, READY, commit `79a05590be4367a108f54aafaad63bef3c2cceab`, rama main. Alias incluyen `onehorizon.es` y `www.onehorizon.es`.
- GitHub registra tanto producción como previews de Vercel y despliegues históricos de `railway-app[bot]` en tres entornos: `divine-emotion / production`, `exemplary-analysis / production`, `strong-wholeness / production`.
- Railway, comprobado por interfaz tras inicio de sesión del usuario: `strong-wholeness` tiene un servicio vinculado a este repositorio, raíz de repositorio y rama de producción `main`; `divine-emotion` tiene un servicio vinculado, raíz `/backend` y rama de producción `main`. Ambos tienen autodeploy para esa rama y acceso limitado por trial expirado; no se cambiaron ajustes. El servicio de `strong-wholeness` muestra build fallido histórico y el de `divine-emotion` está offline sin despliegue activo.
- `divine-emotion` muestra únicamente entorno production en su selector. `exemplary-analysis` no tiene servicios y registra el antiguo servicio eliminado. No se abrirá PR, por lo que esta tarea tampoco solicita entornos de PR.

## Protección preparada en esta rama

Se añaden `vercel.json` y `frontend/vercel.json` con `git.deploymentEnabled` false únicamente para `docs/gestion-diagnostico-b2b`. Se cubren la raíz del repositorio y la raíz frontend sin depender de conocer cuál usa el proyecto. No se cambia código funcional ni configuración remota del proveedor. No hacer merge de esta rama sin revisar explícitamente estos archivos de protección.

La opción oficial evita despliegues automáticos de la rama indicada; las ramas no especificadas mantienen su comportamiento. Fuente: https://vercel.com/docs/project-configuration/git-configuration

## Estado de publicación

Comprobación previa completada: los servicios Railway revisados siguen `main` y la rama documental está excluida de autodeploy de Vercel por configuración versionada. El usuario autorizó publicar únicamente esta rama, sin despliegue. No se confía en `[skip ci]` como garantía universal entre proveedores. No se creará PR ni se actualizará main en esta tarea. El registro de comunicación contiene el resultado de la publicación y la verificación posterior.

Tras publicar, comprobar SHA remoto, ausencia de nuevos despliegues para la rama/commit en GitHub y Vercel, y que producción sigue apuntando al despliegue anterior. Registrar resultados con fecha; la ausencia observada de eventos no garantiza que una futura modificación de automatismos no los active.
