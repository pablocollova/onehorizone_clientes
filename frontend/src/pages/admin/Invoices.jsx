import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiPost, apiPatch } from '../../lib/api';
import { FileText, Plus, X, Loader2 } from 'lucide-react';

const TYPE_COLORS = {
    ONEHORIZON_FEE: 'bg-primary/10 text-primary',
    VENDOR_REBILL: 'bg-amber-100 text-amber-700',
    VENDOR_DIRECT: 'bg-gray-100 text-gray-600',
};

const STATUS_COLORS = {
    DRAFT: 'bg-gray-100 text-gray-600',
    ISSUED: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
    CANCELED: 'bg-gray-100 text-gray-400 line-through',
};

const TYPES = ['ONEHORIZON_FEE', 'VENDOR_REBILL', 'VENDOR_DIRECT'];
const STATUSES = ['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELED'];

function formatCents(cents, currency = 'EUR') {
    return new Intl.NumberFormat('en-EU', { style: 'currency', currency }).format(cents / 100);
}

function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── New Invoice Modal ────────────────────────────────────────────────────────

const NewInvoiceModal = ({ clients, onClose, onCreate }) => {
    const [form, setForm] = useState({ clientId: '', locationId: '', type: 'ONEHORIZON_FEE', totalEur: '', dueDate: '', status: 'ISSUED' });
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // load locations when client changes
    useEffect(() => {
        if (!form.clientId) { setLocations([]); return; }
        apiGet(`/api/clients/${form.clientId}/locations`)
            .then(data => setLocations(data.locations || []))
            .catch(() => setLocations([]));
    }, [form.clientId]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const totalCents = Math.round(parseFloat(form.totalEur) * 100);
            if (isNaN(totalCents) || totalCents <= 0) { setError('Amount must be a positive number'); setLoading(false); return; }
            const inv = await apiPost('/api/admin/invoices', {
                clientId: form.clientId,
                locationId: form.locationId || null,
                type: form.type,
                totalCents,
                dueDate: form.dueDate || null,
                status: form.status,
            });
            onCreate(inv);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><FileText size={18} className="text-primary" /></div>
                        <h2 className="text-lg font-bold text-text-dark">New Invoice</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Client <span className="text-red-400">*</span></label>
                            <select required value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value, locationId: '' }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
                                <option value="">Select…</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                            <select value={form.locationId} onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
                                <option value="">None</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type <span className="text-red-400">*</span></label>
                            <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
                                {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Total (€) <span className="text-red-400">*</span></label>
                            <input type="number" step="0.01" min="0.01" required value={form.totalEur} onChange={e => setForm(f => ({ ...f, totalEur: e.target.value }))} placeholder="250.00" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-primary/20 disabled:opacity-60">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? 'Creating…' : 'Create Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Invoices Page ────────────────────────────────────────────────────────────

export const Invoices = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({ clientId: '', type: '', status: '' });

    const fetchInvoices = useCallback(() => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (filters.clientId) params.set('clientId', filters.clientId);
        if (filters.type) params.set('type', filters.type);
        if (filters.status) params.set('status', filters.status);
        const qs = params.toString();
        apiGet(`/api/admin/invoices${qs ? '?' + qs : ''}`)
            .then(setInvoices)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [filters]);

    useEffect(() => {
        if (user?.role === 'PLATFORM_ADMIN') {
            apiGet('/api/admin/clients').then(setClients).catch(() => undefined);
        }
    }, [user]);

    useEffect(() => {
        if (user?.role === 'PLATFORM_ADMIN') queueMicrotask(fetchInvoices);
    }, [user, fetchInvoices]);

    const handleStatusChange = async (inv, newStatus) => {
        try {
            const updated = await apiPatch(`/api/admin/invoices/${inv.id}`, { status: newStatus });
            setInvoices(prev => prev.map(i => i.id === inv.id ? updated : i));
        } catch (err) {
            alert(err.message);
        }
    };

    if (user && user.role !== 'PLATFORM_ADMIN') return <Navigate to="/app/dashboard" replace />;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Invoices</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-primary/20 text-sm">
                    <Plus size={16} /> New Invoice
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                <select value={filters.clientId} onChange={e => setFilters(f => ({ ...f, clientId: e.target.value }))} className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="">All Clients</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="">All Types</option>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {loading && <div className="flex items-center gap-2 text-gray-400 text-sm py-8"><Loader2 size={16} className="animate-spin" /> Loading invoices…</div>}
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm border border-red-100">{error}</div>}

            {!loading && !error && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-3 pl-5 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 pl-5 pr-3 text-sm font-medium text-text-dark">{inv.client?.name ?? '—'}</td>
                                    <td className="px-3 py-3 text-sm text-text-dark/70">{inv.location?.label ?? '—'}</td>
                                    <td className="px-3 py-3">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${TYPE_COLORS[inv.type] ?? 'bg-gray-100'}`}>
                                            {inv.type?.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-right font-mono text-text-dark">{formatCents(inv.totalCents, inv.currency)}</td>
                                    <td className="px-3 py-3">
                                        <select
                                            value={inv.status}
                                            onChange={e => handleStatusChange(inv, e.target.value)}
                                            className={`px-2 py-0.5 text-xs font-semibold rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${STATUS_COLORS[inv.status] ?? 'bg-gray-100'}`}
                                        >
                                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-text-dark/70">{fmtDate(inv.dueDate)}</td>
                                    <td className="px-3 py-3 text-xs text-gray-300 font-mono truncate max-w-[100px]" title={inv.id}>{inv.id.slice(-8)}</td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr><td colSpan={7} className="py-12 text-center text-gray-400 text-sm">No invoices found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <NewInvoiceModal
                    clients={clients}
                    onClose={() => setShowModal(false)}
                    onCreate={(inv) => { setInvoices(prev => [inv, ...prev]); setShowModal(false); }}
                />
            )}
        </div>
    );
};
