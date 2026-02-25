import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';

export const AppLayout = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    console.log("AppLayout user:", user);
    return (
        <div className="min-h-screen bg-neutral-bg flex">
            <Sidebar />

            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center sticky top-0 z-30">
                    <div className="flex items-center gap-4 md:hidden">
                        <button className="text-text-dark"><Menu size={24} /></button>
                        <span className="font-bold text-primary">ONE HORIZON</span>
                    </div>

                    <div className="hidden md:block">
                        <h2 className="text-lg font-bold text-text-dark">Horizon Corp</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-text-dark">{user.name}</div>
                            <div className="text-xs text-text-dark/50">Premium Client</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
