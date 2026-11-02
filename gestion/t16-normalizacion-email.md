# T16 - Normalización de email

Fecha: 2026-11-02. Autor: Codex. Rama: `fix/t16-email-normalization`.
Base leída: `claude/review-security-fixes` @ `ef91969d73099f980bb94693737c143878a24d47`. Código de control de la revisión: `R01-CLAUDE-4AD7B908`. Hallazgo 3: `backend/src/services/invitations.js:17` normaliza al guardar; login en `backend/src/routes/auth.js:40` y resend-invite en ese archivo buscaban el email exacto en la base revisada. Las líneas corresponden a esa base, no a este diff.

## VERIFICADO-CÓDIGO: implementado en esta rama

- Login por email y reenvío aplican trim y minúsculas, igual que las invitaciones. La búsqueda es insensible a mayúsculas para admitir emails históricos guardados con otra capitalización.
- Se recuperan como máximo dos coincidencias. Si hay duplicados por capitalización, el login devuelve el mismo 401 genérico de credenciales inválidas; resend devuelve el mismo 200 genérico de cuenta desconocida y no modifica ni genera tokens ni envía correo. No se elige una cuenta arbitrariamente.
- El nombre de usuario conserva su búsqueda exacta y la contraseña no se recorta ni se cambia a minúsculas. Entradas con tipos inválidos se rechazan con 400.
- El reenvío utiliza el email persistido de la cuenta encontrada. No modifica emails existentes ni fusiona cuentas; no requiere migraciones nuevas.

## VERIFICADO-EJECUCIÓN

- Antes de corregir: seis pruebas nuevas, cinco fallos y una aprobada. Se reprodujeron el login 401 con mayúsculas, el reenvío sin rotar enlace, falta de soporte de emails históricos y selección de un duplicado; también se detectó 500 para identificador numérico.
- Después: **63/63 pruebas backend aprobadas**, cuatro archivos. Incluye las 57 anteriores y seis nuevas en `backend/tests/integration/email-normalization.test.js`.
- Base PostgreSQL 16 nueva y aislada `onehorizon_t16_test`, loopback `127.0.0.1:55432`. Las siete migraciones existentes se aplicaron solo allí. SMTP desactivado por el setup de tests; ningún correo real ni consulta a datos de producción.
- Ejecución: DATABASE_URL y DATABASE_URL_TEST configuradas exclusivamente para esa base local; `prisma migrate deploy --config prisma.config.ts` desde backend; `npm run test --prefix backend`. Revisión de diff y `git diff --check` aprobadas.
- No se cambiaron componentes frontend ni contratos de respuesta. No se repitieron frontend/E2E ni build para este cambio de búsqueda backend; la evidencia nueva corresponde a integración HTTP y PostgreSQL reales.

## Duplicados históricos: consulta de solo lectura

La prueba crea dos cuentas ficticias que solo difieren en mayúsculas y verifica esta consulta y el rechazo de selección ambigua:

```sql
SELECT COUNT(*)::int AS count
FROM "User"
WHERE email IS NOT NULL
GROUP BY lower(btrim(email))
HAVING COUNT(*) > 1;
```

La consulta informa tamaños de grupos sin revelar emails. **Pendiente:** ejecutar un inventario equivalente sobre los datos reales cuando se autorice el acceso adecuado; en esta tarea no se consulta producción. Si hay duplicados, definir resolución manual antes de cualquier índice único insensible a mayúsculas o backfill. Tampoco se revisan aquí emails históricos con espacios almacenados ni se cambia la política de invitaciones ante duplicados (hallazgo 7).

## Publicación y siguiente paso

La rama propia se excluye explícitamente de autodeploy en ambos vercel.json. No se hace merge ni PR ni se modifican ajustes remotos. Tras el push, comprobar SHA remoto, main intacto y ausencia de deployments. Próximo paso: revisión de Claude u otro asistente sobre este diff; T15/T17/T18/T19 y D11/D12 siguen sin cambios.
