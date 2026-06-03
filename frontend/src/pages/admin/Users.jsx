import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiGet } from '../../lib/api';
import { UserCircle } from 'lucide-react';

const ROLE_COLORS = {
    PLATFORM_ADMIN: 'bg-purple-100 text-purple-700',
    CLIENT_ADMIN: 'bg-blue-100 text-blue-700',
    CLIENT_USER: 'bg-gray-100 text-gray-600',
};

const STATUS_COLORS = {
    ACTIVE: 'bg-green-100 text-green-700',
    INVITED: 'bg-yellow-100 text-yellow-700',
    DISABLED: 'bg-red-100 text-red-700',
};

export const Users = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [clients, setClients] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user?.role !== 'PLATFORM_ADMIN') return;

        const url = filter
            ? `/api/admin/users?clientId=${encodeURIComponent(filter)}`
            : '/api/admin/users';

        Promise.all([
            apiGet(url),
            apiGet('/api/admin/clients'),
        ])
            .then(([usersData, clientsData]) => {
                setUsers(usersData);
                setClients(clientsData);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [user, filter]);

    // Guard
    if (user && user.role !== 'PLATFORM_ADMIN') {
        return <Navigate to="/app/dashboard" replace />;
    }

    const handleFilterChange = (e) => {
        setLoading(true);
        setError(null);
        setFilter(e.target.value);
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-primary">All Users</h1>
                <select
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={filter}
                    onChange={handleFilterChange}
                >
                    <option value="">All Clients</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {loading && (
                <div className="text-gray-400 text-sm">Loading users...</div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">{error}</div>
            )}

            {!loading && !error && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-3 pl-5 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email / Username</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 pl-5 pr-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <UserCircle size={18} className="text-primary" />
                                            </div>
                                            <span className="text-sm font-medium text-text-dark">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="text-sm text-text-dark">{u.email ?? '—'}</div>
                                        <div className="text-xs text-gray-400">@{u.username}</div>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-text-dark/70">
                                        {u.client?.name ?? <span className="text-gray-400 italic">None</span>}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[u.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
