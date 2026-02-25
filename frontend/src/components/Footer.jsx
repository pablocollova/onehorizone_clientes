import React from 'react';

export const Footer = () => {
    return (
        <footer className="bg-primary text-white py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <span className="text-2xl font-bold tracking-tight">ONE HORIZON</span>
                        <p className="text-white/60 text-sm mt-2">© {new Date().getFullYear()} One Horizon Spain. All rights reserved.</p>
                    </div>

                    <div className="flex space-x-8 text-sm text-white/80">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
