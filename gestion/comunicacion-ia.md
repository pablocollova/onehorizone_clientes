# Comunicación entre Codex, OpenCode, ChatGPT y Claude

## Protocolo operativo

1. Leer `gestion/README.md`, visión, decisiones, últimos traspasos y pendientes antes de trabajar. Revisar instrucciones del repositorio si existen y comprobar rama, commit y cambios locales.
2. Declarar tarea, responsable, rama, base, archivos a tocar y criterio de aceptación. Una sola persona/agente edita cada conjunto de archivos a la vez. No sobrescribir cambios ajenos ni hacer reset destructivo.
3. Trabajar en rama aislada. El código es evidencia de implementación; pruebas ejecutadas son evidencia de comportamiento. Distinguir ambos de propuestas y mensajes históricos.
4. Al terminar, actualizar pendientes, decisiones si aplica y agregar traspaso con archivos, pruebas exactas, resultado, bloqueos y próximo paso. Conservar historial; no reescribir entradas de otro agente.
5. Otro agente revisa el diff y la evidencia cuando se le asigne revisión; este protocolo no inicia agentes automáticamente. Si dos ramas divergen, reconciliar mediante revisión del diff, sin force-push ni elegir una versión a ciegas.
6. Cualquier asistente sin acceso al repositorio, incluidos ChatGPT y Claude, recibe estos archivos o commit/enlaces que pueda consultar. Si no puede acceder, informa qué conexión falta. No afirmar sincronización automática ni memoria compartida entre productos. Cada asistente confirma la rama y el commit que realmente leyó.
7. Publicar en GitHub solo cuando se conozcan los efectos de automatización. No merge a main, despliegues, migraciones remotas, seeds sobre datos reales, cambios de secretos ni cambios de producción sin aprobación explícita para el alcance concreto. No enviar correos o mensajes reales como parte de una prueba.

## Incorporación y coordinación de Claude

Claude participa con las mismas reglas que Codex, OpenCode y ChatGPT; no tiene permisos especiales ni autorización para desplegar. Su incorporación al protocolo no implica que ya esté conectado o haya revisado el código.

- Punto de partida actual: `fix/invitations-session-revocation`. Leer README, comunicación, informe de seguridad, pendientes, decisiones, arquitectura y visión. Comprobar el HEAD remoto antes de comenzar; main todavía no incorpora las correcciones de esta rama.
- Primer encargo propuesto para Claude: revisión de las correcciones de permisos, invitaciones, activación y revocación, incluidas las dos migraciones. Registrar hallazgos priorizados con archivo/línea, evidencia y pruebas ejecutadas o pendientes. Es un encargo propuesto, no una tarea ya tomada o una revisión realizada.
- Antes de editar, registrar tarea tomada, autor, rama, commit base, archivos reservados y criterio de aceptación. Una solicitud de revisión no autoriza cambios funcionales. Si hay otro responsable activo sobre esos archivos, coordinar el traspaso antes de modificarlos.
- Para implementar cambios autorizados, crear una rama propia desde la base acordada y referenciar el ID de tarea de pendientes. Las exclusiones Vercel existentes cubren nombres concretos: verificar y bloquear autodeploy de cada rama nueva antes de publicarla. No copiar la protección de otra rama dando por hecho que alcanza.
- Registrar las revisiones y respuestas bajo el nombre real del asistente: Claude, Codex, OpenCode o ChatGPT. Citar rama y SHA revisados, separar hallazgos de propuestas y no declarar resuelto un pendiente solo porque otro chat lo afirma.
- GitHub y los archivos de gestion son el canal común. Leer novedades al empezar y antes de entregar; agregar un traspaso al finalizar. No hay comunicación directa ni sincronización automática entre chats. Pablo conserva la decisión de negocio y la aprobación de producción.

## Plantilla de traspaso

```text
Fecha/hora y zona:
Autor (Codex / OpenCode / ChatGPT / Claude / humano):
Tarea y estado (tomada / en curso / revisión / terminada / bloqueada):
Rama y commit base / resultado:
Objetivo y archivos:
VERIFICADO-CÓDIGO:
VERIFICADO-EJECUCIÓN (comando, entorno, resultado):
PROPUESTO (sin implementar):
Decisiones relacionadas:
Riesgos, bloqueos y publicación/despliegue:
Próxima acción y responsable:
```

## Registro

### 2026-11-02 - Codex - auditoría y base documental

- Base: `79a05590be4367a108f54aafaad63bef3c2cceab`. Rama local: `docs/gestion-diagnostico-b2b`.
- Objetivo: recuperar contexto, auditar landing/portal/backoffice/API/despliegue y documentar estrategia y plan. Se agregan solo archivos de gestion; código funcional sin modificar.
- VERIFICADO-CÓDIGO: inventario y H01-H11 en diagnóstico. No se han corregido esos hallazgos ni reproducido sus consecuencias en DB.
- VERIFICADO-EJECUCIÓN: clonación y consulta GitHub; contexto recuperado; PDF de 3 páginas extraído/renderizado/consultado; Docker daemon no accesible.
- Validación: `npm ci --prefix frontend --ignore-scripts --no-audit --no-fund` completado; `npm run lint --prefix frontend` PASS. `npm run test:frontend` inicial falló 32/32 con Node v26.10.0 por localStorage no disponible. Repetido con `$env:NODE_OPTIONS='--no-experimental-webstorage'; npm run test:frontend`: 7 archivos, 32/32 PASS. Opción limitada al proceso de prueba; ningún cambio funcional. Nueve documentos con enlaces internos válidos; revisión de whitespace PASS, solo avisos LF/CRLF.
- Producción: sin accesos a DB, migraciones, seed o despliegue. Publicación remota pendiente hasta verificar automatismos. No se afirma que estos archivos ya estén visibles para otros asistentes en GitHub.
- Próximo paso propuesto: T01, entorno aislado T07/T13 y reproducción T02/T03 antes de ampliar módulos. Responsable pendiente de asignación.

### 2026-11-02 - Codex - publicación documental autorizada

- El usuario autorizó subir `docs/gestion-diagnostico-b2b` sin desplegar ni tocar producción, y abrió sesión Railway para revisar configuración.
- Verificación previa en `publicacion-github.md`: Vercel identificado; Railway vinculado a main en los dos servicios existentes revisados; proyecto histórico exemplary-analysis sin servicios; GitHub sin workflows/webhooks propios.
- Se incluyen dos archivos de protección Vercel, en raíz y frontend, que excluyen únicamente esta rama de autodeploy. No cambian lógica de aplicación ni ajustes remotos. No abrir PR, hacer merge o actualizar main.
- Push completado: rama remota `docs/gestion-diagnostico-b2b`, primer SHA publicado `3300b5773ae7c34863111cfda21c80632e0f1327`; tracking local configurado. Documentación disponible en https://github.com/pablocollova/onehorizone_clientes/tree/docs/gestion-diagnostico-b2b/gestion
- Comprobación posterior al primer push: SHA remoto coincide; main permanece en `79a05590be4367a108f54aafaad63bef3c2cceab`; API GitHub devuelve cero deployments para el commit; Vercel devuelve cero deployments para la rama y conserva `dpl_Fj8wRMoTEndGWFcsYNxUA79JBKYC` como último despliegue de producción. No se creó PR, no se cambiaron ajustes remotos y no se ejecutaron migraciones, seed ni despliegues.
- Se publica también este registro mediante un commit documental adicional con las mismas protecciones. Comprobar nuevamente después de cada futuro push; no asumir que `[skip ci]` protege todos los proveedores.

### 2026-11-02 - Codex - invitaciones y sesiones

- Tareas T02/T03 y barrera T13 implementadas en `fix/invitations-session-revocation`, base `f79c36377f81b924db43820fe5786cd9421b8e36`. Estado: listo para revisión, sin despliegue ni merge. Detalle completo en `seguridad-invitaciones-sesiones.md`.
- VERIFICADO-EJECUCIÓN: seis reproducciones fallan con código original y demuestran H01/H02; correcciones: 57/57 backend, 35/35 frontend, 9/9 E2E, lint frontend y Prisma validate PASS. PostgreSQL temporal local nuevo; SMTP desactivado. Ninguna prueba usa datos remotos.
- Cambios: servicio compartido de invitación con autorización por empresa y transacción, activación de uso único, verificación de estado/rol/empresa/version en DB, revocación global en logout/baja y trigger de invalidación ante cambios de identidad. Frontend muestra error/reintento si no se confirma revocación.
- Migraciones nuevas: sessionVersion y trigger; solo aplicadas localmente. Un despliegue futuro requiere ambas y nuevo login para todos los JWT anteriores. Rollout/producción no autorizados; no ejecutar db push como sustituto del SQL del trigger.
- Corrección incidental de prueba E2E GDPR: selector exacto de username; sin cambiar el producto. Dependencias se reinstalaron localmente para ejecutar pruebas; no se incluyen artefactos ni cambios de node_modules.
- Autodeploy: se mantiene exclusión de la rama documental y se añade exclusión exacta de esta rama en `vercel.json` y `frontend/vercel.json`. Railway revisado sigue main. Publicación a rama y verificación final se informan al cerrar; no abrir PR ni tocar main.
- Próxima acción: revisión de código y decisión de siguiente prioridad. H03 y demás pendientes siguen abiertos; una futura salida necesita aprobación explícita.
- Publicado: commit de implementación `14fe6e7838b84f66f4208882c24c4814b9b3ec21` en origin/fix/invitations-session-revocation. Verificación posterior: SHA remoto coincide, main sigue en `79a05590be4367a108f54aafaad63bef3c2cceab`, cero deployments GitHub para el SHA, cero workflows de la rama y cero deployments Vercel de la rama. Se publica este registro como commit documental adicional con la misma protección. API, frontend y PostgreSQL temporales detenidos al terminar; node_modules restaurado al estado versionado, sin cambios de dependencias en el commit.

### 2026-11-02 - Codex - incorporación de Claude al protocolo

- Solicitud de Pablo: incluir a Claude y publicar la documentación en la rama de trabajo, sin tocar producción.
- Base: `1bb182a624da301a7e6404a55adbb83241069ec6`; rama `fix/invitations-session-revocation`. Archivos: README y comunicacion-ia de gestion.
- VERIFICADO-CÓDIGO: Claude incluido en participantes y plantilla; reglas de acceso, revisión inicial propuesta, reserva de archivos, ramas propias, trazabilidad por SHA y protección de autodeploy por rama. No se ha ejecutado ni atribuido una revisión a Claude.
- Validación: revisión del diff, enlaces relativos y whitespace; cambio exclusivamente documental, sin necesidad de repetir pruebas funcionales.
- Publicación: rama de trabajo ya excluida en ambos vercel.json; main no se modifica. Comprobar ausencia de deployments después del push. Próxima acción propuesta: que Claude confirme acceso, base leída y comienzo de la revisión antes de tomar archivos.

### 2026-11-02 15:40 CET - Claude - revisión R01 de invitaciones, permisos y sesiones

- Tarea y estado: R01, revisión de T02/T03/T13 implementadas por Codex. **Terminada**; solo documental, sin cambios funcionales.
- Rama revisada: `fix/invitations-session-revocation` @ `4ad7b90840172d4f32f99d73797d49b00eb145a2`; diff de código `f79c3637..14fe6e78`. Rama propia: `claude/review-security-fixes`, creada desde ese SHA. Archivos: gestion/comunicacion-ia.md, pendientes.md, decisiones.md y exclusión de autodeploy de esta rama en `vercel.json` y `frontend/vercel.json`.
- Acceso: clon desde GitHub en el entorno de Claude; no se usó la copia local de Pablo. Ramas remotas consultadas: además de las registradas existe `fix/stabilize-critical-foundation` (2026-04-28, otro autor), ajena a este trabajo.
- VERIFICADO-CÓDIGO (correcto): servicio único de invitación con aislamiento por empresa; requireAuth consulta estado, baja, rol, empresa y sessionVersion en DB y no recurre al JWT si la DB falla; activación transaccional de uso único; trigger con `GREATEST(NEW, OLD+1)` sin doble incremento; migración 1 sin reescritura de tabla en PG >= 11; volver al código anterior es compatible con el esquema, pero reabriría H01/H02. Documentación de Codex coincide con el código.
- VERIFICADO-EJECUCIÓN: PostgreSQL 16 temporal en loopback, base nueva `onehorizon_review_test`, SMTP vacío. Las 7 migraciones se aplicaron con `psql` porque la red del entorno bloquea la descarga del schema-engine de Prisma: `prisma migrate deploy` **no** fue verificado por Claude; `prisma generate` sí. Node 22.23.4: backend 57/57 PASS, frontend 35/35 PASS, lint frontend PASS. E2E no ejecutado. 7 sondas temporales (borradas, no versionadas) confirmaron los hallazgos 3, 4, 6, 8 y 9. Base detenida y eliminada al terminar.
- Hallazgos (sin P0):
  1. P1 operativo: `backend/procfile` y `nixpacks.toml` ejecutan `prisma migrate deploy` al arrancar; un merge a main aplica ambas migraciones en producción y fuerza nuevo login automáticamente. → T14.
  2. P1 preexistente: `/api/admin/invites` devuelve `inviteLink` también a CLIENT_ADMIN, que puede activar la cuenta invitada con su propia contraseña (sonda: 200); sin SMTP, `email.js` registra el enlace en logs también en producción. → T15 / D11.
  3. P2 regresión: la invitación guarda el email en minúsculas (`invitations.js:17`), pero login y resend-invite buscan email exacto (`auth.js:38-41`, `auth.js:136`). Sonda: login con mayúsculas 401, en minúsculas 200. → T16.
  4. P2: un CLIENT_ADMIN distingue por código si un email existe en otra empresa (403), en la suya (400) o no existe (200, y crea invitación). → T17.
  5. P2: el frontend no maneja 401 globalmente; con sesión revocada desde otro dispositivo `useConsent` envía el token muerto y el consentimiento se pierde sin aviso. → T18.
  6. P2 cambio funcional: PLATFORM_ADMIN ya no puede corregir la empresa de una invitación pendiente (sonda: 403); falta flujo alternativo. → T19 / D12.
  7. P3: búsqueda de email insensible a mayúsculas frente a índice único sensible; posibles duplicados no deterministas (incluido en T16).
  8. P3: el trigger no revoca por cambio de email/username (sonda: sesión sigue 200); relevante solo si se permite cambiar email.
  9. P3: doble autenticación por petición admin (sonda: 2 consultas); ya documentado por Codex.
  10. P3 preexistentes: resend-invite sin transacción ni comprobación de deletedAt; nombre sin escapar en HTML del correo; retención con username repetido (T09).
  11. P3 documentación/UI: `arquitectura.md` lista lo implementado bajo PROPUESTO; mensaje de error de logout fijo en español en UI inglesa con i18n.
- PROPUESTO (sin implementar): correcciones de T14-T19; D11 y D12 esperan decisión de Pablo.
- Publicación/despliegue: sin merge, PR, despliegue, migración remota ni correos. Exclusión Vercel añadida para `claude/review-security-fixes` en ambos vercel.json antes del push; Railway revisado sigue main. Comprobación posterior al push en la entrada siguiente.
- Próxima acción: Pablo decide D11/D12 y prioridad de T14-T19. **ChatGPT u otro agente:** al leer esta entrada, confirmar en su propio traspaso la rama y el SHA leídos y citar el código de control `R01-CLAUDE-4AD7B908` junto con el archivo y la línea del hallazgo 3, para verificar que la lectura fue real.

### 2026-11-02 15:45 CET - Claude - verificación de publicación R01

- Push de `claude/review-security-fixes`, commit `d1b6c9a7c6fe8504aa761afd116d14e769800605` (solo documentación y exclusión Vercel de esta rama).
- VERIFICADO-EJECUCIÓN (API GitHub, ~45 s después del push): SHA remoto coincide; main sigue en `79a05590be4367a108f54aafaad63bef3c2cceab`; `fix/invitations-session-revocation` sigue en `4ad7b908` (no modificada); 0 deployments para el SHA y para la rama; 0 commit statuses; 0 check-runs. Sin acceso directo al panel de Vercel ni Railway desde Claude: la ausencia de status de Vercel en GitHub es indicio, no prueba completa; Pablo puede confirmarlo en el panel.
- Este registro se publica como commit documental adicional con la misma protección; repetir la comprobación.

### 2026-11-02 - Codex - T16 normalización de email

- Rama/SHA leídos: `claude/review-security-fixes` @ `ef91969d73099f980bb94693737c143878a24d47`. Confirmo código de control `R01-CLAUDE-4AD7B908`; hallazgo 3: `backend/src/services/invitations.js:17`, frente a búsqueda exacta de login en `backend/src/routes/auth.js:40` de esa base.
- Tarea tomada por autorización de Pablo: T16. Rama propia `fix/t16-email-normalization`, creada desde esa revisión para conservar los traspasos de Claude. Archivos reservados/modificados: auth.js, nueva prueba de integración email-normalization.test.js, gestion y exclusiones de rama en ambos vercel.json. No se modifica la rama de Claude ni la de seguridad anterior.
- Estado: implementado y probado, listo para revisión, no desplegado. Login/reenvío normalizan email, admiten capitalización histórica y rechazan coincidencias ambiguas sin elegir cuentas. Username y contraseña conservan su comportamiento. Detalle en t16-normalizacion-email.md.
- VERIFICADO-EJECUCIÓN: cinco fallos reproducidos antes del cambio; 63/63 backend PASS después (57 existentes, seis nuevos). PostgreSQL 16 local nuevo, migraciones solo locales, SMTP desactivado. Diff/whitespace revisados. No se repiten frontend/E2E por no cambiar componentes ni contratos.
- Pendiente: inventario de duplicados en datos reales mediante solo lectura con acceso autorizado; no se ejecutó contra producción. D11/D12 y restantes tareas de Claude no se consideran resueltas.
- Publicación autorizada a la rama propia, con autodeploy bloqueado exactamente para su nombre. No merge, PR, migraciones remotas ni cambios en producción. Próxima acción: revisión de este diff por Claude u otro asistente y verificación posterior al push.
- Publicación comprobada: implementación `ed69ad5c1cfa08ef3d3b562656ae18eaf5b43c7d` en origin/fix/t16-email-normalization; SHA remoto coincide, main sigue en `79a05590be4367a108f54aafaad63bef3c2cceab`, cero deployments GitHub del SHA, cero workflows de la rama y cero deployments Vercel de la rama. PostgreSQL temporal detenido. Este resultado se publica como commit documental adicional, con las mismas protecciones.

### 2026-11-02 - Codex - entrega operativa 1 tomada

- Base leída y contrastada con origin: fix/t16-email-normalization @ 70190d86f4ba7b5c7e4b27ddb65e97a840bfb05b. Árbol inicial limpio. Rama propia: codex/t04-operational-integrity.
- Confirmación de lectura R01-CLAUDE-4AD7B908: hallazgo 3 en backend/src/services/invitations.js:17 frente a backend/src/routes/auth.js:40 de la base revisada por Claude; T16 conserva su corrección.
- Tarea tomada: T04/H03. Archivos reservados: backend/src/routes/admin.js, nuevo servicio de integridad y pruebas de integración, gestion y ambos vercel.json. Criterio: altas y ediciones rechazan relaciones cruzadas (también inversas desde facturas hacia documentos/trabajos), entradas inválidas y escritura por roles de cliente; regresión backend con datos ficticios en PostgreSQL nuevo local.
- Estado real: administración ofrece listas/altas/ediciones, sin resumen global visible; portal mezcla consulta real con tendencias fijas, saldo bruto sin pagos, estado de cuenta de ejemplo y placeholders. Modelo Payment/Document no demuestra flujo operativo.
- Secuencia autorizada por pedido actual: 1 integridad; 2 saldo/movimientos por moneda y pagos manuales; 3 almacenamiento privado y vistas cliente; 4 operación global, responsables/servicios y contratos sujetos a definición. No se consideran completos por tener modelos/pantallas.
- D11/D12 permanecen propuestas sin aprobar. Pendientes de negocio: saldos a favor, exceso/reversión de pagos, borradores/cancelaciones, divisas y conversión, responsables/estados de contratos y servicios contratados, retención documental y facultades de edición. No se integra cobro ni correo real.
- Publicación no realizada. Añadir exclusión exacta Vercel local; volver a inspeccionar automatismos remotos antes de cualquier push. Sin merge, despliegue o DB remota.

### 2026-11-02 - Codex - entrega operativa 1 validada (local)

- Rama: codex/t04-operational-integrity, base 70190d86f4ba7b5c7e4b27ddb65e97a840bfb05b. Estado: T04 implementado para escrituras actuales, pendiente revisión; T20 resumen inicial implementado. Alcance/estado de los siete módulos y decisiones sin aprobar en entregas-operativas.md. No se declara completa la plataforma.
- Archivos: backend/src/services/operationalIntegrity.js, routes/admin.js, tests/integration/operational-integrity.test.js; frontend/src/pages/admin/Overview.jsx y su test, App.jsx, layouts/AdminLayout.jsx; gestion README/pendientes/modulos/entregas-operativas/comunicacion; ambos vercel.json. Sin archivos de otros asistentes sobrescritos ni migraciones nuevas.
- VERIFICADO-CÓDIGO: transacción Serializable en altas/ediciones; validación del estado final en PATCH; relaciones por empresa en local/factura y relaciones inversas Document/ServiceRecord; bloqueo provisional de cambio de cliente/moneda/total con pagos; céntimos, fechas, moneda de tres letras, enums y filtros. Resumen global de conteos con RepeatableRead, guard de rol, vista con carga/error/reintento y enlaces. Revisión React según skill vercel:react-best-practices: hooks estables, cancelación de solicitudes, sin actualizaciones tras desmontaje, estados accesibles, sin dependencias nuevas.
- VERIFICADO-EJECUCIÓN: PostgreSQL temporal nuevo, loopback 127.0.0.1:55433, DB nueva UTF8 onehorizon_delivery_test, solo datos ficticios, SMTP deshabilitado por setup de tests. Primer intento de migración falló por no existir la base esperada tras inicializar el clúster con encoding Windows; se creó explícitamente otra base nueva UTF8 desde template0 y las siete migraciones existentes pasaron. No se reutilizó la DB de T16 ni se leyó una DB remota.
- Comandos: DATABASE_URL y DATABASE_URL_TEST apuntando exclusivamente a esa base local, NODE_ENV=test; `node backend/node_modules/prisma/build/index.js migrate deploy --config backend/prisma.config.ts` PASS; `npm run test --prefix backend` final 95/95 PASS (63 previas, 32 nuevas). Casos nuevos: creación/edición válida, relaciones cruzadas y cambios de empresa, documentos inversos, factura con pago parcial, rechazo de entradas inválidas, escrituras por ambos roles cliente, lectura scoped y no exposición de storagePath; resumen solo admin y filtros inválidos.
- Frontend: `NODE_OPTIONS=--no-experimental-webstorage; npm run test:frontend` 37/37 PASS (35 previas y dos nuevas de resumen/reintento); `npm run lint --prefix frontend` PASS. `node backend/node_modules/prisma/build/index.js validate --config backend/prisma.config.ts` PASS; `git diff --check` PASS. Warnings de deprecación pg/query y module.register del entorno, sin fallos. E2E navegador y build no ejecutados en esta entrega; no se presentan como validados.
- Límites: las pruebas financieras/documentales cubren integridad, pagos existentes y confidencialidad, NO un flujo de registro/conciliación de pagos ni carga/descarga de archivos todavía inexistentes. Pendientes T06/T08/T12 y la preparación T14 siguen abiertos. D11/D12 sin modificar ni aprobar. Preguntas concretas de reglas contables y permisos/estados de servicios y contratos enviadas a Pablo; sin respuesta al registrar esta entrada.
- Publicación: exclusión exacta codex/t04-operational-integrity agregada a ambos vercel.json; no hubo push, PR, merge, despliegue, migraciones remotas, cobro o correo real. Antes de publicar, volver a comprobar Vercel/Railway y demás automatismos; no extrapolar la verificación histórica de otras ramas.
- Próximo paso: revisión de esta entrega y continuación T06 según reglas de negocio; mantener aislados los tests y agregar pruebas de flujos completos al implementar pagos y documentos. Responsable actual: Codex; Claude/OpenCode pueden revisar el diff contra el SHA base citado.
- Cierre de entorno: PostgreSQL temporal detenido con pg_ctl sobre el directorio operational-db; base conservada solo localmente. HEAD remoto de fix/t16-email-normalization reconsultado al cerrar: sigue en 70190d86f4ba7b5c7e4b27ddb65e97a840bfb05b. Se conserva esta entrega en commit local, sin publicar.
