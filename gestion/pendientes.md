# Pendientes

Estado inicial 2026-11-02. Todos los cambios funcionales siguientes están propuestos, no realizados. Prioridades y evidencia en diagnóstico; criterios completos en roadmap.

| ID | Prioridad | Trabajo | Estado / responsable |
| --- | --- | --- | --- |
| T01 | P0 | Identificar hosting activo, ramas, previews, migraciones automáticas y backups; habilitar publicación documental sin despliegue | Parcial: Vercel/Railway y ramas revisados; documentación publicada con protección de rama. Backups y preparación operativa siguen pendientes. Ver publicacion-github.md |
| T02 | P0 | Reproducir y corregir reasignación de INVITED entre clientes en ambos endpoints; probar email ya invitado ajeno | Pendiente / sin asignar |
| T03 | P0 | Revalidar usuario/estado/rol o mecanismo de revocación de sesión; probar baja con token previo | Pendiente / sin asignar |
| T04 | P1 | Validar relaciones client/location/invoice y entradas monetarias, fechas y enums | Pendiente / sin asignar |
| T05 | P1 | Conectar formulario a destino real y definir atención comercial | Pendiente / sin asignar; Pablo define destino |
| T06 | P1 | Conectar estado de cuenta y corregir saldo/pagos/monedas; quitar métricas ficticias | Pendiente / sin asignar |
| T07 | P1 | Preparar PostgreSQL local aislado y reejecutar backend/E2E sin contactar servicios externos | Bloqueado en esta sesión: Docker daemon no accesible |
| T08 | P1 | Sustituir placeholders por entregas cliente acotadas: establecimientos, documentos, archivos, pagos | Pendiente / sin asignar |
| T09 | P2 | Retención por usuario con username único y programación observable; activación transaccional y SMTP fail-closed fuera de dev | Pendiente / sin asignar |
| T10 | P2 | Limpiar dependencias versionadas y revisar frontend/.env sin divulgar contenido; no borrar historial ni rotar sin evidencia | Pendiente / sin asignar |
| T11 | P2 | Unificar marca Family, revisar políticas enlazadas, textos, móvil, accesibilidad y SEO | Pendiente / sin asignar |
| T12 | P2 | Definir catálogo, contratos, tareas, renovaciones y alcance de servicios con negocio | Pendiente / Pablo + implementador por asignar |
| T13 | P1 | Endurecer validación de DATABASE_URL_TEST por URL parseada, nombre real y host permitido; rechazar producción | Pendiente / sin asignar |

## Datos aún no confirmados

Proveedor y URL de producción, equivalencia de su commit con main, destino/responsable de leads, capacidad operativa por servicio, reglas de saldo y conciliación, almacenamiento documental, roles de negocio adicionales, volúmenes, plazos y alcance de lanzamiento. Consultar fuentes conectadas disponibles antes de pedir información al usuario. Solicitar solo datos restantes, nunca secretos en chats o Markdown.
