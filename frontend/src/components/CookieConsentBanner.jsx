import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/Button';
import { useConsent } from '../hooks/useConsent';
import { Link } from 'react-router-dom';

export const CookieConsentBanner = () => {
    const { hasResponded, saveConsent } = useConsent();
    const [showDetails, setShowDetails] = useState(false);
    
    // Default options (Necessary is always true and disabled)
    const [preferences, setPreferences] = useState({
        necessary: true,
        analytics: false,
        marketing: false
    });

    if (hasResponded) return null;

    const handleAcceptAll = () => {
        saveConsent({ necessary: true, analytics: true, marketing: true });
    };

    const handleSaveSelected = () => {
        saveConsent(preferences);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed bottom-0 left-0 w-full z-50 p-4 md:p-6"
            >
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-primary font-bold text-lg mb-2">
                                <Shield className="w-5 h-5" />
                                <span>We Value Your Privacy</span>
                            </div>
                            <p className="text-text-dark/80 text-sm mb-4">
                                We use strictly necessary cookies to make our site work. We'd also like to set optional analytics and marketing cookies to help us improve it. We won't set optional cookies unless you enable them. 
                                For more detailed information, please see our <Link to="/privacy-policy" className="text-accent underline">Privacy Policy</Link>.
                            </p>

                            <button 
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-sm font-semibold text-primary flex items-center gap-1 hover:text-accent transition-colors"
                            >
                                {showDetails ? 'Hide Details' : 'Customize Preferences'} 
                                {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                            <Button variant="outline" onClick={handleSaveSelected} className="whitespace-nowrap">
                                Accept Selected
                            </Button>
                            <Button variant="primary" onClick={handleAcceptAll} className="whitespace-nowrap">
                                Accept All
                            </Button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showDetails && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-6"
                            >
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-start gap-4">
                                        <input type="checkbox" checked disabled className="mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-primary text-sm">Strictly Necessary</h4>
                                            <p className="text-xs text-text-dark/70">These cookies are essential for you to browse the website and use its features. They cannot be disabled.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <input 
                                            type="checkbox" 
                                            checked={preferences.analytics} 
                                            onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                                            className="mt-1" 
                                        />
                                        <div>
                                            <h4 className="font-semibold text-primary text-sm">Analytics</h4>
                                            <p className="text-xs text-text-dark/70">These cookies collect information about how you use our website, helping us to measure and improve performance.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <input 
                                            type="checkbox" 
                                            checked={preferences.marketing} 
                                            onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                                            className="mt-1" 
                                        />
                                        <div>
                                            <h4 className="font-semibold text-primary text-sm">Marketing</h4>
                                            <p className="text-xs text-text-dark/70">These cookies are used to track visitors across websites to allow us to display relevant advertisements.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
