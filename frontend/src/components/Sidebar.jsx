import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    MapPin,
    Folder,
    CreditCard,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
    { icon: FileText, label: 'Account Statement', path: '/app/statement' },
    { icon: Folder, label: 'Documents', path: '/app/documents' },
    { icon: MapPin, label: 'Locations', path: '/app/locations' },
    { icon: Folder, label: 'Files', path: '/app/files' },
    { icon: CreditCard, label: 'Payments', path: '/app/payments' },
];

export const Sidebar = () => {
    const { logout } = useAuth();

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex">

            {/* Logo */}
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">OH</span>
                </div>
                <span className="font-bold text-primary tracking-tight">
                    ONE HORIZON
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-text-dark/70 hover:bg-neutral-bg hover:text-primary"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    size={18}
                                    className={
                                        isActive
                                            ? "text-white"
                                            : "text-gray-400 group-hover:text-primary"
                                    }
                                />
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-50">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>

        </aside>
    );
};
