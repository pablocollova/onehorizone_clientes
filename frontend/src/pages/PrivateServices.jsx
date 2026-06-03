import React from 'react';
import { motion } from 'framer-motion';
import { Home, FileText, Wrench, Shield, BadgeCheck, BriefcaseBusiness } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const icons = [Home, FileText, Wrench, Shield, BadgeCheck, BriefcaseBusiness];

export const PrivateServices = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <section className="relative overflow-hidden bg-neutral-bg px-6 pb-20 pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(17,63,103,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(211,157,67,0.12),transparent_30%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-accent">
            {t('private_page.subtitle')}
          </p>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold leading-tight text-primary md:text-6xl">
            {t('private_page.title')}
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-text-dark/80 md:text-xl">
            {t('private_page.description')}
          </p>
          <p className="mx-auto max-w-2xl rounded-full border border-primary/10 bg-white/80 px-5 py-3 text-sm font-medium text-text-dark/70 backdrop-blur-sm">
            {t('private_page.note')}
          </p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const Icon = icons[index];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="rounded-3xl border border-gray-100 bg-neutral-bg/50 p-7 shadow-sm"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/15">
                    <Icon size={22} />
                  </div>
                  <h2 className="mb-3 text-2xl font-bold text-primary">
                    {t(`private_page.services.${index}.title`)}
                  </h2>
                  <p className="leading-relaxed text-text-dark/75">
                    {t(`private_page.services.${index}.desc`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-accent">
            {t('private_page.cta.subtitle')}
          </p>
          <h2 className="mb-5 text-3xl font-bold md:text-5xl">
            {t('private_page.cta.title')}
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-white/80">
            {t('private_page.cta.description')}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-primary sm:w-auto" onClick={() => { window.location.href = '/#contact'; }}>
              {t('private_page.cta.primary')}
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/')}>
              {t('private_page.cta.secondary')}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};
