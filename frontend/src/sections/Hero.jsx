import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Hero = () => {
    const { t } = useTranslation();
    return (
        <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden bg-neutral-bg">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/hero_costa_del_sol.png"
                    alt="Costa del Sol Spain"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-neutral-bg/90" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 md:pt-0">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white border border-gray-200 text-primary text-sm font-semibold tracking-wide mb-6 uppercase">
                        {t('hero.start_journey')}
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 leading-tight">
                        {t('hero.heading_start')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{t('hero.heading_spain')}</span> <br />
                        {t('hero.heading_end')}
                    </h1>
                    <p className="text-lg md:text-xl lg:text-2xl text-text-dark/80 mb-10 max-w-2xl mx-auto">
                        {t('hero.subheading')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                        <Button variant="primary" className="flex items-center justify-center gap-2 w-full sm:w-auto">
                            {t('hero.explore_services')} <ArrowRight size={18} />
                        </Button>
                        <Button variant="outline" className="w-full sm:w-auto">
                            {t('hero.contact_us')}
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
                <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center p-1">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1.5 h-1.5 bg-primary rounded-full"
                    />
                </div>
            </motion.div>
        </section>
    );
};
