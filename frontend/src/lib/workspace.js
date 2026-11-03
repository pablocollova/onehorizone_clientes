import { useEffect, useState } from 'react';
import { apiGet } from './api';

export const invoiceLabels = { ONEHORIZON_FEE: 'Honorarios One Horizon', VENDOR_REBILL: 'Reembolso de proveedor', VENDOR_DIRECT: 'Pago directo a proveedor' };
export const statusLabels = { DRAFT: 'Borrador', ISSUED: 'Emitida', OVERDUE: 'Vencida', PAID: 'Marcada pagada', CANCELED: 'Cancelada', PENDING: 'Pendiente', COMPLETED: 'Finalizado', PROCESSING: 'En proceso', REVIEW: 'En revisión', CONFIRMED: 'Confirmado' };
export const dateLabel = value => value ? new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha';

export function useWorkspaceData(url) {
    const [snapshot, setSnapshot] = useState({ url: null, data: null, error: '' });
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        if (!url) return;
        const controller = new AbortController();
        apiGet(url, { signal: controller.signal })
            .then(data => { if (!controller.signal.aborted) setSnapshot({ url, data, error: '' }); })
            .catch(error => { if (!controller.signal.aborted) setSnapshot({ url, data: null, error: error.message }); });
        return () => controller.abort();
    }, [url, revision]);
    const reload = () => { setSnapshot({ url: null, data: null, error: '' }); setRevision(value => value + 1); };
    return { data: snapshot.url === url ? snapshot.data : null, error: snapshot.url === url ? snapshot.error : '', loading: Boolean(url) && snapshot.url !== url, reload };
}
