import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const PublicLayout = () => {
    return (
        <div className="min-h-screen font-sans text-text-dark bg-neutral-bg">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};
