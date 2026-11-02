# Decisiones

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| D01 | 2026-11-02 | DECIDIDO-USUARIO | Usar repositorio existente de pablocollova; nombre real verificado `onehorizone_clientes`. Evita duplicar portal y backend. |
| D02 | 2026-11-02 | DECIDIDO-USUARIO | B2B-first; One Horizon Family secundaria. |
| D03 | 2026-11-02 | DECIDIDO-USUARIO | PDF conceptual; libertad de estrategia, estructura y diseño. |
| D04 | 2026-11-02 | DECIDIDO-USUARIO | Preservar funciones y no desplegar ni cambiar producción sin aprobación. |
| D05 | 2026-11-02 | DECIDIDO-USUARIO | Memoria compartida versionada en gestion y comunicación Codex/OpenCode/ChatGPT. |
| D06 | 2026-11-02 | PROPUESTO | Mantener stack y rutas actuales; evolucionar por módulos y pruebas de regresión. |
| D07 | 2026-11-02 | PROPUESTO | Resolver aislamiento/autenticación antes de ampliar capacidades. |
| D08 | 2026-11-02 | PROPUESTO | Conservar `/private-services`; adoptar marca Family y decidir redirección solo tras revisar enlaces/SEO. |
| D09 | 2026-11-02 | PROPUESTO | Separar autorización de implementar, publicar rama y desplegar; inspeccionar automatismos antes de publicación remota. |
| D10 | 2026-11-02 | VERIFICADO-CÓDIGO, en rama | Revocación global por cuenta mediante sessionVersion; trigger invalida ante cambios de identidad. Dos migraciones y nuevo login de JWT anteriores son requisitos para una futura salida, todavía no autorizada. Ver seguridad-invitaciones-sesiones.md. |

Nuevas decisiones deben incluir autor, evidencia, alternativas, impacto y estado. No reemplazar una decisión del usuario por una preferencia de un asistente. Registrar cambios como nueva entrada que sustituye explícitamente la anterior.
