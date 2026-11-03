import { isPlatformReader } from './permissions';
export const documentCategories = { INVOICE: 'Facturas', PAYMENT: 'Comprobantes de pago', CONTRACT: 'Contratos', OTHER: 'Otros documentos' };
export function documentsUrl(user, { clientId, invoiceId, receiptId } = {}) {
    const params = new URLSearchParams();
    if (isPlatformReader(user?.role) && clientId) params.set('clientId', clientId);
    if (invoiceId) params.set('invoiceId', invoiceId);
    if (receiptId) params.set('receiptId', receiptId);
    const query = params.toString();
    return `${isPlatformReader(user?.role) ? '/app/admin/documents' : '/app/documents'}${query ? '?' + query : ''}`;
}
