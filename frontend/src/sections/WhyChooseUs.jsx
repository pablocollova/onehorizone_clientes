import React from 'react';
import { motion } from 'framer-motion';
import { Map, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const reasonKeys = [
    {
        icon: <Map className="w-8 h-8 text-white" />,
        key: "local"
    },
    {
        icon: <Clock className="w-8 h-8 text-white" />,
        key: "time"
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-white" />,
        key: "trusted"
    },
    {
        icon: <UserCheck className="w-8 h-8 text-white" />,
        key: "contact"
    }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export const WhyChooseUs = () => {
    const { t } = useTranslation();
    return (
        <section id="why-choose-us" className="py-24 bg-neutral-bg">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">{t('why_choose_us.subtitle')}</h2>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
                        {t('why_choose_us.title')}
                    </h3>
                    <p className="text-lg text-text-dark/80 max-w-2xl mx-auto">
                        {t('why_choose_us.description')}
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
                >
                    {reasonKeys.map((reason, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-transparent hover:border-accent/20"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                                {reason.icon}
                            </div>
                            <h4 className="text-xl font-bold text-primary mb-3">{t(`why_choose_us.reasons.${reason.key}_title`)}</h4>
                            <p className="text-text-dark/70 leading-relaxed">
                                {t(`why_choose_us.reasons.${reason.key}_desc`)}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
