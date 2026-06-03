import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, FileCheck, ShieldCheck, PlugZap, Handshake, Building2, ReceiptText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const serviceIcons = [PlugZap, FileCheck, ShieldCheck, Handshake, Building2, ReceiptText];

export const Services = () => {
    const { t } = useTranslation();

    return (
        <section id="services" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">{t('services.subtitle')}</h2>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
                        {t('services.title')}
                    </h3>
                    <p className="text-lg text-text-dark/80 max-w-2xl mx-auto">
                        {t('services.description')}
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                        const Icon = serviceIcons[index];

                        return (
                            <div key={index} className="group p-8 border border-gray-100 rounded-2xl hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/15">
                                    <Icon size={22} />
                                </div>
                                <h4 className="text-2xl font-bold text-primary mb-3">{t(`services.business.${index}.title`)}</h4>
                                <p className="text-text-dark/70 mb-6 min-h-[72px] leading-relaxed">
                                    {t(`services.business.${index}.desc`)}
                                </p>
                                <div className="flex items-center text-accent font-semibold group-hover:gap-2 transition-all">
                                    {t('services.learn_more')} <ChevronRight size={16} />
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};
