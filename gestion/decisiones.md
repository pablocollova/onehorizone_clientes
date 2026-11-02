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
| D11 | 2026-11-02 | PROPUESTO (Claude) | Devolver `inviteLink` solo a PLATFORM_ADMIN (o solo fuera de producción) y no registrar enlaces en logs de producción. Evidencia: sonda R01, CLIENT_ADMIN activa la cuenta invitada (200). Alternativas: mantener por compatibilidad; eliminar el enlace de la respuesta. Impacto: `Invite.jsx` solo lo usa PLATFORM_ADMIN. Decide Pablo. |
| D12 | 2026-11-02 | PROPUESTO (Claude) | Mantener "la invitación no transfiere empresa" y añadir cancelación de invitación pendiente para corregir errores de PLATFORM_ADMIN. Evidencia: sonda R01, reintento con otra empresa devuelve 403. Alternativa: permitir transferencia solo a PLATFORM_ADMIN con auditoría. Decide Pablo. |

Nuevas decisiones deben incluir autor, evidencia, alternativas, impacto y estado. No reemplazar una decisión del usuario por una preferencia de un asistente. Registrar cambios como nueva entrada que sustituye explícitamente la anterior.

## Aclaraciones de Pablo — 2026-11-02, después de 2cf4a6e2

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| D13 | 2026-11-02 | DECIDIDO-USUARIO | Tres modalidades: factura del proveedor pagada directamente por cliente; factura pagada por One Horizon y reembolsable por cliente, además del honorario si corresponde; facturas de servicios propios. Una factura externa no es automáticamente deuda con One Horizon. Autor: Pablo, ejemplos de luz en chat. Ver modelo-operativo.md |
| D14 | 2026-11-02 | DECIDIDO-USUARIO | Cuatro roles de negocio: One Horizon admin/user y cliente admin/user. Admin opera dentro de su ámbito; user inicialmente lectura operativa. El código base tenía tres roles; se añade PLATFORM_USER sin renombrar los existentes ni modificar usuarios reales. Autor: Pablo. Alcance de nuevos módulos no equivale a endpoints implementados |
| D15 | 2026-11-02 | DECIDIDO-USUARIO | Cuenta corriente con pagos/imputaciones y estados en proceso, revisión y confirmado. Cliente_admin también confirma e imputa pagos de su empresa, además de One Horizon admin. La respuesta explícita de Pablo descarta reservar estas acciones solo a One Horizon; no se autoriza acceso entre empresas. Conciliación y reversión detalladas siguen por definir |
| D16 | 2026-11-02 | DECIDIDO-USUARIO | Catálogo ampliable ofrecido al cliente y circuito necesidad→presupuesto de proveedor presentado por One Horizon→aceptación cliente→fecha de trabajo→factura. Autor: Pablo, ejemplo electricista. Versionado, estados exactos y contratos recurrentes son diseño propuesto en modelo-operativo.md |
| D17 | 2026-11-02 | DECIDIDO-USUARIO | Alta iniciada por administrador, activación por correo para establecer contraseña y recuperación desde login por correo. Autor: Pablo. Autoriza desarrollo/pruebas ficticias, no envíos reales; no resuelve D11/D12 |
| D18 | 2026-11-02 | DECIDIDO-USUARIO | Monedas EUR, GBP, USD; si el original es distinto de EUR, mostrar moneda y equivalente complementario en EUR. La segunda respuesta de Pablo corrige el destino inicialmente escrito como USD. Fuente/fecha/tasa de conversión y liquidación entre monedas siguen propuestas |

La pregunta anterior sobre ISSUED/OVERDUE y rechazo de excesos NO fue confirmada: Pablo explicó el negocio en su lugar. El reconocimiento de deudas/reembolsos, sobrantes/reversiones y conciliación se detalla como propuesta hasta definir cada comportamiento. D11 y D12 permanecen sin aprobación. [Modelo operativo](modelo-operativo.md) separa acuerdos, evidencia y diseño técnico.
