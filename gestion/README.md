# Gestión compartida de One Horizon

Fecha: 2026-11-02 (Europe/Paris). Repositorio canónico: `pablocollova/onehorizone_clientes`.
Base auditada: `79a05590be4367a108f54aafaad63bef3c2cceab` (`main` al clonar).

Este directorio es la memoria versionada para Pablo, Codex, OpenCode, ChatGPT y Claude. Leer primero este índice y luego comunicación, pendientes y decisiones. La conversación anterior aporta intención; el código aporta evidencia de implementación.

| Documento | Contenido |
| --- | --- |
| [Visión](vision.md) | Dirección comercial y límites |
| [Diagnóstico](diagnostico.md) | Hallazgos y evidencia |
| [Arquitectura](arquitectura.md) | Estado técnico y evolución propuesta |
| [Módulos](modulos.md) | Inventario funcional real |
| [Interfaz de dashboards](interfaz-dashboards.md) | Administración/clientes, integración de facturas, pagos, servicios y documentos |
| [Documentación privada](documentacion-privada.md) | Carga/organización/descarga, permisos, almacenamiento y límites |
| [Cuenta corriente y pagos](cuenta-corriente-pagos.md) | Flujos implementados, saldos, cotizaciones, API y límites de datos históricos |
| [Modelo operativo](modelo-operativo.md) | Aclaraciones de Pablo, modalidades financieras, roles y evolución propuesta |
| [Entregas operativas](entregas-operativas.md) | Alcance autorizado, secuencia, entrega T04 y decisiones pendientes |
| [Roadmap](roadmap.md) | Secuencia y criterios de aceptación |
| [Decisiones](decisiones.md) | Acuerdos y propuestas sin aprobar |
| [Pendientes](pendientes.md) | Trabajo accionable y bloqueos |
| [Comunicación IA](comunicacion-ia.md) | Protocolo y registro de traspasos |
| [Publicación GitHub](publicacion-github.md) | Integraciones verificadas y barreras contra despliegue |
| [Invitaciones y sesiones](seguridad-invitaciones-sesiones.md) | Corrección, pruebas y límites de la rama de seguridad |
| [T16: email](t16-normalizacion-email.md) | Normalización en login/reenvío y pruebas de regresión |

## Convenciones de evidencia

- **VERIFICADO-CÓDIGO**: observado en los archivos de la base indicada; no demuestra funcionamiento desplegado.
- **VERIFICADO-EJECUCIÓN**: comprobación ejecutada en esta sesión, con resultado registrado.
- **DECIDIDO-USUARIO**: instrucción explícita de Pablo.
- **PROPUESTO**: diseño o solución a evaluar; no implementado ni aprobado por defecto.
- **PENDIENTE**: falta evidencia o ejecución. No convertir una afirmación histórica en prueba actual.

No registrar secretos, tokens, datos personales de clientes ni exportaciones. No modificar producción, ejecutar migraciones remotas, desplegar o hacer merge a `main` sin aprobación explícita. Publicar ramas también requiere comprobar que no active un despliegue contrario a esta restricción.
