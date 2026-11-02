import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../../lib/api';

const metrics = [
    ['clients', 'Companies', '/app/admin/clients'],
    ['locations', 'Establishments'],
    ['activeUsers', 'Active users', '/app/admin/users'],
    ['pendingInvitations', 'Pending invitations', '/app/admin/users'],
    ['pendingInvoices', 'Issued / overdue invoices', '/app/admin/invoices'],
    ['pendingServices', 'Pending service records', '/app/admin/service-records'],
    ['documents', 'Document records'],
];

export function Overview() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        apiGet('/api/admin/overview', { signal: controller.signal })
            .then(result => { if (!controller.signal.aborted) setData(result); })
            .catch(err => { if (!controller.signal.aborted) setError(err.message); });
        return () => controller.abort();
    }, [attempt]);
    const refresh = () => { setError(''); setData(null); setAttempt(value => value + 1); };
    return (
        <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-primary">Operations overview</h1>
                    <p className="text-gray-600">Current records across all companies.</p></div>
                <button type="button" onClick={refresh} className="px-4 py-2 rounded-lg border bg-white">Refresh</button>
            </div>
            {error ? <div role="alert" className="p-4 bg-red-50 text-red-700">Could not load overview: {error}
                <button type="button" onClick={refresh} className="ml-3 underline">Retry</button></div>
                : !data ? <p role="status">Loading operations…</p>
                    : <>
                        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {metrics.map(([key, label, to]) => <div key={key} className="rounded-xl border bg-white p-5">
                                <dt className="text-gray-600">{label}</dt>
                                <dd className="text-3xl font-bold text-primary my-2">{data.counts[key]}</dd>
                                {to ? <Link className="text-primary underline" to={to}>Open {label.toLowerCase()}</Link> : null}
                            </div>)}
                        </dl>
                        <p className="text-sm text-gray-500">Updated {new Date(data.generatedAt).toLocaleString()}</p>
                    </>}
        </div>
    );
}
