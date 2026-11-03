# Coordinación landing — 2026-11-03

Codex toma el rediseño comercial B2B-first, Family secundaria, autorizado por Pablo. Rama `codex/landing-b2b-first`, base publicada `6cc3123228ac9d3759dad418b7bd8e388cf1aa15`. Copia aislada `one-horizon-landing`; no cambia ramas ni archivos del otro Codex. Se revisaron visión/decisiones/traspasos y el PDF conceptual original de tres páginas, recuperado de la caché local del adjunto.

Reservas en esta copia: Landing, Navbar/Footer/PublicLayout, estilos/contenido comercial propios, metadatos públicos, marca Family en traducciones, pruebas de landing y gestion. Sin cambios de backend, autenticación, finanzas, documentos ni dashboards. El otro checkout avanzó hasta a311fc97; sus nuevos cambios no se copian sin revisión y no forman parte de esta tarea.

Criterios: jerarquía B2B y Family secundaria, rutas/idiomas y portal conservados, CTA/contacto honesto sin envío simulado, móvil/teclado, sin métricas/testimonios inventados. Verificar en navegador y build/lint/frontend. Excluir la nueva rama exactamente de Vercel en ambas raíces antes de publicar, revisar automatismos y registrar SHA. Sin PR, merge, despliegue, correo real ni producción.

Estado: implementado, probado y publicado. Código desplegado: `61407ff97d731ac0f8290a9457e0c3a109572f96`. Pablo amplió el encargo solicitando despliegue Vercel para verlo: se autorizó y realizó únicamente preview manual, sin cambiar producción. Deploy `dpl_8N5nPQeHhbwVqiYGsjcoYy28sDWN`, READY, target null (preview). URL base: https://onehorizone-clientes-3zvcllk97-pablocollovas-projects.vercel.app . Requiere acceso Vercel o enlace compartible temporal entregado a Pablo en el chat; el token no se publica en GitHub.

Frontend 63/63 y navegador local 3/3 PASS, lint/build PASS. Navegador remoto: home/Family/login 200 tras recargar, sin pageerror ni API externa y bundle con API de preview deshabilitada. Documentación y traspaso en comunicacion-ia.md y landing-b2b.md. Las otras IA deben leer el SHA real de esta rama: la rama del otro Codex no se modifica ni se presume sincronizada. Producción/main conservan 79a05590; sin promoción, dominios, DB o correos reales.
