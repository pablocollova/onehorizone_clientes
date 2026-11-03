import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_PASSWORD, DEMO_STORAGE, demoUsers } from './seed';
import './demo.css';

export default function DemoPanel() {
 const { pathname } = useLocation(), navigate = useNavigate(), { login } = useAuth();
 const [open, setOpen] = useState(pathname === '/login'), [busy, setBusy] = useState(false), [error, setError] = useState('');
 const enter = async user => {
  setBusy(true); setError('');
  try { await login(user.username, DEMO_PASSWORD); setOpen(false); navigate(user.role.startsWith('PLATFORM') ? '/app/admin/overview' : '/app/dashboard'); }
  catch (err) { setError(err.message); } finally { setBusy(false); }
 };
 return <><aside className="demo-bar" aria-label="Entorno de demostración"><div><strong>DEMO · Datos ficticios</strong><span>Cambios solo en este navegador. Sin conexión a producción.</span></div><div><button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="demo-access">{open ? 'Cerrar accesos' : 'Accesos demo'}</button><button onClick={() => { localStorage.removeItem(DEMO_STORAGE); window.location.reload(); }}>Reiniciar datos demo</button></div></aside>{open ? <section id="demo-access" className="demo-access" aria-label="Accesos de prueba"><header><h2>Probá los dashboards</h2><button onClick={() => setOpen(false)} aria-label="Cerrar accesos de prueba">×</button></header><p>Elegí un perfil para entrar directamente, o usá su usuario en el login.</p><p>Contraseña común: <code>{DEMO_PASSWORD}</code></p><div className="demo-access-list">{demoUsers.map((user, index) => <article key={user.id}><div><strong>{['Administrador One Horizon', 'Administrador cliente', 'Lector cliente', 'Lector One Horizon'][index]}</strong><code>{user.username}</code></div><button disabled={busy} onClick={() => enter(user)} aria-label={`Entrar como ${user.username}`}>Entrar →</button></article>)}</div>{error ? <p role="alert">{error}</p> : null}<p className="demo-access-note">Simulación de interfaz: facturas, pagos, servicios y archivos de ejemplo (hasta 256 KB). Invitaciones, correos, cobros y datos del servidor están desactivados. No ingreses información real.</p></section> : null}</>;
}
