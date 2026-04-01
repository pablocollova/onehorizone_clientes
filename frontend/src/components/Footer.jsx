import React from 'react';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="bg-primary text-white py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <span className="text-2xl font-bold tracking-tight">ONE HORIZON</span>
                        <p className="text-white/60 text-sm mt-2">© {new Date().getFullYear()} {t('footer.rights')}</p>
                    </div>

                    <div className="flex space-x-8 text-sm text-white/80">
                        <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
                        <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
                        <a href="#" className="hover:text-white transition-colors">{t('footer.cookie')}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
