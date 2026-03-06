import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiPost, apiPatch } from '../../lib/api';
import { Wrench, Plus, X, Loader2 } from 'lucide-react';

const MODE_COLORS = {
    REBILL: 'bg-amber-100 text-amber-700',
    DIRECT_VENDOR: 'bg-gray-100 text-gray-600',
};

const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELED: 'bg-red-100 text-red-700',
};

const BILLING_MODES = ['REBILL', 'DIRECT_VENDOR'];
const SR_STATUSES = ['PENDING', 'COMPLETED', 'CANCELED'];

function formatCents(cents, currency = 'EUR') {
    return new Intl.NumberFormat('en-EU', { style: 'currency', currency }).format(cents / 100);
}

function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── New Service Record Modal ─────────────────────────────────────────────────

const NewRecordModal = ({ clients, onClose, onCreate }) => {
    const [form, setForm] = useState({
        clientId: '', locationId: '', vendorId: '',
        title: '', description: '', serviceDate: '',
        costEur: '', billingMode: 'REBILL', status: 'PENDING',
    });
    const [locations, setLocations] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!form.clientId) { setLocations([]); return; }
        apiGet(`/api/clients/${form.clientId}/locations`)
            .then(setLocations)
            .catch(() => setLocations([]));
    }, [form.clientId]);

    // load vendors once
    useEffect(() => {
        apiGet('/api/admin/service-records?_vendors=1') // just to have vendors; we'll add a dedicated endpoint if needed
            .catch(() => { });
        // For now we don't have a vendors endpoint, so vendor field is optional text
    }, []);

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
            const costCents = Math.round(parseFloat(form.costEur) * 100);
            if (isNaN(costCents) || costCents <= 0) { setError('Cost must be a positive number'); setLoading(false); return; }
            const record = await apiPost('/api/admin/service-records', {
                clientId: form.clientId,
                locationId: form.locationId || null,
                vendorId: form.vendorId || null,
                title: form.title,
                description: form.description || null,
                serviceDate: form.serviceDate,
                costCents,
                billingMode: form.billingMode,
                status: form.status,
            });
            onCreate(record);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center"><Wrench size={18} className="text-amber-700" /></div>
                        <h2 className="text-lg font-bold text-text-dark">New Service Record</h2>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
                        <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="HVAC Maintenance" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Date <span className="text-red-400">*</span></label>
                            <input type="date" required value={form.serviceDate} onChange={e => setForm(f => ({ ...f, serviceDate: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cost (€) <span className="text-red-400">*</span></label>
                            <input type="number" step="0.01" min="0.01" required value={form.costEur} onChange={e => setForm(f => ({ ...f, costEur: e.target.value }))} placeholder="250.00" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Billing Mode <span className="text-red-400">*</span></label>
                            <select required value={form.billingMode} onChange={e => setForm(f => ({ ...f, billingMode: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
                                {BILLING_MODES.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all">
                                {SR_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-primary/20 disabled:opacity-60">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? 'Creating…' : 'Create Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Service Records Page ─────────────────────────────────────────────────────

export const ServiceRecords = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({ clientId: '', billingMode: '', status: '' });

    if (user && user.role !== 'PLATFORM_ADMIN') return <Navigate to="/app/dashboard" replace />;

    const fetchRecords = useCallback(() => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (filters.clientId) params.set('clientId', filters.clientId);
        if (filters.billingMode) params.set('billingMode', filters.billingMode);
        if (filters.status) params.set('status', filters.status);
        const qs = params.toString();
        apiGet(`/api/admin/service-records${qs ? '?' + qs : ''}`)
            .then(setRecords)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [filters]);

    useEffect(() => {
        if (user?.role === 'PLATFORM_ADMIN') {
            apiGet('/api/admin/clients').then(setClients).catch(() => { });
        }
    }, [user]);

    useEffect(() => {
        if (user?.role === 'PLATFORM_ADMIN') fetchRecords();
    }, [user, fetchRecords]);

    const handleStatusChange = async (rec, newStatus) => {
        try {
            const updated = await apiPatch(`/api/admin/service-records/${rec.id}`, { status: newStatus });
            setRecords(prev => prev.map(r => r.id === rec.id ? updated : r));
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Service Records</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{records.length} record{records.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-primary/20 text-sm">
                    <Plus size={16} /> New Service Record
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                <select value={filters.clientId} onChange={e => setFilters(f => ({ ...f, clientId: e.target.value }))} className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="">All Clients</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={filters.billingMode} onChange={e => setFilters(f => ({ ...f, billingMode: e.target.value }))} className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="">All Modes</option>
                    {BILLING_MODES.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
                </select>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="">All Statuses</option>
                    {SR_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {loading && <div className="flex items-center gap-2 text-gray-400 text-sm py-8"><Loader2 size={16} className="animate-spin" /> Loading records…</div>}
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm border border-red-100">{error}</div>}

            {!loading && !error && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-3 pl-5 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mode</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(rec => (
                                <tr key={rec.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 pl-5 pr-3 text-sm font-medium text-text-dark">{rec.client?.name ?? '—'}</td>
                                    <td className="px-3 py-3">
                                        <div className="text-sm text-text-dark">{rec.title}</div>
                                        {rec.description && <div className="text-xs text-gray-400 truncate max-w-[200px]">{rec.description}</div>}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-text-dark/70">{rec.vendor?.name ?? <span className="text-gray-400 italic">—</span>}</td>
                                    <td className="px-3 py-3 text-sm text-right font-mono text-text-dark">{formatCents(rec.costCents, rec.currency)}</td>
                                    <td className="px-3 py-3">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${MODE_COLORS[rec.billingMode] ?? 'bg-gray-100'}`}>
                                            {rec.billingMode?.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <select
                                            value={rec.status}
                                            onChange={e => handleStatusChange(rec, e.target.value)}
                                            className={`px-2 py-0.5 text-xs font-semibold rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${STATUS_COLORS[rec.status] ?? 'bg-gray-100'}`}
                                        >
                                            {SR_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-text-dark/70">{fmtDate(rec.serviceDate)}</td>
                                </tr>
                            ))}
                            {records.length === 0 && (
                                <tr><td colSpan={7} className="py-12 text-center text-gray-400 text-sm">No service records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <NewRecordModal
                    clients={clients}
                    onClose={() => setShowModal(false)}
                    onCreate={(rec) => { setRecords(prev => [rec, ...prev]); setShowModal(false); }}
                />
            )}
        </div>
    );
};
