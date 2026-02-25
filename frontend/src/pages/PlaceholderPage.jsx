import React from 'react';
import { Construction } from 'lucide-react';

export const PlaceholderPage = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-6">
                <Construction size={32} />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
            <p className="text-text-dark/60 max-w-md">
                This section is currently under development. Checking back soon for updates to the {title} module.
            </p>
        </div>
    );
};
