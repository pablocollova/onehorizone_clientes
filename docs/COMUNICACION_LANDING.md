# Comunicación · rediseño landing One Horizon

## 2026-11-03 · Codex / Padme

Petición de Pablo: renovar visualmente la landing, hacerla más limpia y comercial sin perder información, usando «One Horizon maqueta web rediseñada.pdf» como contenido y orientación, no como diseño obligatorio.

### Ubicación

Repositorio conectado a Vercel: pablocollova/onehorizone_clientes. Rama feat/landing-refresh-nov03. PR #1. Proyecto Vercel onehorizone-clientes. Existe otro repositorio privado one_horizone con contenido anterior; no confundir las copias.

### Implementado

- Portada con fotografía existente de Costa del Sol, texto breve, jerarquía editorial, tonos crema/verde y CTA de consulta.
- Audiencias: emprendedores, inversores, hoteles/restaurantes y locales comerciales.
- Seis servicios empresariales en desplegables; descripción y CTA específicos conservados.
- Cuatro diferenciales, explicación del rol operativo y detalles de alcance accesibles.
- Dos fases: apertura/traspaso y continuidad, con los cinco puntos de cada fase conservados.
- Portal de clientes y enlace a login existente.
- One Horizon Family: suministros, trámites/NIE/empadronamiento/traducciones, mantenimiento, seguros, Seguridad Social y escolarización. Conservado enlace a /private-services y referencia a documentación/apoyo continuo.
- EN/ES, menú adaptable con nombres accesibles, cierre con Escape y enlaces a secciones; selector de servicio precargado desde CTA.
- Formulario: el anterior mostraba éxito sin enviar. Ahora prepara un mailto codificado, explica que necesita la aplicación de correo y no confirma envío. Conserva campos/contactos. No hay endpoint de captación nuevo.

### Mapa de contenido

| Origen | Destino |
|---|---|
| Hero: públicos, alcance y mensajes repetidos | Hero breve + audiencias + servicios + fases |
| Who we help y cuatro audiencias | Sección 01 |
| Features y aclaración del rol | Detalle desplegable en Why One Horizon |
| Seis servicios B2B | Sección 02, seis desplegables |
| Cuatro motivos | Why One Horizon |
| Dos fases y sus diez puntos | Sección 03 |
| Portal | Bloque propio #portal |
| Oferta privada existente y añadidos PDF | #family + ruta privada existente |
| Contacto | #contact, email y teléfono existentes |

### Comprobación y límites

npm ci con lockfile existente; npm run build correcto (advertencia de bundle superior a 500 kB); las tres pruebas de Components.test.jsx pasan. No se modificó lockfile ni backend.

Preview Vercel del commit 2df6360273d62b23d60ccbeb7fa334daa69ca719: READY, https://onehorizone-clientes-i00yq3nqz-pablocollovas-projects.vercel.app . Es preview, no producción. Requiere autenticación Vercel; esta sesión llegó al login y no completó QA visual allí. La preview local fue bloqueada por allowedHosts de Vite. No afirmar que móvil/flujo completo estén visualmente verificados.

### Para Claude / Codex al retomar

Revisión solicitada, todavía sin respuesta de Claude: comprobar jerarquía visual a 390/768/1440 px, fidelidad de contenido EN/ES, selección de servicio y navegación a portal/Family. Evaluar endpoint real de consultas como tarea separada; hasta entonces mantener indicación explícita de correo. La página privada conserva su diseño anterior y puede unificarse después. Los enlaces legales del footer son preexistentes y requieren contenido/destinos reales; no inventar textos legales ni testimonios.

No se ha hecho merge a main ni sustituido la web principal. Confirmar revisión visual antes de integración. Registrar aquí resultado, cambios y deployment concreto para evitar volver a la versión antigua.
