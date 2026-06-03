import React from 'react';
import { motion } from 'framer-motion';
import { Building2, BriefcaseBusiness, Hotel, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { landingImages } from '../content/visualDirection';

const audienceIcons = [BriefcaseBusiness, Building2, Hotel, Store];

export const WhoWeAre = () => {
    const { t } = useTranslation();

    return (
        <section id="who-we-help" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">{t('who_we_are.subtitle')}</h2>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
                            {t('who_we_are.title')}
                        </h3>
                        <p className="text-lg text-text-dark/80 mb-8 leading-relaxed">
                            {t('who_we_are.description')}
                        </p>

                        <ul className="space-y-4 mb-10">
                            {[0, 1, 2, 3, 4].map((index) => (
                                <li key={index} className="flex items-center space-x-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    <span className="text-text-dark font-medium">{t(`who_we_are.features.${index}`)}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {[0, 1, 2, 3].map((index) => {
                                const Icon = audienceIcons[index];

                                return (
                                    <div key={index} className="rounded-2xl border border-primary/10 bg-neutral-bg p-5">
                                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
                                            <Icon size={20} />
                                        </div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent mb-2">
                                            {t(`who_we_are.audiences.${index}.label`)}
                                        </p>
                                        <p className="text-text-dark/75 leading-relaxed">
                                            {t(`who_we_are.audiences.${index}.desc`)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={landingImages.whoWeHelp.src}
                                alt={t('images.who_we_help.alt')}
                                data-image-prompt={landingImages.whoWeHelp.prompt}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur-sm">
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent mb-2">
                                {t('who_we_are.callout.subtitle')}
                            </p>
                            <p className="text-lg font-semibold text-primary leading-snug">
                                {t('who_we_are.callout.title')}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-text-dark/75">
                                {t('who_we_are.callout.description')}
                            </p>
                        </div>
                        <div className="absolute -inset-4 border-2 border-primary/5 rounded-3xl -z-10" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
