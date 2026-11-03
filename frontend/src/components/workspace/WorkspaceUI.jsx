import { ArrowUpRight, RefreshCw, Search, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { statusLabels } from '../../lib/workspace';

export function PageHeading({ eyebrow = 'ONE HORIZON · OPERACIONES', title, description, children }) {
    return <header className="workspace-heading"><div><p className="workspace-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="workspace-description">{description}</p></div><div className="workspace-heading-actions">{children}</div></header>;
}
export function StatusBadge({ status }) {
    return <span className={`workspace-status status-${status?.toLowerCase()}`}>{statusLabels[status] || status}</span>;
}
export function WorkspaceState({ loading, error, onRetry, empty, title = 'Todavía no hay registros', children }) {
    if (loading) return <div className="workspace-empty" role="status"><RefreshCw size={25} className="animate-spin" /><h2>Cargando información…</h2><p>Estamos consultando los registros de tu cuenta.</p></div>;
    if (error) return <div className="workspace-empty" role="alert"><h2>No pudimos cargar la información</h2><p>{error}</p><button className="workspace-button" onClick={onRetry}>Reintentar</button></div>;
    if (empty) return <div className="workspace-empty"><Inbox size={30} /><h2>{title}</h2><p>Los nuevos registros aparecerán aquí.</p></div>;
    return children;
}
export function SearchField({ value, onChange, label = 'Buscar' }) {
    return <label className="workspace-search"><Search size={17} aria-hidden="true" /><span className="sr-only">{label}</span><input value={value} onChange={e => onChange(e.target.value)} placeholder={label} type="search" /></label>;
}
export function MetricCard({ label, value, detail, to, icon: Icon }) {
    return <article className="workspace-metric"><div className="workspace-metric-top"><span>{label}</span>{Icon ? <Icon size={18} aria-hidden="true" /> : null}</div><strong>{value ?? '—'}</strong><div className="workspace-metric-foot"><span>{detail}</span>{to ? <Link to={to} aria-label={`Ver ${label.toLowerCase()}`}><ArrowUpRight size={19} /></Link> : null}</div></article>;
}
