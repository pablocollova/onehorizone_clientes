# Preview interactivo de dashboards

Fecha: 2026-11-04. Responsable: Codex. Rama `codex/dashboard-demo` desde `4a2f2c2e9893bac3fca3acc9614a3ceb40e32f1e` (landing con UI de dashboards). Se conserva el checkout/rama del otro Codex, que avanzó por separado hasta `5541d5ee`; su módulo posterior de establecimientos no forma parte de esta demo.

## DECIDIDO-USUARIO

Pablo pidió acceder a los dashboards admin/cliente desde una vista previa con accesos de prueba, sin producción. El preview anterior de landing tenía la API desactivada y no admitía login real. Se prepara una demo interactiva con los componentes existentes y datos ficticios exclusivamente en el navegador, sin provisionar backend, DB, correo o cuentas reales.

## Accesos ficticios de demostración

Estos datos son públicos e intencionalmente de ejemplo. **No son credenciales del sistema real ni sirven en producción.**

| Perfil | Usuario | Contraseña demo |
| --- | --- | --- |
| Administrador One Horizon | `demo_admin` | `DemoHorizon2026!` |
| Administrador de Costa Azul Demo | `demo_cliente` | `DemoHorizon2026!` |
| Lector cliente | `demo_lector` | `DemoHorizon2026!` |
| Lector One Horizon | `demo_lector_oh` | `DemoHorizon2026!` |

Abrir `/login` en el preview; el panel de accesos permite entrar con un clic. `Accesos demo` cambia de perfil. `Reiniciar datos demo` restaura los datos iniciales y conserva el perfil. También funciona el formulario de login con los datos de arriba. Los cambios se comparten entre perfiles dentro de ese mismo navegador/origen, no entre personas, dispositivos o URLs de despliegue.

## VERIFICADO-CÓDIGO

- Inicio condicionado por `VITE_DEMO_MODE=true`. `main.jsx` instala el adaptador antes de montar la aplicación; `App.jsx` carga el panel solo con esa opción. Datos/adapter/panel en `frontend/src/demo/`, sin dependencias nuevas.
- La configuración de build bloquea demo con `VERCEL_ENV=production` y exige preview para cualquier build demo. El build normal no activa ni incluye los accesos/adapter de demo. Se conserva `VITE_API_URL=/preview-api-disabled` en preview.
- El adaptador responde localmente a fetch API del mismo origen; las llamadas a otro origen reciben rechazo local. Una ruta no simulada devuelve error local, sin fallback a ningún backend. No se usa un servidor operativo, token real, DB remota, SMTP, migración o cobro.
- Dos empresas y proveedores ficticios, cuatro perfiles, facturas EUR/GBP, honorarios/reembolso/proveedor directo, adelanto y cotización ilustrativa, servicios, recibo parcial y PDF de ejemplo válido sin valor fiscal. Semilla y operaciones persisten en `onehorizon-dashboard-demo-v1` de localStorage. No ingresar información personal o real.
- Administrador interno: resumen global, empresas/usuarios de ejemplo, alta/edición de facturas, alta/estado de servicios, cuenta/documentos por empresa. Cliente admin: resumen/cuenta/documentos propios. Lectores sin escritura. El adaptador imita ese alcance para recorrer la UI; **no constituye una barrera de seguridad ni prueba la autorización del servidor real**: la demo y sus tokens son visibles y editables por quien controla el navegador.
- Pagos simulados: registro → revisión → confirmación → imputación, importes positivos, misma empresa/moneda/destinatario/proveedor y límite del pendiente/disponible. Idempotencia básica por requestKey y eventos ilustrativos. Cotizaciones/adelantos son locales. El cálculo de demo es una simplificación para explorar pantallas, no una implementación contable nueva ni evidencia del backend.
- Archivos ficticios: carga local hasta 256 KB, recarga, organización y descarga de los bytes; nunca se suben a un servidor. La UI operativa conserva su límite general de 10 MB, mientras el panel y el error del adaptador aclaran el límite menor de la demo para localStorage. El PDF inicial es un documento de ejemplo explícitamente sin validez fiscal.

## Fuera de alcance

Invitaciones, activación, recuperación, correo, cobros/transferencias, privacidad operativa, cambios de datos de servidor, concurrencia multiusuario, archivos privados de servidor, auditoría real y persistencia compartida. Las rutas no simuladas muestran error informativo en lugar de aparentar ejecución. No se declara que todo el backend está desplegado por ser navegables sus pantallas. Tampoco se añade T23 de presupuestos/aceptación ni se integra el nuevo trabajo de establecimientos del otro Codex.

## Publicación y verificación

Solo push de esta rama, con exclusión exacta de autodeploy en ambos vercel.json. Preview manual del frontend en el proyecto Vercel existente, build `VITE_DEMO_MODE=true npm run build`, sin target production, dominios, PR o merge. SHA, URL y pruebas finales en `comunicacion-ia.md`. No versionar enlaces con token temporal de acceso Vercel.

Para repetir localmente: `VITE_DEMO_MODE=true` y `VITE_API_URL=/preview-api-disabled`, ejecutar Vite desde frontend en loopback. Build demo además requiere `VERCEL_ENV=preview`. `playwright.demo.config.cjs` restringe E2E a HTTP loopback; las pruebas no requieren API ni PostgreSQL. El entorno Node local requiere `NODE_OPTIONS=--no-experimental-webstorage` para Vitest.
