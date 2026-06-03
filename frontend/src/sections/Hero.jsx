import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ArrowRight, BriefcaseBusiness, Building2, FileCheck, MapPin, ShieldCheck, Store, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const proofIcons = [BriefcaseBusiness, FileCheck, Wrench];
const sectorIcons = [Building2, Store, ShieldCheck];

export const Hero = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <section id="hero" className="relative overflow-hidden bg-neutral-bg pb-20 pt-32 md:pt-36">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(59,183,233,0.16),transparent_24%),radial-gradient(circle_at_20%_20%,rgba(17,63,103,0.08),transparent_28%),linear-gradient(135deg,#f7f4ef_0%,#f6f4f0_42%,#edf6fb_100%)]" />
            <div className="absolute inset-y-0 right-0 z-0 hidden w-[44%] border-l border-primary/8 bg-[linear-gradient(180deg,rgba(17,63,103,0.06),rgba(17,63,103,0.02))] lg:block" />
            <div className="absolute -right-24 top-32 z-0 hidden h-80 w-80 rounded-full bg-accent/12 blur-3xl lg:block" />
            <div className="absolute left-8 top-40 z-0 hidden h-56 w-56 rounded-full bg-primary/8 blur-3xl lg:block" />

            <div className="relative z-10 mx-auto max-w-7xl px-6">
                <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="max-w-4xl"
                    >
                        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur-sm">
                            <MapPin size={14} className="text-accent" />
                            {t('hero.eyebrow')}
                        </span>
                        <h1 className="mb-6 text-4xl font-bold leading-[1.02] text-primary md:text-6xl lg:text-[4.5rem]">
                            {t('hero.heading_start')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{t('hero.heading_focus')}</span>
                            <br />
                            {t('hero.heading_end')}
                        </h1>
                        <p className="mb-10 max-w-3xl text-lg leading-relaxed text-text-dark/80 md:text-xl">
                            {t('hero.subheading')}
                        </p>

                        <div className="mb-12 flex w-full flex-col gap-4 sm:flex-row">
                            <Button variant="primary" className="flex w-full items-center justify-center gap-2 sm:w-auto" onClick={() => scrollTo('contact')}>
                                {t('hero.primary_cta')} <ArrowRight size={18} />
                            </Button>
                            <Button variant="outline" className="w-full bg-white/70 sm:w-auto" onClick={() => navigate('/private-services')}>
                                {t('hero.secondary_cta')}
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {[0, 1, 2].map((index) => {
                                const Icon = proofIcons[index];

                                return (
                                    <div key={index} className="rounded-2xl border border-primary/10 bg-white/88 p-5 shadow-sm backdrop-blur-sm">
                                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/15">
                                            <Icon size={20} />
                                        </div>
                                        <h2 className="mb-1 text-lg font-semibold text-primary">
                                            {t(`hero.proofs.${index}.title`)}
                                        </h2>
                                        <p className="text-sm leading-relaxed text-text-dark/75">
                                            {t(`hero.proofs.${index}.desc`)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 28 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                        className="relative"
                    >
                        <div className="mb-6 overflow-hidden rounded-[2rem] border border-primary/10 bg-primary shadow-[0_30px_80px_rgba(17,63,103,0.14)]">
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src="/images/hero_costa_del_sol.png"
                                    alt={t('hero.image_alt')}
                                    className="h-full w-full object-cover object-[50%_22%]"
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,63,103,0.15),rgba(17,63,103,0.72))]" />
                                <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-7">
                                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.26em] text-accent">
                                        {t('hero.image_eyebrow')}
                                    </p>
                                    <p className="max-w-md text-2xl font-semibold leading-tight md:text-[1.9rem]">
                                        {t('hero.image_title')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-primary/10 bg-white/86 p-7 shadow-[0_30px_80px_rgba(17,63,103,0.10)] backdrop-blur-md md:p-8">
                            <div className="mb-8 flex items-center justify-between gap-4 border-b border-primary/8 pb-5">
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-accent">
                                        {t('hero.panel.subtitle')}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold text-primary">
                                        {t('hero.panel.title')}
                                    </h2>
                                </div>
                                <div className="rounded-2xl bg-primary px-4 py-3 text-right text-white shadow-lg shadow-primary/15">
                                    <p className="text-xs uppercase tracking-[0.18em] text-white/70">Costa del Sol</p>
                                    <p className="text-lg font-semibold">Spain</p>
                                </div>
                            </div>

                            <div className="mb-7 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                                {[0, 1, 2].map((index) => {
                                    const Icon = sectorIcons[index];

                                    return (
                                        <div key={index} className="rounded-2xl border border-primary/8 bg-neutral-bg/80 p-4">
                                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                                                <Icon size={18} />
                                            </div>
                                            <p className="mb-1 text-sm font-bold uppercase tracking-[0.18em] text-accent">
                                                {t(`hero.panel.sectors.${index}.label`)}
                                            </p>
                                            <p className="text-sm leading-relaxed text-text-dark/75">
                                                {t(`hero.panel.sectors.${index}.desc`)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="rounded-2xl bg-primary p-6 text-white">
                                <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-accent">
                                    {t('hero.panel.stack_subtitle')}
                                </p>
                                <ul className="space-y-3">
                                    {[0, 1, 2, 3].map((index) => (
                                        <li key={index} className="flex items-start gap-3 text-sm text-white/88">
                                            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                                            <span>{t(`hero.panel.stack.${index}`)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

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
