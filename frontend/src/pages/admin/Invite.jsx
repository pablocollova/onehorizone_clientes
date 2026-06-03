import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiPost } from '../../lib/api';
import { Copy, Check, Send } from 'lucide-react';

const ROLES = [
    { value: 'CLIENT_USER', label: 'Client User' },
    { value: 'CLIENT_ADMIN', label: 'Client Admin' },
    { value: 'PLATFORM_ADMIN', label: 'Platform Admin' },
];

export const Invite = () => {
    const { user } = useAuth();

    const [clients, setClients] = useState([]);
    const [form, setForm] = useState({ email: '', name: '', role: 'CLIENT_USER', clientId: '' });
    const [loading, setLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user?.role !== 'PLATFORM_ADMIN') return;

        apiGet('/api/admin/clients')
            .then(setClients)
            .catch(() => { /* non-critical failure */ });
    }, [user]);

    // Guard
    if (user && user.role !== 'PLATFORM_ADMIN') return <Navigate to="/app/dashboard" replace />;

    const needsClient = form.role !== 'PLATFORM_ADMIN';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setInviteLink(null);
        setLoading(true);
        try {
            const body = {
                email: form.email,
                name: form.name || undefined,
                role: form.role,
                ...(needsClient && form.clientId ? { clientId: form.clientId } : {}),
            };
            const data = await apiPost('/api/admin/invites', body);
            setInviteLink(data.inviteLink);
            setForm(f => ({ ...f, email: '', name: '' }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard access can fail without blocking invite creation */ }
    };

    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-bold text-primary mb-1">Invite User</h1>
            <p className="text-sm text-gray-400 mb-8">
                Send an activation link to a new user. The link is valid for 48 hours.
            </p>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {inviteLink && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                        <p className="text-sm font-semibold text-green-700">✅ Invitation created! Share this link:</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-xs text-gray-700 break-all font-mono">
                                {inviteLink}
                            </code>
                            <button
                                onClick={copyLink}
                                className="shrink-0 flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <p className="text-xs text-green-600">The link has also been logged to the backend console.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50"
                            placeholder="user@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-gray-400">(optional)</span></label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50"
                            placeholder="Jane Smith"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                            <select
                                value={form.role}
                                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50"
                            >
                                {ROLES.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        {needsClient && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                                <select
                                    value={form.clientId}
                                    onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                                    required={needsClient}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50"
                                >
                                    <option value="">Select client…</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-60"
                        >
                            <Send size={16} />
                            {loading ? 'Sending…' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
