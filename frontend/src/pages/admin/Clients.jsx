import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiPost } from '../../lib/api';
import { Building2, Users, MapPin, FileText, Plus, X, Loader2 } from 'lucide-react';

// ─── New Client Modal ────────────────────────────────────────────────────────

const NewClientModal = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const client = await apiPost('/api/admin/clients', { name: name.trim(), email: email.trim() });
            onCreate(client);
        } catch (err) {
            // Surface the friendly message from backend when available
            const msg = err.message || 'Something went wrong';
            if (msg.includes('CLIENT_EMAIL_EXISTS') || msg.includes('already exists')) {
                setError('A client with this email already exists.');
            } else if (msg.includes('VALIDATION_ERROR')) {
                setError('Name and email are required.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 size={18} className="text-primary" />
                        </div>
                        <h2 className="text-lg font-bold text-text-dark">New Client</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Company Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Mediterranean Villas"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Contact Email <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="hello@company.com"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-primary/20 disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? 'Creating…' : 'Create Client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Client Card ─────────────────────────────────────────────────────────────

const ClientCard = ({ client }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={20} className="text-primary" />
            </div>
            <div className="min-w-0">
                <p className="font-semibold text-text-dark truncate">{client.name}</p>
                <p className="text-xs text-gray-400 truncate">{client.email}</p>
            </div>
        </div>

        <div className="flex gap-4 pt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
                <Users size={13} />
                {client._count?.users ?? 0} users
            </span>
            <span className="flex items-center gap-1">
                <MapPin size={13} />
                {client._count?.locations ?? 0} locations
            </span>
            <span className="flex items-center gap-1">
                <FileText size={13} />
                {client._count?.invoices ?? 0} invoices
            </span>
        </div>

        <div className="text-xs text-gray-300 pt-1 font-mono truncate" title={client.id}>
            {client.id}
        </div>
    </div>
);

// ─── Clients Page ─────────────────────────────────────────────────────────────

export const Clients = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchClients = useCallback(() => {
        apiGet('/api/admin/clients')
            .then(setClients)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (user?.role === 'PLATFORM_ADMIN') fetchClients();
    }, [user, fetchClients]);

    // Guard: redirect non-admins
    if (user && user.role !== 'PLATFORM_ADMIN') {
        return <Navigate to="/app/dashboard" replace />;
    }

    const handleCreated = (newClient) => {
        // Append the new client immediately (counts default to 0)
        setClients(prev => [...prev, { ...newClient, _count: { users: 0, locations: 0, invoices: 0 } }]);
        setShowModal(false);
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary">All Clients</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {clients.length} tenant{clients.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-primary/20 text-sm"
                >
                    <Plus size={16} />
                    New Client
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-8">
                    <Loader2 size={16} className="animate-spin" />
                    Loading clients…
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm border border-red-100">
                    {error}
                </div>
            )}

            {/* Grid */}
            {!loading && !error && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {clients.map(client => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                    {clients.length === 0 && (
                        <p className="text-gray-400 text-sm col-span-full py-8 text-center">
                            No clients yet. Create your first one.
                        </p>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <NewClientModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreated}
                />
            )}
        </div>
    );
};
