import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/">
                    <img src="/images/logo.png" alt="One Horizon Logo" className="w-40 md:w-[180px] h-auto" />
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <NavLink href="/#who-we-are">{t('navbar.who_we_are')}</NavLink>
                    <NavLink href="/#why-choose-us">{t('navbar.why_choose_us')}</NavLink>
                    <NavLink href="/#services">{t('navbar.services')}</NavLink>
                    
                    <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                        <button 
                            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en')}
                            className="font-bold text-primary hover:text-accent transition-colors flex items-center gap-1"
                        >
                            {i18n.language === 'en' ? 'ES' : 'EN'}
                        </button>
                        <Button variant="outline" className="flex items-center gap-2 border-primary/20 hover:bg-primary/5" onClick={() => navigate('/login')}>
                            <LogIn size={16} /> {t('navbar.login')}
                        </Button>
                        <Button variant="primary">{t('navbar.contact_us')}</Button>
                    </div>
                </div>

                <button className="md:hidden text-primary" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="absolute top-full left-0 w-full bg-white shadow-lg overflow-hidden md:hidden"
                    >
                        <div className="flex flex-col p-6 space-y-4">
                            <MobileNavLink href="#who-we-are" onClick={() => setIsOpen(false)}>{t('navbar.who_we_are')}</MobileNavLink>
                            <MobileNavLink href="#why-choose-us" onClick={() => setIsOpen(false)}>{t('navbar.why_choose_us')}</MobileNavLink>
                            <MobileNavLink href="#services" onClick={() => setIsOpen(false)}>{t('navbar.services')}</MobileNavLink>
                            
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-text-dark font-medium">Language</span>
                                <button 
                                    onClick={() => {
                                        i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
                                        setIsOpen(false);
                                    }}
                                    className="px-4 py-1 rounded-full bg-neutral-bg font-bold text-primary hover:bg-primary/10 transition-colors"
                                >
                                    {i18n.language === 'en' ? 'ES' : 'EN'}
                                </button>
                            </div>

                            <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => { navigate('/login'); setIsOpen(false); }}>
                                <LogIn size={16} /> {t('navbar.login')}
                            </Button>
                            <Button variant="primary" className="w-full">{t('navbar.contact_us')}</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const NavLink = ({ href, children }) => (
    <a href={href} className="text-text-dark hover:text-primary font-medium transition-colors">
        {children}
    </a>
);

const MobileNavLink = ({ href, onClick, children }) => (
    <a href={href} onClick={onClick} className="text-lg text-text-dark font-medium block py-2 border-b border-gray-100">
        {children}
    </a>
);
