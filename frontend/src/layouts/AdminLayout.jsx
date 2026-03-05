// frontend/src/layouts/AdminLayout.jsx
// Dedicated layout for /app/admin/* routes.
// Guards: only PLATFORM_ADMIN can access; others are redirected.

import React from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Users, UserPlus, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

const adminNav = [
    { icon: Building2, label: 'Clients', to: '/app/admin/clients' },
    { icon: Users, label: 'Users', to: '/app/admin/users' },
    { icon: UserPlus, label: 'Invite User', to: '/app/admin/invite' },
];

export const AdminLayout = () => {
    const { user, logout } = useAuth();

    // Guard — must be PLATFORM_ADMIN
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'PLATFORM_ADMIN') return <Navigate to="/app/dashboard" replace />;

    return (
        <div className="min-h-screen bg-neutral-bg flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-40">
                {/* Brand */}
                <div className="p-6 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">PA</span>
                        </div>
                        <div>
                            <p className="font-bold text-primary text-sm leading-tight">ONE HORIZON</p>
                            <p className="text-xs text-gray-400 leading-tight">Admin Console</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">
                        Platform
                    </div>
                    {adminNav.map(({ icon: Icon, label, to }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group',
                                    isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-text-dark/70 hover:bg-neutral-bg hover:text-primary'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        size={18}
                                        className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}
                                    />
                                    {label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="p-4 border-t border-gray-50 space-y-2">
                    <div className="px-4 py-2">
                        <p className="text-sm font-semibold text-text-dark">{user.name}</p>
                        <p className="text-xs text-gray-400">Platform Admin</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <header className="bg-white border-b border-gray-100 py-4 px-8 sticky top-0 z-30 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-text-dark">Platform Admin Console</h2>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-sm font-bold text-text-dark">{user.name}</div>
                            <div className="text-xs text-gray-400">PLATFORM_ADMIN</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                            {user.name?.charAt(0) ?? 'P'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
