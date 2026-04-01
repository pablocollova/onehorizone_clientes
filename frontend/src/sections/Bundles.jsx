import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

export const Bundles = () => {
    const { t } = useTranslation();
    return (
        <section id="bundles" className="py-24 bg-neutral-bg">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">{t('bundles.subtitle')}</h2>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
                        {t('bundles.title')}
                    </h3>
                    <p className="text-lg text-text-dark/80 max-w-2xl mx-auto">
                        {t('bundles.description')}
                    </p>
                </div>

                {/* Lifestyle image banner */}
                <div className="relative rounded-2xl overflow-hidden mb-16 h-64 shadow-xl">
                    <img
                        src="/images/lifestyle_spain.png"
                        alt="Luxury lifestyle in Spain"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center px-6 md:px-12">
                        <div className="text-white max-w-md">
                            <p className="text-sm font-semibold uppercase tracking-widest mb-2 text-accent">{t('bundles.banner.subtitle')}</p>
                            <h4 className="text-2xl md:text-3xl font-bold mb-2 break-pre">{t('bundles.banner.title')}</h4>
                            <p className="text-white/80 text-sm">{t('bundles.banner.description')}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
                    {[0, 1].map((index) => {
                        const dark = index === 1;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className={`relative rounded-2xl p-6 md:p-8 shadow-xl ${dark ? 'bg-primary text-white border-primary border' : 'bg-white border-gray-100 border'}`}
                            >
                                <div className="text-sm font-bold uppercase tracking-wider mb-2 text-accent">
                                    {t(`bundles.bundle_${index}.label`)}
                                </div>
                                <h4 className={`text-2xl md:text-3xl font-bold mb-4 ${dark ? 'text-white' : 'text-primary'}`}>
                                    {t(`bundles.bundle_${index}.name`)}
                                </h4>
                                <p className={`mb-8 h-12 ${dark ? 'text-white/80' : 'text-text-dark/70'}`}>
                                    {t(`bundles.bundle_${index}.desc`)}
                                </p>

                                <ul className="space-y-4 mb-8 text-left">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                            <span className={`text-sm ${dark ? 'text-white/90' : 'text-text-dark/80'}`}>
                                                {t(`bundles.bundle_${index}.features.${i}`)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Button variant={dark ? "outline" : "primary"} className={`w-full ${dark ? 'text-white border-white hover:bg-white hover:text-primary' : ''}`}>
                                    {t(`bundles.bundle_${index}.button`)}
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
