# Landing B2B-first — L01

Fecha: 2026-11-03. Autor: Codex. Rama `codex/landing-b2b-first`, base `6cc3123228ac9d3759dad418b7bd8e388cf1aa15`. Implementación aislada en `one-horizon-landing`; no se modifican código ni rama del otro Codex.

## DECIDIDO-USUARIO

Rediseñar la landing del repositorio existente, B2B-first y Family secundaria, usando `onejorizone.pdf` como concepto. Publicar rama y documentación compartida. Después Pablo pidió «pushearla y deployarla en el vercel» para poder verla: se interpreta como autorización de preview manual, manteniendo su restricción previa de no tocar producción. No se autoriza promoción, dominios ni merge a main.

## Referencia consultada

PDF original recuperado de caché local del adjunto, tres páginas; texto completo extraído y primera página renderizada/inspeccionada. Se aprovechan destinatarios (emprendedores, inversores, hostelería, locales), seis áreas (suministros, documentación/licencias, higiene/APPCC, seguros, proveedores/mantenimiento, administración) y dos fases (apertura/adquisición, continuidad). No se copia el layout ni se interpreta el PDF como prueba de capacidad operativa.

## VERIFICADO-CÓDIGO

- Mensaje inicial centrado en negocios y operación local; CTA principal hacia consulta de negocio. Destinatarios, seis servicios, dos fases con próximos pasos, espacio cliente, Family secundario y preguntas frecuentes. Sin estadísticas, testimonios, logos de terceros, garantías de permisos o plazos de respuesta inventados.
- Diseño editorial en tonos crema/verde profundo, títulos serif, foto de terraza ya existente en el repositorio y componentes accesibles. La foto es ilustrativa, no evidencia de un cliente o instalaciones propias. No hay dependencia de imágenes o fuentes externas nuevas.
- Inglés/español conservados; contenido comercial nuevo centralizado en `frontend/src/lib/landingContent.js`. Idioma del documento, título y descripción actualizados por ruta/idioma. Navbar móvil con estado expandido/Escape, FAQ nativa y formularios etiquetados. Family conserva `/private-services`; no se inventan rutas legales. Footer enlaza a la política existente, portal y Family; se retiran enlaces ficticios `#` de términos/cookies sin documento real. El banner de consentimiento existente se conserva.
- El contacto antiguo solo mostraba un alert de éxito sin enviar. Ahora prepara un borrador mailto explícito con nombre/email, negocio/ubicación opcionales, necesidad, plazo y mensaje, codificados y revisables. No abre la aplicación de correo hasta pulsar el enlace correspondiente; no guarda datos en almacenamiento ni transmite una consulta desde la web. Cambiar un dato invalida el borrador anterior. Dirección y teléfono provienen del código anterior; su recepción/propiedad no se verificó ni se enviaron correos.
- Backend, autenticación, finanzas y documentos no modificados. La rama conserva los dashboards de su base; no incorpora las entregas posteriores del otro chat sobre su rama local. Los archivos antiguos de sections quedan fuera de Landing, sin eliminar componentes que otras vistas pudieran usar.

## Preview y producción

Ambos vercel.json bloquean autodeploy de esta rama. Solo se solicita manualmente un despliegue **preview** del frontend, proyecto existente `onehorizone-clientes`, equipo `pablocollovas-projects`. Configuración de build por despliegue, no cambio global del proyecto; sin backend, migraciones, seeds ni conexión a DB.

En builds con `VERCEL_ENV=preview`, Vite fija VITE_API_URL a `/preview-api-disabled`: el preview comercial no usa las variables de API productiva ni puede operar cuentas reales. Login/portal conserva su ruta visual, pero este preview no es un entorno funcional de datos. Fuera de preview la configuración de API existente no se modifica. Reescritura SPA en configuración frontend permite abrir/refrescar Family, privacidad y login. No se promueve ni se asignan dominios de producción.

## Verificación y continuidad

Pruebas frontend, lint, build normal y preview, y tres recorridos Playwright locales en `playwright.landing.config.cjs`. Este config solo acepta HTTP loopback y no inicia backend. Se comprueban CTA/anclas, FAQ, borrador sin solicitudes API, idioma, Family/privacidad/login, teclado móvil y anchos 390/768/1100/1280/1440 sin overflow horizontal. Capturas de escritorio y móvil para revisión visual; no se versionan. Resultados finales y URL/SHA del preview en comunicación.

PENDIENTE: validar comercialmente el texto, alcance real de los seis servicios y contacto antes de una salida; recepción de leads centralizada, responsable/tiempo de respuesta, integración CRM/correo, política legal específica y SEO avanzado requieren trabajo propio. No se presenta el borrador mailto como captación automática. No se afirma implementado el ciclo comercial T23 por mostrar servicios en la landing. Producción sigue requiriendo autorización expresa.

## Preview publicado y comprobado

Código `61407ff97d731ac0f8290a9457e0c3a109572f96`, deploy `dpl_8N5nPQeHhbwVqiYGsjcoYy28sDWN`, READY, target null/preview. URL: https://onehorizone-clientes-3zvcllk97-pablocollovas-projects.vercel.app . Se generó enlace compartible temporal para Pablo; no se versiona su token. API REST crea preview omitiendo target (no acepta el literal preview); se corrigió el primer 400 de validación antes de crear ningún deploy.

Verificado en navegador real del preview: portada, Family y login recargan con HTTP 200; bundle contiene /preview-api-disabled, sin solicitudes API fuera del preview ni pageerror. Captura remota inspeccionada. Producción consultada después: continúa dpl_Fj8wRMoTEndGWFcsYNxUA79JBKYC, SHA main 79a05590be4367a108f54aafaad63bef3c2cceab. No cambió main ni se promocionó el preview. Commit posterior a código desplegado solo registra el cierre documental.
