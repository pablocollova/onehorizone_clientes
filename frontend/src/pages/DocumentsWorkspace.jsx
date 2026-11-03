import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isPlatformReader, roleLabels } from '../lib/permissions';
import { apiGet, apiPatch, apiUploadDocument, apiDownloadDocument } from '../lib/api';
import { documentCategories } from '../lib/documents';
const inputClass = 'border rounded-lg px-3 py-2 bg-white text-gray-900 w-full';
const buttonClass = 'border rounded-lg px-4 py-2 bg-primary text-white disabled:opacity-50';

export function DocumentsWorkspace() {
    const { user } = useAuth();
    const [params, setParams] = useSearchParams();
    const [companies, setCompanies] = useState([]), [error, setError] = useState(''), [attempt, setAttempt] = useState(0);
    const internal = isPlatformReader(user?.role);
    useEffect(() => {
        if (!internal) return;
        const controller = new AbortController();
        apiGet('/api/admin/clients', { signal: controller.signal }).then(result => { if (!controller.signal.aborted) setCompanies(result); })
            .catch(err => { if (!controller.signal.aborted) setError(err.message); });
        return () => controller.abort();
    }, [internal, attempt]);
    if (!user) return null;
    const clientId = internal ? params.get('clientId') : user.clientId;
    return <div className="p-2 md:p-6 space-y-5">
        <h1 className="text-2xl font-bold text-primary">Documentación privada</h1>
        <p>Archivos de tu empresa, facturas y comprobantes de pago. Los archivos originales y sus vínculos se conservan.</p>
        {internal ? <label className="block max-w-lg">Empresa<select aria-label="Empresa" className={inputClass} value={clientId || ''} onChange={e => setParams(e.target.value ? { clientId: e.target.value } : {})}>
            <option value="">Seleccioná una empresa</option>{companies.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select></label> : null}
        {error ? <p role="alert">{error} <button onClick={() => { setError(''); setAttempt(x => x + 1); }}>Reintentar empresas</button></p> : null}
        {clientId ? <DocumentDetails key={`${clientId}-${params.get('invoiceId') || ''}-${params.get('receiptId') || ''}`} clientId={clientId} user={user} invoiceId={params.get('invoiceId') || ''} receiptId={params.get('receiptId') || ''} /> : <p>Seleccioná una empresa para consultar sus documentos.</p>}
    </div>;
}

function DocumentDetails({ clientId, user, invoiceId, receiptId }) {
    const [data, setData] = useState(null), [context, setContext] = useState(null), [error, setError] = useState('');
    const [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [revision, setRevision] = useState(0);
    const [filters, setFilters] = useState({ category: '', folder: '', invoiceId, receiptId });
    const [cursor, setCursor] = useState(''), [pages, setPages] = useState([]);
    const [file, setFile] = useState(null), [upload, setUpload] = useState({ category: receiptId ? 'PAYMENT' : invoiceId ? 'INVOICE' : 'OTHER', folder: '', invoiceId, receiptId, locationId: '' });
    const [edit, setEdit] = useState(null), [history, setHistory] = useState(null);
    const uploadKey = useRef(crypto.randomUUID()), fileInput = useRef(null);
    const canWrite = ['PLATFORM_ADMIN', 'CLIENT_ADMIN'].includes(user.role);
    useEffect(() => {
        const controller = new AbortController();
        const query = new URLSearchParams({ clientId, ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), ...(cursor ? { cursor } : {}) });
        Promise.all([apiGet(`/api/documents?${query}`, { signal: controller.signal }), apiGet(`/api/documents/context?clientId=${encodeURIComponent(clientId)}`, { signal: controller.signal })])
            .then(([result, choices]) => { if (!controller.signal.aborted) { setData(result); setContext(choices); } })
            .catch(err => { if (!controller.signal.aborted) setError(err.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [clientId, filters, cursor, revision]);
    const refresh = () => { setLoading(true); setError(''); setRevision(x => x + 1); };
    const filter = (field, value) => { setLoading(true); setError(''); setCursor(''); setPages([]); setFilters(x => ({ ...x, [field]: value })); };
    const run = async fn => { setBusy(true); setError(''); try { await fn(); } catch (err) { setError(err.message); } finally { setBusy(false); } };
    const uploadFile = e => { e.preventDefault(); run(async () => {
        if (!file || file.size === 0 || file.size > 10 * 1024 * 1024) throw new Error('Seleccioná un archivo de hasta 10 MB, no vacío.');
        await apiUploadDocument(file, { ...upload, clientId, name: file.name, uploadKey: uploadKey.current });
        uploadKey.current = crypto.randomUUID(); setFile(null); if (fileInput.current) fileInput.current.value = '';
        setCursor(''); setPages([]); refresh();
    }); };
    const saveEdit = e => { e.preventDefault(); run(async () => {
        await apiPatch(`/api/documents/${edit.id}`, { name: edit.name, category: edit.category, folder: edit.folder, expectedUpdatedAt: edit.updatedAt });
        setEdit(null); refresh();
    }); };
    return <div className="space-y-5">
        <button className={buttonClass} disabled={busy || loading} onClick={refresh}>Actualizar documentos</button>
        {error ? <p role="alert" className="p-4 bg-red-50 text-red-800">{error}</p> : null}
        {loading ? <p role="status">Cargando documentos…</p> : null}
        {context ? <>
            <fieldset disabled={busy || loading} className="grid gap-3 md:grid-cols-4"><legend>Filtrar documentos</legend>
                <label>Categoría<select className={inputClass} value={filters.category} onChange={e => filter('category', e.target.value)}><option value="">Todas</option>{Object.entries(documentCategories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
                <label>Carpeta<select className={inputClass} value={filters.folder} onChange={e => filter('folder', e.target.value)}><option value="">Todas las carpetas</option>{context.folders.filter(Boolean).map(x => <option key={x}>{x}</option>)}</select></label>
                <label>Factura<select className={inputClass} value={filters.invoiceId} onChange={e => filter('invoiceId', e.target.value)}><option value="">Todas las facturas</option>{context.invoices.map(x => <option key={x.id} value={x.id}>{x.number || x.id}</option>)}</select></label>
                <label>Pago<select className={inputClass} value={filters.receiptId} onChange={e => filter('receiptId', e.target.value)}><option value="">Todos los pagos</option>{context.receipts.map(x => <option key={x.id} value={x.id}>{x.reference}</option>)}</select></label>
            </fieldset>
            <section className="space-y-3" aria-label="Lista de documentos">
                {data?.documents.map(document => <article key={document.id} className="p-4 bg-white border rounded-xl space-y-2">
                    <h2 className="font-bold">{document.name}</h2>
                    <p>{documentCategories[document.category]} · {document.folder || 'Sin carpeta'} · {document.sizeBytes === null ? 'Tamaño sin verificar' : `${document.sizeBytes} bytes`}</p>
                    <p>{document.invoice ? `Factura: ${document.invoice.number || document.invoice.id}` : ''}{document.receipt ? ` · Pago: ${document.receipt.reference}` : ''}{document.location ? ` · ${document.location.label}` : ''}</p>
                    <div className="flex flex-wrap gap-2">
                        <button className={buttonClass} disabled={!document.downloadAvailable || busy || loading} onClick={() => run(() => apiDownloadDocument(document.id, document.name))}>Descargar {document.name}</button>
                        {canWrite ? <button className={buttonClass} disabled={busy || loading} onClick={() => { setEdit(document); setHistory(null); }}>Organizar {document.name}</button> : null}
                        <button className="underline" disabled={busy || loading} onClick={() => run(async () => setHistory({ name: document.name, events: await apiGet(`/api/documents/${document.id}/history`) }))}>Historial {document.name}</button>
                    </div>
                    {!document.downloadAvailable ? <p>Registro histórico: archivo pendiente de incorporación al almacenamiento privado.</p> : null}
                </article>)}
                {!data?.documents.length && !loading ? <p>No hay documentos con estos filtros.</p> : null}
            </section>
            <div className="flex gap-3">
                <button disabled={!pages.length || busy || loading} onClick={() => { setLoading(true); setCursor(pages[pages.length - 1]); setPages(x => x.slice(0, -1)); }}>Página anterior</button>
                <button disabled={!data?.nextCursor || busy || loading} onClick={() => { setLoading(true); setPages(x => [...x, cursor]); setCursor(data.nextCursor); }}>Página siguiente</button>
            </div>
            {canWrite ? <form aria-label="Cargar archivo privado" onSubmit={uploadFile} className="p-4 bg-white border rounded-xl"><fieldset disabled={busy || loading} className="grid gap-3 md:grid-cols-2">
                <legend className="text-xl font-bold">Cargar archivo privado</legend>
                <label>Archivo<input className={inputClass} ref={fileInput} type="file" required accept=".pdf,.png,.jpg,.jpeg,.txt,.csv" onChange={e => setFile(e.target.files[0] || null)} /></label>
                <label>Categoría de carga<select className={inputClass} value={upload.category} onChange={e => setUpload({ ...upload, category: e.target.value })}>{Object.entries(documentCategories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
                <label>Carpeta de carga<input className={inputClass} maxLength={100} placeholder="2026/Facturas" value={upload.folder} onChange={e => setUpload({ ...upload, folder: e.target.value })} /></label>
                <label>Vincular factura<select className={inputClass} value={upload.invoiceId} onChange={e => setUpload({ ...upload, invoiceId: e.target.value })}><option value="">Sin factura</option>{context.invoices.map(x => <option key={x.id} value={x.id}>{x.number || x.id}</option>)}</select></label>
                <label>Vincular pago<select className={inputClass} value={upload.receiptId} onChange={e => setUpload({ ...upload, receiptId: e.target.value })}><option value="">Sin pago</option>{context.receipts.map(x => <option key={x.id} value={x.id}>{x.reference}</option>)}</select></label>
                <label>Vincular establecimiento<select className={inputClass} value={upload.locationId} onChange={e => setUpload({ ...upload, locationId: e.target.value })}><option value="">Sin establecimiento</option>{context.locations.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
                <p className="text-sm">PDF, PNG, JPEG, TXT o CSV, hasta 10 MB. Se guarda el original; adjuntarlo no confirma ni modifica un pago.</p>
                <button className={buttonClass}>Cargar archivo</button>
            </fieldset></form> : <p>Acceso de lectura: podés consultar y descargar los archivos disponibles.</p>}
            {edit ? <form aria-label="Organizar documento" onSubmit={saveEdit} className="p-4 border rounded-xl bg-white"><fieldset disabled={busy || loading} className="grid gap-3 md:grid-cols-2">
                <legend className="text-xl font-bold">Organizar documento</legend>
                <label>Nombre del documento<input className={inputClass} required maxLength={180} value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} /></label>
                <label>Carpeta del documento<input className={inputClass} maxLength={100} value={edit.folder} onChange={e => setEdit({ ...edit, folder: e.target.value })} /></label>
                <label>Categoría del documento<select className={inputClass} value={edit.category} onChange={e => setEdit({ ...edit, category: e.target.value })}>{Object.entries(documentCategories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
                <button className={buttonClass}>Guardar organización</button><button type="button" onClick={() => setEdit(null)}>Cancelar edición</button>
            </fieldset></form> : null}
            {history ? <section className="p-4 bg-white border rounded-xl"><h2 className="font-bold">Historial: {history.name}</h2>
                {history.events.map(event => <div key={event.id} className="py-2 border-t"><p>{({ UPLOADED: 'Archivo cargado', ORGANIZED: 'Organización modificada', DOWNLOADED: 'Archivo descargado' })[event.action]} · {event.actorName} · {roleLabels[event.actorRole]} · {new Date(event.createdAt).toLocaleString('es-ES')}</p>
                    {event.details.before ? <p>{event.details.before.name} / {event.details.before.folder || 'Sin carpeta'} → {event.details.after.name} / {event.details.after.folder || 'Sin carpeta'}</p> : null}</div>)}
                {!history.events.length ? <p>No hay historial disponible para este registro antiguo.</p> : null}
                <button onClick={() => setHistory(null)}>Cerrar historial</button>
            </section> : null}
        </> : null}
    </div>;
}
