export const DEMO_PASSWORD = 'DemoHorizon2026!';
export const DEMO_STORAGE = 'onehorizon-dashboard-demo-v1';
export const demoUsers = [
 { id: 'demo-admin', username: 'demo_admin', name: 'Admin One Horizon · Demo', email: 'admin@example.test', role: 'PLATFORM_ADMIN', clientId: null, status: 'ACTIVE' },
 { id: 'demo-client', username: 'demo_cliente', name: 'Lucía · Costa Azul Demo', email: 'cliente@example.test', role: 'CLIENT_ADMIN', clientId: 'demo-costa', status: 'ACTIVE' },
 { id: 'demo-reader', username: 'demo_lector', name: 'Lector · Costa Azul Demo', email: 'lector@example.test', role: 'CLIENT_USER', clientId: 'demo-costa', status: 'ACTIVE' },
 { id: 'demo-internal-reader', username: 'demo_lector_oh', name: 'Lector One Horizon · Demo', email: 'lector-oh@example.test', role: 'PLATFORM_USER', clientId: null, status: 'ACTIVE' },
];

function samplePdf() {
 const stream = 'BT /F1 18 Tf 50 760 Td (ONE HORIZON - DEMO) Tj 0 -30 Td /F1 12 Tf (Fictional invoice OH-DEMO-001 - EUR 100.00) Tj 0 -24 Td (No fiscal validity. Example data only.) Tj ET';
 const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
 let pdf = '%PDF-1.4\n'; const offsets = [0];
 objects.forEach((object, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${object}\nendobj\n`; });
 const xref = pdf.length;
 pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(x => String(x).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return btoa(pdf);
}

export function seedDemo() {
 const date = new Date().toISOString(), day = date.slice(0, 10);
 const invoice = (id, number, type, totalCents, currency = 'EUR', vendorId = null, clientId = 'demo-costa') => ({ id, number, clientId, locationId: clientId === 'demo-costa' ? 'demo-location' : 'demo-location-2', vendorId, type, totalCents, currency, dueDate: day, status: 'ISSUED', createdAt: date });
 const pdf = samplePdf();
 return {
  version: 1, users: structuredClone(demoUsers),
  clients: [{ id: 'demo-costa', name: 'Costa Azul Restauración · Demo', email: 'costa@example.test' }, { id: 'demo-sierra', name: 'Sierra Comercio · Demo', email: 'sierra@example.test' }],
  vendors: [{ id: 'demo-maintenance', name: 'Mantenimiento del Sur · Demo' }, { id: 'demo-utilities', name: 'Suministros Costa · Demo' }],
  locations: [{ id: 'demo-location', clientId: 'demo-costa', label: 'Restaurante Costa Azul · Demo', address: 'Calle Ficticia 10, Marbella' }, { id: 'demo-location-2', clientId: 'demo-sierra', label: 'Local Sierra · Demo', address: 'Calle de Ejemplo 2, Málaga' }],
  invoices: [invoice('demo-invoice', 'OH-DEMO-001', 'ONEHORIZON_FEE', 10000), invoice('demo-rebill', 'REEM-DEMO-002', 'VENDOR_REBILL', 25000, 'EUR', 'demo-maintenance'), invoice('demo-direct', 'PROV-DEMO-003', 'VENDOR_DIRECT', 18000, 'EUR', 'demo-utilities'), invoice('demo-gbp', 'OH-DEMO-GBP', 'ONEHORIZON_FEE', 12000, 'GBP'), invoice('demo-other', 'OH-DEMO-SIERRA', 'ONEHORIZON_FEE', 8000, 'EUR', null, 'demo-sierra')],
  services: [{ id: 'demo-service', clientId: 'demo-costa', locationId: 'demo-location', vendorId: 'demo-maintenance', title: 'Revisión de climatización · Demo', description: 'Revisión preventiva del local. Registro completamente ficticio.', serviceDate: day, costCents: 25000, currency: 'EUR', billingMode: 'REBILL', status: 'PENDING', invoiceId: 'demo-rebill' }, { id: 'demo-service-completed', clientId: 'demo-costa', locationId: 'demo-location', vendorId: null, title: 'Organización documental · Demo', description: 'Preparación de la carpeta de apertura ficticia.', serviceDate: day, costCents: 10000, currency: 'EUR', billingMode: 'REBILL', status: 'COMPLETED', invoiceId: 'demo-invoice' }, { id: 'demo-service-other', clientId: 'demo-sierra', locationId: 'demo-location-2', vendorId: null, title: 'Coordinación de suministros · Demo', description: 'Ejemplo de otra empresa.', serviceDate: day, costCents: 8000, currency: 'EUR', billingMode: 'REBILL', status: 'PENDING', invoiceId: 'demo-other' }],
  receipts: [{ id: 'demo-receipt', clientId: 'demo-costa', amountCents: 4000, currency: 'EUR', recipient: 'ONE_HORIZON', vendorId: null, reference: 'Transferencia de ejemplo · Demo', paidAt: day, status: 'CONFIRMED', confirmedBy: 'demo-admin', confirmedAt: date, createdAt: date, requestKey: 'seed-receipt' }],
  allocations: [{ id: 'demo-allocation', receiptId: 'demo-receipt', invoiceId: 'demo-invoice', amountCents: 4000, requestKey: 'seed-allocation' }],
  advances: [{ invoiceId: 'demo-rebill', reference: 'Adelanto ficticio de mantenimiento', paidAt: day }],
  rates: [{ id: 'demo-rate', clientId: 'demo-costa', currency: 'GBP', eurMicros: 1180000, source: 'Cotización ilustrativa, no de mercado', effectiveAt: day }],
  documents: [{ id: 'demo-document', clientId: 'demo-costa', locationId: 'demo-location', invoiceId: 'demo-invoice', receiptId: null, name: 'Factura-OH-DEMO-001.pdf', category: 'INVOICE', folder: '2026/Facturas', mimeType: 'application/pdf', sizeBytes: atob(pdf).length, bytes: pdf, downloadAvailable: true, createdAt: date, updatedAt: date }],
  events: [{ id: 'demo-event', clientId: 'demo-costa', entityId: 'demo-receipt', action: 'PAYMENT_CONFIRMED', actorRole: 'PLATFORM_ADMIN', actorId: 'demo-admin', createdAt: date, details: { actorName: 'Admin One Horizon · Demo', reference: 'Transferencia de ejemplo · Demo', amountCents: 4000, currency: 'EUR' } }], documentEvents: [],
 };
}
