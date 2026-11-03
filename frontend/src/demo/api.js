// Browser-only simulation. This is not the operational API or an auth boundary.
import { DEMO_PASSWORD, DEMO_STORAGE, seedDemo } from './seed';

const currencies = ['EUR', 'GBP', 'USD'];
const internal = user => ['PLATFORM_ADMIN', 'PLATFORM_USER'].includes(user.role);
const writer = user => ['PLATFORM_ADMIN', 'CLIENT_ADMIN'].includes(user.role);
const now = () => new Date().toISOString();
const id = () => `demo-${crypto.randomUUID()}`;
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
function requireDemo(condition, message, status = 400) { if (!condition) throw Object.assign(new Error(message), { status }); }
function cents(value) { requireDemo(Number.isInteger(value) && value > 0 && value <= 2147483647, 'Ingresá un importe positivo válido.'); return value; }

export function createDemoApi(storage) {
 const read = () => { try { const data = JSON.parse(storage.getItem(DEMO_STORAGE)); if (data?.version === 1) return data; } catch { /* Reset damaged demo data only. */ } const data = seedDemo(); storage.setItem(DEMO_STORAGE, JSON.stringify(data)); return data; };
 const save = data => { try { storage.setItem(DEMO_STORAGE, JSON.stringify(data)); } catch { throw new Error('La demo alcanzó el espacio disponible. Reiniciá los datos de ejemplo.'); } };
 const scoped = (user, clientId) => { requireDemo(internal(user) || !clientId || user.clientId === clientId, 'Otra empresa no está disponible para este perfil demo.', 403); return internal(user) ? clientId : user.clientId; };
 const record = (rows, itemId, user) => { const item = rows.find(x => x.id === itemId); requireDemo(item && (internal(user) || item.clientId === user.clientId), 'Registro no disponible en esta demo.', 404); return item; };
 const event = (data, user, clientId, action, entityId, details = {}) => data.events.unshift({ id: id(), clientId, action, entityId, actorRole: user.role, actorId: user.id, createdAt: now(), details: { actorName: user.name, ...details } });
 const related = (data, item) => ({ ...item, client: data.clients.find(x => x.id === item.clientId), location: data.locations.find(x => x.id === item.locationId) || null, vendor: data.vendors.find(x => x.id === item.vendorId) || null, invoice: data.invoices.find(x => x.id === item.invoiceId) || null });

 function statement(data, clientId) {
  const convert = (value, currency) => { const rate = data.rates.find(x => x.clientId === clientId && x.currency === currency); return currency === 'EUR' ? value : rate ? Math.round(value * rate.eurMicros / 1000000) : null; };
  const invoices = data.invoices.filter(x => x.clientId === clientId).map(x => {
   const appliedCents = data.allocations.filter(a => a.invoiceId === x.id).reduce((sum, a) => sum + a.amountCents, 0), advance = data.advances.find(a => a.invoiceId === x.id) || null;
   return { ...related(data, x), recipient: x.type === 'VENDOR_DIRECT' ? 'VENDOR' : 'ONE_HORIZON', appliedCents, advance, eligible: ['ISSUED', 'OVERDUE'].includes(x.status) && (x.type !== 'VENDOR_REBILL' || Boolean(advance)), legacyPaymentsCount: 0, totalEurCents: convert(x.totalCents, x.currency) };
  });
  const receipts = data.receipts.filter(x => x.clientId === clientId).map(x => ({ ...related(data, x), amountEurCents: convert(x.amountCents, x.currency), allocations: data.allocations.filter(a => a.receiptId === x.id).map(a => ({ ...a, invoice: data.invoices.find(i => i.id === a.invoiceId) })) }));
  const balances = [];
  for (const currency of currencies) for (const recipient of ['ONE_HORIZON', 'VENDOR']) {
   const inv = invoices.filter(x => x.eligible && x.currency === currency && x.recipient === recipient), pay = receipts.filter(x => x.currency === currency && x.recipient === recipient);
   const billedCents = inv.reduce((s, x) => s + x.totalCents, 0), appliedCents = inv.reduce((s, x) => s + x.appliedCents, 0), confirmedCents = pay.filter(x => x.status === 'CONFIRMED').reduce((s, x) => s + x.amountCents, 0);
   const outstandingCents = billedCents - appliedCents, unappliedCents = confirmedCents - pay.reduce((s, x) => s + x.allocations.reduce((n, a) => n + a.amountCents, 0), 0), netCents = outstandingCents - unappliedCents;
   balances.push({ currency, recipient, billedCents, appliedCents, outstandingCents, confirmedCents, unappliedCents, netCents, processingCents: pay.filter(x => x.status === 'PROCESSING').reduce((s, x) => s + x.amountCents, 0), reviewCents: pay.filter(x => x.status === 'REVIEW').reduce((s, x) => s + x.amountCents, 0), outstandingEurCents: convert(outstandingCents, currency), unappliedEurCents: convert(unappliedCents, currency), netEurCents: convert(netCents, currency), rate: data.rates.find(x => x.clientId === clientId && x.currency === currency) || null });
  }
  return { invoices, receipts, balances, warnings: { legacyPayments: 0, historicalPaidInvoices: invoices.filter(x => x.status === 'PAID').length, unrecognizedReimbursements: invoices.filter(x => x.type === 'VENDOR_REBILL' && !x.advance).length, unsupportedCurrencies: 0 }, events: data.events.filter(x => x.clientId === clientId), generatedAt: now() };
 }

 return async function handle(path, options = {}) {
  try {
   const url = new URL(path, 'http://demo.invalid'), route = url.pathname, q = url.searchParams, method = options.method || 'GET', data = read();
   const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
   if (route === '/api/auth/login' && method === 'POST') {
    const user = data.users.find(x => x.username === body.username?.trim() || x.email === body.username?.trim().toLowerCase());
    requireDemo(user && user.status === 'ACTIVE' && body.password === DEMO_PASSWORD, 'Usá los accesos ficticios indicados en la pantalla demo.', 401);
    return json({ user, token: `demo-session:${user.id}` });
   }
   if (route === '/api/gdpr/consent') return json({ ok: true });
   const token = new Headers(options.headers).get('Authorization')?.replace('Bearer ', '');
   const user = data.users.find(x => token === `demo-session:${x.id}` && x.status === 'ACTIVE');
   requireDemo(user, 'Iniciá sesión con un perfil demo.', 401);
   if (route === '/api/auth/logout') return json({ ok: true });
   const canMutate = method === 'GET' || method === 'HEAD';
   requireDemo(canMutate || writer(user), 'Este perfil demo tiene acceso de lectura.', 403);
   if (route.startsWith('/api/admin/')) requireDemo(internal(user) && (canMutate || user.role === 'PLATFORM_ADMIN'), 'Acceso administrativo no disponible.', 403);
   const company = value => { const clientId = scoped(user, value); requireDemo(data.clients.some(x => x.id === clientId), 'Seleccioná una empresa demo.'); return clientId; };

   if (route === '/api/admin/overview') return json({ counts: { clients: data.clients.length, pendingInvoices: data.invoices.filter(x => ['ISSUED', 'OVERDUE'].includes(x.status)).length, pendingServices: data.services.filter(x => x.status === 'PENDING').length, activeUsers: data.users.filter(x => x.status === 'ACTIVE').length, pendingInvitations: 0, locations: data.locations.length, documents: data.documents.length }, generatedAt: now() });
   if (route === '/api/workspace/options') { requireDemo(internal(user), 'Acceso no disponible.', 403); return json({ clients: data.clients, vendors: data.vendors }); }
   if (route === '/api/admin/clients') {
    if (method === 'POST') { requireDemo(body.name?.trim() && body.email?.trim(), 'Nombre y email ficticios son obligatorios.'); data.clients.push({ id: id(), name: body.name.trim(), email: body.email.trim() }); save(data); }
    const rows = data.clients.map(x => ({ ...x, _count: { users: data.users.filter(u => u.clientId === x.id).length, locations: data.locations.filter(l => l.clientId === x.id).length, invoices: data.invoices.filter(i => i.clientId === x.id).length } }));
    return json(method === 'POST' ? rows.at(-1) : rows, method === 'POST' ? 201 : 200);
   }
   if (route === '/api/admin/users') return json(data.users.filter(x => !q.get('clientId') || x.clientId === q.get('clientId')).map(x => ({ ...x, client: data.clients.find(c => c.id === x.clientId) || null })));
   if (route === '/api/admin/invites') return json({ error: 'Las invitaciones y correos están desactivados en esta demo. Usá los cuatro accesos de ejemplo.' }, 400);
   const locationsMatch = route.match(/^\/api\/clients\/([^/]+)\/locations$/);
   if (locationsMatch) { const clientId = company(locationsMatch[1]); return json({ clientId, locations: data.locations.filter(x => x.clientId === clientId) }); }

   if (route === '/api/admin/invoices' || route.startsWith('/api/admin/invoices/')) {
    if (method === 'GET') return json(data.invoices.filter(x => !q.get('clientId') || x.clientId === q.get('clientId')).map(x => related(data, x)));
    const current = method === 'PATCH' ? record(data.invoices, route.split('/').at(-1), user) : null, candidate = { ...current, ...body };
    candidate.clientId = company(candidate.clientId); cents(candidate.totalCents);
    requireDemo(currencies.includes(candidate.currency) && ['ONEHORIZON_FEE', 'VENDOR_REBILL', 'VENDOR_DIRECT'].includes(candidate.type) && ['DRAFT', 'ISSUED', 'OVERDUE', 'PAID', 'CANCELED'].includes(candidate.status || 'ISSUED'), 'Datos de factura demo inválidos.');
    requireDemo(!candidate.locationId || data.locations.some(x => x.id === candidate.locationId && x.clientId === candidate.clientId), 'El establecimiento debe pertenecer a la empresa.');
    requireDemo(candidate.type === 'ONEHORIZON_FEE' || data.vendors.some(x => x.id === candidate.vendorId), 'Seleccioná un proveedor demo.');
    if (current) requireDemo(!data.allocations.some(x => x.invoiceId === current.id) || (current.totalCents === candidate.totalCents && current.clientId === candidate.clientId && current.currency === candidate.currency && current.type === candidate.type && current.vendorId === candidate.vendorId && current.status === candidate.status), 'Factura demo con imputaciones: cambio económico bloqueado.');
    if (current) Object.assign(current, candidate); else data.invoices.unshift({ ...candidate, id: id(), status: candidate.status || 'ISSUED', createdAt: now() });
    save(data); return json(related(data, current || data.invoices[0]), current ? 200 : 201);
   }
   if (route === '/api/workspace/services' || route.startsWith('/api/admin/service-records')) {
    const scope = scoped(user, q.get('clientId'));
    if (method === 'GET') return json({ records: data.services.filter(x => (!scope || x.clientId === scope) && (!q.get('status') || x.status === q.get('status'))).map(x => { const item = related(data, x); if (!internal(user)) { delete item.costCents; delete item.currency; delete item.billingMode; } return item; }) });
    if (method === 'POST') { company(body.clientId); requireDemo(body.title?.trim() && body.serviceDate && currencies.includes(body.currency), 'Completá nombre, fecha y moneda.'); requireDemo(!body.locationId || data.locations.some(x => x.id === body.locationId && x.clientId === body.clientId), 'Establecimiento de otra empresa.'); requireDemo(Number.isInteger(body.costCents) && body.costCents >= 0, 'Coste demo inválido.'); data.services.unshift({ ...body, id: id(), status: 'PENDING', invoiceId: null }); }
    else { const item = record(data.services, route.split('/').at(-1), user); requireDemo(['PENDING', 'COMPLETED', 'CANCELED'].includes(body.status), 'Estado inválido.'); item.status = body.status; }
    save(data); return json({ ok: true });
   }
   if (route === '/api/dashboard') { const account = statement(data, user.clientId); return json({ ...account, pendingInvoices: account.invoices.filter(x => x.eligible && x.totalCents > x.appliedCents).length, recentDocuments: data.documents.filter(x => x.clientId === user.clientId).slice(0, 4).map(({ bytes: _bytes, ...x }) => x) }); }
   if (route === '/api/accounts/statement') return json(statement(data, company(q.get('clientId'))));
   if (route === '/api/accounts/payments' && method === 'POST') {
    const clientId = company(body.clientId); cents(body.amountCents); requireDemo(currencies.includes(body.currency) && ['ONE_HORIZON', 'VENDOR'].includes(body.recipient) && body.reference?.trim() && body.paidAt, 'Completá los datos del pago demo.');
    requireDemo(body.recipient !== 'VENDOR' || data.vendors.some(x => x.id === body.vendorId), 'Proveedor demo requerido.');
    const previous = data.receipts.find(x => x.clientId === clientId && x.requestKey === body.requestKey); if (previous) return json(previous);
    const payment = { ...body, clientId, id: id(), status: 'PROCESSING', confirmedBy: null, createdAt: now() }; data.receipts.unshift(payment); event(data, user, clientId, 'PAYMENT_RECORDED', payment.id, { reference: body.reference, amountCents: body.amountCents, currency: body.currency }); save(data); return json(payment, 201);
   }
   const paymentMatch = route.match(/^\/api\/accounts\/payments\/([^/]+)\/(state|allocations)$/);
   if (paymentMatch && method === 'POST') {
    const payment = record(data.receipts, paymentMatch[1], user);
    if (paymentMatch[2] === 'state') {
     requireDemo((payment.status === 'PROCESSING' && body.status === 'REVIEW') || (payment.status === 'REVIEW' && body.status === 'CONFIRMED'), 'Avanzá del proceso a revisión y luego a confirmado.'); payment.status = body.status;
     if (body.status === 'CONFIRMED') { payment.confirmedBy = user.id; payment.confirmedAt = now(); }
     event(data, user, payment.clientId, body.status === 'CONFIRMED' ? 'PAYMENT_CONFIRMED' : 'PAYMENT_REVIEW', payment.id, { reference: payment.reference });
    } else {
     const previous = data.allocations.find(x => x.receiptId === payment.id && x.requestKey === body.requestKey); if (previous) return json(previous);
     const invoice = statement(data, payment.clientId).invoices.find(x => x.id === body.invoiceId); cents(body.amountCents);
     requireDemo(payment.status === 'CONFIRMED' && invoice?.eligible && invoice.currency === payment.currency && invoice.recipient === payment.recipient && (payment.recipient !== 'VENDOR' || invoice.vendorId === payment.vendorId), 'Factura y pago deben coincidir en empresa, moneda y destinatario.');
     const used = data.allocations.filter(x => x.receiptId === payment.id).reduce((s, x) => s + x.amountCents, 0);
     requireDemo(body.amountCents <= payment.amountCents - used && body.amountCents <= invoice.totalCents - invoice.appliedCents, 'El importe supera el disponible o el pendiente de factura.');
     data.allocations.push({ ...body, id: id(), receiptId: payment.id }); event(data, user, payment.clientId, 'PAYMENT_ALLOCATED', payment.id, { amountCents: body.amountCents, currency: payment.currency });
    }
    save(data); return json(payment);
   }
   if (route === '/api/accounts/exchange-rates' && method === 'POST') { const clientId = company(body.clientId), value = Number(body.eurPerUnit); requireDemo(['GBP', 'USD'].includes(body.currency) && Number.isFinite(value) && value > 0 && value < 10000 && body.source?.trim(), 'Cotización demo inválida.'); data.rates = data.rates.filter(x => !(x.clientId === clientId && x.currency === body.currency)); data.rates.push({ ...body, id: id(), clientId, eurMicros: Math.round(value * 1000000) }); event(data, user, clientId, 'EXCHANGE_RATE_RECORDED', clientId); save(data); return json({ ok: true }); }
   const advanceMatch = route.match(/^\/api\/accounts\/invoices\/([^/]+)\/advance$/);
   if (advanceMatch && method === 'POST') { requireDemo(user.role === 'PLATFORM_ADMIN', 'Solo administrador One Horizon demo.', 403); const invoice = record(data.invoices, advanceMatch[1], user); requireDemo(invoice.type === 'VENDOR_REBILL' && !data.advances.some(x => x.invoiceId === invoice.id), 'Adelanto demo no disponible.'); data.advances.push({ ...body, invoiceId: invoice.id }); event(data, user, invoice.clientId, 'VENDOR_ADVANCE_RECORDED', invoice.id); save(data); return json({ ok: true }); }

   if (route === '/api/documents' || route === '/api/documents/context' || route === '/api/documents/upload') {
    const clientId = company(q.get('clientId'));
    if (route.endsWith('/context')) return json({ invoices: data.invoices.filter(x => x.clientId === clientId), receipts: data.receipts.filter(x => x.clientId === clientId), locations: data.locations.filter(x => x.clientId === clientId), folders: [...new Set(data.documents.filter(x => x.clientId === clientId).map(x => x.folder))] });
    if (route.endsWith('/upload') && method === 'POST') {
     const previous = data.documents.find(x => x.clientId === clientId && x.uploadKey === q.get('uploadKey')); if (previous) return json(previous);
     requireDemo(options.body instanceof Blob && options.body.size > 0 && options.body.size <= 256 * 1024, 'En esta demo usá un archivo ficticio de hasta 256 KB.');
     for (const [field, rows] of [['invoiceId', data.invoices], ['receiptId', data.receipts], ['locationId', data.locations]]) if (q.get(field)) { const item = record(rows, q.get(field), user); requireDemo(item.clientId === clientId, 'Documento de otra empresa.'); }
     const bytes = new Uint8Array(await options.body.arrayBuffer()); let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
     const item = { ...Object.fromEntries(q), id: id(), clientId, mimeType: options.body.type || 'application/octet-stream', sizeBytes: bytes.length, bytes: btoa(binary), downloadAvailable: true, createdAt: now(), updatedAt: now() };
     requireDemo(item.name?.trim() && !/[\\/]/.test(item.name), 'Nombre de archivo demo inválido.'); data.documents.unshift(item); data.documentEvents.unshift({ id: id(), documentId: item.id, action: 'UPLOADED', actorRole: user.role, actorName: user.name, createdAt: now(), details: {} }); save(data); return json({ id: item.id }, 201);
    }
    const documents = data.documents.filter(x => x.clientId === clientId && ['invoiceId', 'receiptId', 'category', 'folder'].every(key => !q.get(key) || x[key] === q.get(key))).map(({ bytes: _bytes, ...x }) => ({ ...related(data, x), receipt: data.receipts.find(p => p.id === x.receiptId) || null }));
    return json({ documents, nextCursor: null });
   }
   const documentMatch = route.match(/^\/api\/documents\/([^/]+)(?:\/(download|history))?$/);
   if (documentMatch) {
    const item = record(data.documents, documentMatch[1], user);
    if (documentMatch[2] === 'download') { const bytes = Uint8Array.from(atob(item.bytes), c => c.charCodeAt(0)); return new Response(bytes, { headers: { 'Content-Type': item.mimeType, 'Cache-Control': 'no-store' } }); }
    if (documentMatch[2] === 'history') return json(data.documentEvents.filter(x => x.documentId === item.id));
    if (method === 'PATCH') { requireDemo(item.updatedAt === body.expectedUpdatedAt, 'El documento cambió; actualizá la vista.'); const before = { name: item.name, folder: item.folder }; item.name = body.name; item.category = body.category; item.folder = body.folder; item.updatedAt = now(); data.documentEvents.unshift({ id: id(), documentId: item.id, action: 'ORGANIZED', actorRole: user.role, actorName: user.name, createdAt: now(), details: { before, after: { name: item.name, folder: item.folder } } }); save(data); return json({ ok: true }); }
   }
   return json({ error: 'Esta acción no está simulada en la demo. No se envió ninguna solicitud a un servidor.' }, 404);
  } catch (error) { return json({ error: error.message || 'No se pudo completar la acción demo.' }, error.status || 400); }
 };
}

export function installDemo() {
 const handle = createDemoApi(localStorage), original = window.fetch.bind(window);
 if (!localStorage.getItem('token')?.startsWith('demo-session:')) { localStorage.removeItem('token'); localStorage.removeItem('user'); }
 window.fetch = async (input, options = {}) => {
  if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const url = new URL(input instanceof Request ? input.url : input, window.location.origin);
  if (url.origin !== window.location.origin) return json({ error: 'La demo no permite conexiones externas.' }, 403);
  if (url.pathname.includes('/api/')) {
   const path = url.pathname.replace(/^\/preview-api-disabled/, '');
   return handle(path + url.search, options);
  }
  return original(input, options);
 };
}
