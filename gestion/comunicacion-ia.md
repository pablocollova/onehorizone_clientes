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
