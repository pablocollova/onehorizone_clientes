import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { publicCopy } from '../lib/landingContent';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import '../business.css';

export const PublicLayout = () => {
    const { i18n, t } = useTranslation();
    const { pathname } = useLocation();
    useEffect(() => {
        const spanish = i18n.language?.startsWith('es');
        const copy = publicCopy(i18n.language);
        document.documentElement.lang = spanish ? 'es' : 'en';
        document.title = pathname === '/private-services' ? 'One Horizon Family | Costa del Sol' : pathname === '/privacy-policy' ? `${copy.privacy} | One Horizon` : `One Horizon | ${spanish ? 'Apoyo operativo para negocios en la Costa del Sol' : 'Business Operations on the Costa del Sol'}`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', pathname === '/private-services' ? t('private_page.description') : copy.intro);
    }, [i18n.language, pathname, t]);
    return (
        <div className="business-public">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};
