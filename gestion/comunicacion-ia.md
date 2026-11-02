# Comunicación entre Codex, OpenCode y ChatGPT

## Protocolo operativo

1. Leer `gestion/README.md`, visión, decisiones, últimos traspasos y pendientes antes de trabajar. Revisar instrucciones del repositorio si existen y comprobar rama, commit y cambios locales.
2. Declarar tarea, responsable, rama, base, archivos a tocar y criterio de aceptación. Una sola persona/agente edita cada conjunto de archivos a la vez. No sobrescribir cambios ajenos ni hacer reset destructivo.
3. Trabajar en rama aislada. El código es evidencia de implementación; pruebas ejecutadas son evidencia de comportamiento. Distinguir ambos de propuestas y mensajes históricos.
4. Al terminar, actualizar pendientes, decisiones si aplica y agregar traspaso con archivos, pruebas exactas, resultado, bloqueos y próximo paso. Conservar historial; no reescribir entradas de otro agente.
5. Otro agente revisa el diff y la evidencia cuando se le asigne revisión; este protocolo no inicia agentes automáticamente. Si dos ramas divergen, reconciliar mediante revisión del diff, sin force-push ni elegir una versión a ciegas.
6. ChatGPT sin acceso al repositorio recibe estos archivos o commit/enlaces que pueda consultar. No afirmar sincronización automática ni memoria compartida entre productos. Cada asistente confirma el commit que realmente leyó.
7. Publicar en GitHub solo cuando se conozcan los efectos de automatización. No merge a main, despliegues, migraciones remotas, seeds sobre datos reales, cambios de secretos ni cambios de producción sin aprobación explícita para el alcance concreto. No enviar correos o mensajes reales como parte de una prueba.

## Plantilla de traspaso

```text
Fecha/hora y zona:
Autor (Codex / OpenCode / ChatGPT / humano):
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
