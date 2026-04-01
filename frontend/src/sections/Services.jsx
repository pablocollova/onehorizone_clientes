import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Briefcase, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const serviceCounts = {
    personal: 6,
    business: 7
};

export const Services = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('personal');

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

                {/* Tabs */}
                <div className="flex justify-center mb-12 px-2">
                    <div className="bg-neutral-bg p-1.5 rounded-3xl sm:rounded-full flex flex-col sm:flex-row inline-flex w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`px-6 py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 w-full sm:w-auto flex justify-center ${activeTab === 'personal' ? 'bg-primary text-white shadow-md' : 'text-text-dark hover:text-primary'}`}
                        >
                            <span className="flex items-center justify-center gap-2"><Home size={18} /> {t('services.tabs.personal')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('business')}
                            className={`px-6 py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 w-full sm:w-auto flex justify-center ${activeTab === 'business' ? 'bg-primary text-white shadow-md' : 'text-text-dark hover:text-primary'}`}
                        >
                            <span className="flex items-center justify-center gap-2"><Briefcase size={18} /> {t('services.tabs.business')}</span>
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {Array.from({ length: serviceCounts[activeTab] }).map((_, index) => (
                            <div key={index} className="group p-8 border border-gray-100 rounded-2xl hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 cursor-pointer">
                                <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent mb-6 transform origin-left group-hover:scale-x-150 transition-transform" />
                                <h4 className="text-2xl font-bold text-primary mb-3">{t(`services.${activeTab}.${index}.title`)}</h4>
                                <p className="text-text-dark/70 mb-6 min-h-[48px]">
                                    {t(`services.${activeTab}.${index}.desc`)}
                                </p>
                                <div className="flex items-center text-accent font-semibold group-hover:gap-2 transition-all">
                                    {t('services.learn_more')} <ChevronRight size={16} />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};
