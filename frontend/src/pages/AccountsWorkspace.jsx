import { Link } from 'react-router-dom';
import { documentsUrl } from '../lib/documents';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isPlatformReader } from '../lib/permissions';
import { apiGet, apiPost } from '../lib/api';
import { BalanceSummary } from '../components/BalanceSummary';
import { money, recipientLabel } from '../lib/finance';
import { roleLabels } from '../lib/permissions';

const invoiceStates = { DRAFT: 'Borrador', ISSUED: 'Emitida', OVERDUE: 'Vencida', PAID: 'Marcada como pagada', CANCELED: 'Cancelada' };
const states = { PROCESSING: 'En proceso', REVIEW: 'En revisión', CONFIRMED: 'Confirmado' };
const actionLabels = {PAYMENT_RECORDED:'Pago registrado',PAYMENT_REVIEW:'Pago enviado a revisión',PAYMENT_CONFIRMED:'Pago confirmado',PAYMENT_ALLOCATED:'Imputación registrada',EXCHANGE_RATE_RECORDED:'Cotización manual registrada',VENDOR_ADVANCE_RECORDED:'Adelanto de One Horizon registrado'};
const today = () => new Date().toISOString().slice(0, 10);
const amount = value => {
    if (!/^\d+(\.\d{1,2})?$/.test(value)) throw new Error('Ingresá un importe positivo con hasta dos decimales.');
    const [units, fraction = ''] = value.split('.');
    const result = Number(units) * 100 + Number(fraction.padEnd(2, '0'));
    if (!Number.isInteger(result) || result <= 0 || result > 2147483647) throw new Error('Importe fuera de rango.');
    return result;
};
const inputClass = 'border rounded-lg px-3 py-2 bg-white text-gray-900 w-full';
const buttonClass = 'border rounded-lg px-4 py-2 bg-primary text-white disabled:opacity-50';

export function AccountsWorkspace({ paymentsOnly = false, organized = false, initialClientId = '' }) {
    const { user } = useAuth();
    const internal = isPlatformReader(user?.role);
    const [companies, setCompanies] = useState([]);
    const [clientId, setClientId] = useState(initialClientId);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        if (!internal) return;
        const controller = new AbortController();
        apiGet('/api/admin/clients', { signal: controller.signal }).then(result => { if (!controller.signal.aborted) setCompanies(result); })
            .catch(err => { if (!controller.signal.aborted) setError(err.message); });
        return () => controller.abort();
    }, [internal, attempt]);
    if (!user) return null;
    const selected = internal ? clientId : user.clientId;
    return <div className="space-y-6 p-2 md:p-6">
        <h1 hidden={organized} className="text-2xl font-bold text-primary">{paymentsOnly ? 'Pagos e imputaciones' : 'Cuenta corriente'}</h1>
        <p>Las deudas, los pagos confirmados y sus imputaciones se muestran por moneda y destinatario.</p>
        {internal ? <label className="block max-w-lg">Empresa
            <select aria-label="Empresa" className={inputClass} value={clientId} onChange={e => setClientId(e.target.value)}>
                <option value="">Seleccioná una empresa</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></label> : null}
        {error ? <p role="alert">{error} <button onClick={() => { setError(''); setAttempt(x => x + 1); }}>Reintentar empresas</button></p> : null}
        {selected ? <AccountDetails key={selected} clientId={selected} user={user} organized={organized} /> : <p>Seleccioná una empresa para consultar su cuenta.</p>}
    </div>;
}

function AccountDetails({ clientId, user, organized }) {
    const [data, setData] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [revision, setRevision] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('payments');
    const [paymentSearch, setPaymentSearch] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [receipt, setReceipt] = useState({ currency: 'EUR', amount: '', recipient: 'ONE_HORIZON', vendorId: '', reference: '', paidAt: today() });
    const [allocation, setAllocation] = useState({ receiptId: '', invoiceId: '', amount: '' });
    const [rate, setRate] = useState({ currency: 'GBP', eurPerUnit: '', source: '', effectiveAt: today() });
    const [advance, setAdvance] = useState({ invoiceId: '', reference: '', paidAt: today() });
    const receiptKey = useRef(crypto.randomUUID()), allocationKey = useRef(crypto.randomUUID());
    const canWrite = ['PLATFORM_ADMIN', 'CLIENT_ADMIN'].includes(user.role);
    useEffect(() => {
        const controller = new AbortController();
        apiGet(`/api/accounts/statement?clientId=${encodeURIComponent(clientId)}`, { signal: controller.signal })
            .then(result => { if (!controller.signal.aborted) setData(result); })
            .catch(err => { if (!controller.signal.aborted) setError(err.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [clientId, revision]);
    const refresh = () => { setLoading(true); setError(''); setRevision(n => n + 1); };
    const run = async fn => {
        setBusy(true); setError('');
        try { await fn(); refresh(); } catch (err) { setError(err.message); } finally { setBusy(false); }
    };
    const submitReceipt = e => { e.preventDefault(); run(async () => {
        await apiPost('/api/accounts/payments', { ...receipt, clientId, vendorId: receipt.recipient === 'VENDOR' ? receipt.vendorId : null, amountCents: amount(receipt.amount), requestKey: receiptKey.current });
        receiptKey.current = crypto.randomUUID(); setReceipt(x => ({ ...x, amount: '', reference: '' }));
    }); };
    const submitAllocation = e => { e.preventDefault(); run(async () => {
        await apiPost(`/api/accounts/payments/${allocation.receiptId}/allocations`, { invoiceId: allocation.invoiceId, amountCents: amount(allocation.amount), requestKey: allocationKey.current });
        allocationKey.current = crypto.randomUUID(); setAllocation({ receiptId: '', invoiceId: '', amount: '' });
    }); };
    const selectedReceipt = data?.receipts.find(x => x.id === allocation.receiptId);
    const visibleReceipts = (data?.receipts || []).filter(x => (!organized || !paymentStatus || x.status === paymentStatus) && (!organized || (x.reference || '').toLocaleLowerCase().includes(paymentSearch.toLocaleLowerCase())));
    const vendors = [...new Map((data?.invoices || []).filter(x => x.type === 'VENDOR_DIRECT' && x.vendor).map(x => [x.vendor.id, x.vendor])).values()];
    return <div className="space-y-6">
        {organized ? <div className="workspace-tabs" role="group" aria-label="Vistas de cuenta">{[['payments','Pagos e imputaciones'],['invoices','Facturas de cuenta'],['settings','Monedas y adelantos'],['activity','Historial']].map(([value,label]) => <button key={value} type="button" aria-pressed={tab === value} className={tab === value ? 'active' : ''} onClick={() => setTab(value)}>{label}</button>)}</div> : null}
        <button className={buttonClass} disabled={busy || loading} onClick={refresh}>Actualizar cuenta</button>
        {error ? <p role="alert" className="bg-red-50 p-4 text-red-800">{error}</p> : null}
        {loading ? <p role="status">Cargando cuenta…</p> : null}
        {data ? <>
            {Object.values(data.warnings).some(Boolean) ? <aside className="p-4 bg-amber-50 border rounded-lg">Cuenta con datos pendientes de revisión: {data.warnings.legacyPayments} pagos históricos sin conciliar; {data.warnings.unrecognizedReimbursements} reembolsos sin adelanto registrado; {data.warnings.historicalPaidInvoices} facturas marcadas pagadas sin conciliación con este módulo; {data.warnings.unsupportedCurrencies} monedas no admitidas. Saldo provisional: no se descuentan pagos históricos sin conciliar ni se reconocen reembolsos sin adelanto.</aside> : null}
            <BalanceSummary balances={data.balances} />
            <section hidden={organized && tab !== 'invoices'} className="bg-white border rounded-xl p-4 overflow-x-auto">
                <h2 className="text-xl font-bold mb-3">Facturas y obligaciones</h2>
                <table className="w-full text-left text-sm"><thead><tr>{['Factura', 'Destinatario', 'Moneda', 'Importe', 'Imputado', 'Pendiente', 'Situación'].map(x => <th key={x} className="p-2">{x}</th>)}</tr></thead>
                    <tbody>{data.invoices.map(x => <tr key={x.id} className="border-t"><td className="p-2">{x.number || x.id} <Link className="underline block" to={documentsUrl(user, {clientId, invoiceId:x.id})}>Archivos de factura</Link></td><td>{recipientLabel(x.recipient)}{x.vendor ? ` · ${x.vendor.name}` : ''}</td><td>{x.currency}</td><td>{money(x.totalCents, x.currency)}{x.currency !== 'EUR' ? <small className="block">{x.totalEurCents === null ? 'Equivalente EUR pendiente' : '≈ ' + money(x.totalEurCents)}</small> : null}</td><td>{money(x.appliedCents, x.currency)}</td><td>{x.eligible ? money(x.totalCents - x.appliedCents, x.currency) : 'No reconocida en saldo'}</td><td>{x.legacyPaymentsCount ? 'Revisión de pagos históricos requerida' : x.eligible && x.appliedCents === x.totalCents ? 'Saldada por imputaciones' : x.type === 'VENDOR_REBILL' && !x.advance ? 'Adelanto por registrar' : invoiceStates[x.status] || x.status}</td></tr>)}</tbody>
                </table>{!data.invoices.length ? <p>No hay facturas.</p> : null}
            </section>
            <section hidden={organized && tab !== 'payments'} className="space-y-3"><h2 className="text-xl font-bold">Pagos registrados</h2>
                {organized ? <div className="workspace-toolbar"><label className="workspace-search"><span className="sr-only">Buscar pago por referencia</span><input placeholder="Buscar pago por referencia" value={paymentSearch} onChange={e => setPaymentSearch(e.target.value)} /></label><select className="workspace-filter" aria-label="Estado del pago" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}><option value="">Todos los estados</option>{Object.entries(states).map(([key,value]) => <option key={key} value={key}>{value}</option>)}</select></div> : null}
                {visibleReceipts.map(x => <article key={x.id} className="bg-white border rounded-xl p-4 space-y-2">
                    <h3 className="font-semibold">{x.reference} · {money(x.amountCents, x.currency)} · {recipientLabel(x.recipient)} {x.vendor?.name}</h3>
                    {x.currency !== 'EUR' ? <p>{x.amountEurCents === null ? 'Equivalente EUR pendiente' : 'Equivalente informativo: ' + money(x.amountEurCents)}</p> : null}<p>{states[x.status]} · Fecha de pago: {new Date(x.paidAt).toLocaleDateString('es-ES')}</p>
                    {x.confirmedBy ? <p>Confirmado por {data.events.find(event => event.action === 'PAYMENT_CONFIRMED' && event.entityId === x.id)?.details.actorName || x.confirmedBy} · {new Date(x.confirmedAt).toLocaleString('es-ES')}. La confirmación declarada no acredita conciliación bancaria.</p> : null}
                    <Link className="underline" to={documentsUrl(user, {clientId, receiptId:x.id})}>Comprobantes del pago</Link>
                    <p>Imputado: {money(x.allocations.reduce((n, a) => n + a.amountCents, 0), x.currency)}</p>
                    {x.allocations.map(a => <p key={a.id}>→ {data.invoices.find(i => i.id === a.invoiceId)?.number || a.invoiceId}: {money(a.amountCents, x.currency)}</p>)}
                    {canWrite && x.status !== 'CONFIRMED' ? <button disabled={busy || loading} className={buttonClass} onClick={() => run(() => apiPost(`/api/accounts/payments/${x.id}/state`, { status: x.status === 'PROCESSING' ? 'REVIEW' : 'CONFIRMED' }))}>{x.status === 'PROCESSING' ? 'Enviar a revisión' : 'Confirmar pago'}: {x.reference}</button> : null}
                </article>)}
                {!visibleReceipts.length ? <p>{data.receipts.length ? 'No hay pagos con esos filtros.' : 'No hay pagos registrados.'}</p> : null}
            </section>
            {canWrite ? <fieldset hidden={organized && !['payments','settings'].includes(tab)} disabled={busy || loading} className="space-y-6">
                <legend className="font-bold text-xl">Operar la cuenta</legend>
                <form hidden={organized && tab !== 'payments'} aria-label="Registrar pago" onSubmit={submitReceipt} className="grid gap-3 md:grid-cols-2 p-4 bg-white border rounded-xl">
                    <h2 className="md:col-span-2 font-bold">Registrar pago manual</h2>
                    <label>Moneda del pago<select className={inputClass} value={receipt.currency} onChange={e => setReceipt({ ...receipt, currency: e.target.value })}>{['EUR', 'GBP', 'USD'].map(c => <option key={c}>{c}</option>)}</select></label>
                    <label>Importe del pago<input className={inputClass} required inputMode="decimal" value={receipt.amount} onChange={e => setReceipt({ ...receipt, amount: e.target.value })} /></label>
                    <label>Destinatario del pago<select className={inputClass} value={receipt.recipient} onChange={e => setReceipt({ ...receipt, recipient: e.target.value, vendorId: '' })}><option value="ONE_HORIZON">One Horizon</option><option value="VENDOR">Proveedor directo</option></select></label>
                    {receipt.recipient === 'VENDOR' ? <label>Proveedor<select className={inputClass} required value={receipt.vendorId} onChange={e => setReceipt({ ...receipt, vendorId: e.target.value })}><option value="">Seleccioná proveedor</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label> : null}
                    <label>Referencia del pago<input className={inputClass} required maxLength={300} value={receipt.reference} onChange={e => setReceipt({ ...receipt, reference: e.target.value })} /></label>
                    <label>Fecha del pago<input className={inputClass} type="date" required max={today()} value={receipt.paidAt} onChange={e => setReceipt({ ...receipt, paidAt: e.target.value })} /></label>
                    <button className={buttonClass}>Registrar pago</button><p className="text-sm">Registra información; no ejecuta un cobro o transferencia.</p>
                </form>
                <form hidden={organized && tab !== 'payments'} aria-label="Imputar pago" onSubmit={submitAllocation} className="grid gap-3 md:grid-cols-2 p-4 bg-white border rounded-xl">
                    <h2 className="md:col-span-2 font-bold">Imputar pago confirmado</h2>
                    <label>Pago confirmado<select className={inputClass} required value={allocation.receiptId} onChange={e => setAllocation({ ...allocation, receiptId: e.target.value, invoiceId: '' })}><option value="">Seleccioná pago</option>{data.receipts.filter(x => x.status === 'CONFIRMED').map(x => <option key={x.id} value={x.id}>{x.reference} · {x.currency} · {recipientLabel(x.recipient)}</option>)}</select></label>
                    <label>Factura a imputar<select className={inputClass} required value={allocation.invoiceId} onChange={e => setAllocation({ ...allocation, invoiceId: e.target.value })}><option value="">Seleccioná factura</option>{data.invoices.filter(x => x.eligible && !x.legacyPaymentsCount && selectedReceipt && x.currency === selectedReceipt.currency && x.recipient === selectedReceipt.recipient && (x.recipient !== 'VENDOR' || x.vendorId === selectedReceipt.vendorId) && x.totalCents > x.appliedCents).map(x => <option key={x.id} value={x.id}>{x.number || x.id} · {money(x.totalCents - x.appliedCents, x.currency)}</option>)}</select></label>
                    <label>Importe a imputar<input className={inputClass} required inputMode="decimal" value={allocation.amount} onChange={e => setAllocation({ ...allocation, amount: e.target.value })} /></label>
                    <button className={buttonClass}>Imputar pago</button>
                </form>
                <form hidden={organized && tab !== 'settings'} aria-label="Registrar cotización" onSubmit={e => { e.preventDefault(); run(() => apiPost('/api/accounts/exchange-rates', { ...rate, clientId })); }} className="grid gap-3 md:grid-cols-2 p-4 bg-white border rounded-xl">
                    <h2 className="md:col-span-2 font-bold">Equivalente informativo en euros · cotización manual</h2>
                    <label>Moneda de origen<select className={inputClass} value={rate.currency} onChange={e => setRate({ ...rate, currency: e.target.value })}><option>GBP</option><option>USD</option></select></label>
                    <label>Euros por unidad<input className={inputClass} inputMode="decimal" required value={rate.eurPerUnit} onChange={e => setRate({ ...rate, eurPerUnit: e.target.value })} /></label>
                    <label>Fuente de cotización<input className={inputClass} required maxLength={300} value={rate.source} onChange={e => setRate({ ...rate, source: e.target.value })} /></label>
                    <label>Fecha de cotización<input className={inputClass} required type="date" max={today()} value={rate.effectiveAt} onChange={e => setRate({ ...rate, effectiveAt: e.target.value })} /></label>
                    <button className={buttonClass}>Registrar cotización</button>
                </form>
                {user.role === 'PLATFORM_ADMIN' ? <form hidden={organized && tab !== 'settings'} aria-label="Registrar adelanto" onSubmit={e => { e.preventDefault(); run(() => apiPost(`/api/accounts/invoices/${advance.invoiceId}/advance`, { reference: advance.reference, paidAt: advance.paidAt })); }} className="grid gap-3 md:grid-cols-2 p-4 bg-white border rounded-xl">
                    <h2 className="md:col-span-2 font-bold">Registrar adelanto ya pagado por One Horizon</h2>
                    <label>Factura reembolsable<select className={inputClass} required value={advance.invoiceId} onChange={e => setAdvance({ ...advance, invoiceId: e.target.value })}><option value="">Seleccioná factura</option>{data.invoices.filter(x => x.type === 'VENDOR_REBILL' && !x.advance && ['ISSUED', 'OVERDUE'].includes(x.status)).map(x => <option key={x.id} value={x.id}>{x.number || x.id} · {money(x.totalCents, x.currency)}</option>)}</select></label>
                    <label>Referencia del adelanto<input className={inputClass} required value={advance.reference} onChange={e => setAdvance({ ...advance, reference: e.target.value })} /></label>
                    <label>Fecha del adelanto<input className={inputClass} type="date" required max={today()} value={advance.paidAt} onChange={e => setAdvance({ ...advance, paidAt: e.target.value })} /></label>
                    <button className={buttonClass}>Registrar adelanto completo</button>
                </form> : null}
            </fieldset> : <p>Acceso de lectura: los administradores pueden registrar, confirmar e imputar.</p>}
            <details open={organized && tab === 'activity'} hidden={organized && tab !== 'activity'} className="p-4 border rounded-xl bg-white"><summary>Historial de operaciones</summary>
                {data.events.map(x => <p key={x.id} className="py-2 border-t">{new Date(x.createdAt).toLocaleString('es-ES')} · {actionLabels[x.action] || 'Operación'} · {roleLabels[x.actorRole]} · {x.details.actorName || x.actorId}{x.details.amountCents ? ' · ' + money(x.details.amountCents, x.details.currency || 'EUR') : ''}{x.details.reference ? ' · ' + x.details.reference : ''}</p>)}
                {!data.events.length ? <p>Sin operaciones registradas.</p> : null}
            </details>
            <p className="text-sm text-gray-500">Actualizado {new Date(data.generatedAt).toLocaleString('es-ES')}. Cancelaciones, devoluciones y liquidación entre monedas requieren un flujo específico.</p>
        </> : null}
    </div>;
}
