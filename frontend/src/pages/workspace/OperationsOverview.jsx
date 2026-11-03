import { Link } from 'react-router-dom';
import { ArrowUpRight, FileText, CreditCard, Wrench, Building2, RefreshCw, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspaceData } from '../../lib/workspace';
import { PageHeading, MetricCard, WorkspaceState } from '../../components/workspace/WorkspaceUI';

export function OperationsOverview() {
    const { user } = useAuth();
    const { data, error, loading, reload } = useWorkspaceData('/api/admin/overview');
    const actions = [[FileText, 'Facturas', 'Consultar y administrar la facturación', 'invoices'], [CreditCard, 'Pagos y cuenta corriente', 'Registrar, confirmar e imputar pagos', 'accounts'], [Wrench, 'Servicios', 'Seguir los trabajos de cada empresa', 'service-records']];
    return <><PageHeading title="Una visión clara de tu operación." description={`Hola, ${user.name?.split(' ')[0]}. Este es el estado actual de las empresas que acompañás.`}><button className="workspace-button secondary" onClick={reload}><RefreshCw size={15} />Actualizar</button>{user.role === 'PLATFORM_ADMIN' ? <Link className="workspace-button" to="/app/admin/clients">Gestionar empresas <ArrowUpRight size={15} /></Link> : null}</PageHeading>
        <WorkspaceState loading={loading} error={error} onRetry={reload}>{data ? <>
            <div className="workspace-metrics"><MetricCard label="Empresas activas en el portal" value={data.counts.clients} detail="Empresas registradas" icon={Building2} to="/app/admin/clients" /><MetricCard label="Facturas emitidas o vencidas" value={data.counts.pendingInvoices} detail="Estado documental de facturación" icon={FileText} to="/app/admin/invoices" /><MetricCard label="Servicios pendientes" value={data.counts.pendingServices} detail="Trabajos por completar" icon={Wrench} to="/app/admin/service-records" /><MetricCard label="Usuarios activos" value={data.counts.activeUsers} detail={`${data.counts.pendingInvitations} invitaciones pendientes`} icon={Users} to="/app/admin/users" /></div>
            <div className="workspace-split"><section className="workspace-card"><div className="workspace-card-heading"><div><h2>Tu centro de operaciones</h2><p>Accedé directamente a lo que necesitás gestionar.</p></div><span className="workspace-status status-completed">Datos actuales</span></div><div className="workspace-quick-links">{actions.map(([Icon, title, subtitle, path]) => <Link to={`/app/admin/${path}`} key={path}><Icon size={21} /><span><strong>{title}</strong><small>{subtitle}</small></span><ArrowUpRight size={18} /></Link>)}</div></section>
                <section className="workspace-card"><div className="workspace-card-heading"><h2>El espacio de tus clientes</h2></div><div style={{ padding: '22px' }}><p className="workspace-description" style={{ marginTop: 0 }}>Seguimiento de trabajos, facturas y pagos, con acceso independiente para cada empresa.</p><dl className="workspace-table" style={{ marginTop: 22 }}><dt>Establecimientos registrados</dt><dd style={{ fontSize: 27, margin: '6px 0 20px' }}>{data.counts.locations}</dd><dt>Documentos registrados</dt><dd style={{ fontSize: 27, marginTop: 6 }}>{data.counts.documents}</dd></dl></div></section></div>
            <p className="workspace-note">Los importes se consultan por empresa, moneda y destinatario en Pagos y cuenta. Una factura emitida o vencida no equivale por sí sola a deuda sin pagar.</p><p className="workspace-description">Última consulta: {new Date(data.generatedAt).toLocaleString('es-ES')}</p>
        </> : null}</WorkspaceState></>;
}
