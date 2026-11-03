import { useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Compass, LayoutDashboard, FileText, CreditCard, Wrench, Building2, Users, FolderOpen, Shield, Menu, X, LogOut, ArrowUpRight, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isPlatformReader } from '../lib/permissions';
import '../workspace.css';

export function WorkspaceLayout({ administration = false }) {
    const { user, logout, logoutError, loggingOut } = useAuth();
    const { pathname } = useLocation();
    const [menu, setMenu] = useState(false);
    if (!user) return <Navigate to="/login" replace />;
    const internal = isPlatformReader(user.role);
    if (administration && !internal) return <Navigate to="/app/dashboard" replace />;
    if (!administration && internal) return <Navigate to="/app/admin/overview" replace />;
    const base = internal ? '/app/admin' : '/app';
    const nav = [
        [LayoutDashboard, 'Resumen', internal ? 'overview' : 'dashboard'],
        [FileText, 'Facturas', 'invoices'], [CreditCard, 'Pagos y cuenta', internal ? 'accounts' : 'payments'],
        [Wrench, 'Servicios', internal ? 'service-records' : 'services'], [FolderOpen, 'Documentos', 'documents'],
        ...(internal ? [[Building2, 'Empresas', 'clients'], [Users, 'Usuarios', 'users']] : []),
        ...(user.role === 'PLATFORM_ADMIN' ? [[UserPlus, 'Invitar usuario', 'invite']] : []),
        ...(!internal ? [[Shield, 'Privacidad', 'privacy-settings']] : []),
    ];
    const current = nav.find(([, , path]) => pathname.startsWith(`${base}/${path}`))?.[1] || 'Mi cuenta';
    const reader = ['PLATFORM_USER', 'CLIENT_USER'].includes(user.role);
    return <div className="workspace-shell">
        {menu ? <button className="workspace-backdrop" aria-label="Cerrar navegación" onClick={() => setMenu(false)} /> : null}
        <aside className={`workspace-sidebar ${menu ? 'is-open' : ''}`} aria-label="Navegación principal">
            <NavLink to={`${base}/${internal ? 'overview' : 'dashboard'}`} className="workspace-brand" onClick={() => setMenu(false)}><Compass size={32} strokeWidth={1.3} /><span>ONE HORIZON<small>YOUR OPERATING PARTNER</small></span></NavLink>
            <div className="workspace-context"><span className="workspace-live-dot" /><span>{internal ? 'Centro de operaciones' : 'Portal de clientes'}</span></div>
            <p className="workspace-nav-title">ESPACIO DE TRABAJO</p>
            <nav aria-label="Navegación principal">{nav.map(([Icon, label, path]) => <NavLink key={path} to={`${base}/${path}`} onClick={() => setMenu(false)} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon size={18} strokeWidth={1.7} /><span>{label}</span></NavLink>)}</nav>
            <div className="workspace-sidebar-bottom"><div className="workspace-help"><span>Todo bajo control.</span><p>Facturas, pagos y seguimiento, en un mismo lugar.</p><NavLink to={`${base}/${internal ? 'accounts' : 'statement'}`} onClick={() => setMenu(false)}>Consultar cuenta <ArrowUpRight size={16} /></NavLink></div><button className="workspace-logout" onClick={logout} disabled={loggingOut}><LogOut size={17} />{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</button>{logoutError ? <p role="alert">{logoutError}</p> : null}</div>
        </aside>
        <div className="workspace-body"><header className="workspace-topbar"><div className="workspace-breadcrumb"><button className="workspace-menu" aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X size={22} /> : <Menu size={22} />}</button><span>One Horizon</span><span>/</span><strong>{current}</strong></div><div className="workspace-profile"><span className="workspace-role">{reader ? 'Solo lectura' : internal ? 'Administración' : 'Administrador de empresa'}</span><span className="workspace-profile-name">{user.name}</span><span className="workspace-avatar" aria-label={user.name}>{user.name?.split(' ').map(x => x[0]).slice(0, 2).join('')}</span></div></header><main className="workspace-content"><Outlet /></main><footer className="workspace-footer"><span>ONE HORIZON</span><span>Operaciones claras. Relaciones duraderas.</span></footer></div>
    </div>;
}
