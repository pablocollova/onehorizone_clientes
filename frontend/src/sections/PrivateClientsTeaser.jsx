import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home, FileText, Wrench, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const icons = [Home, FileText, Wrench, Shield];

export const PrivateClientsTeaser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section id="private-clients" className="py-20 bg-neutral-bg/70">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[2rem] border border-primary/10 bg-white p-8 md:p-12 shadow-sm"
        >
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-accent">
                {t('private_clients_teaser.subtitle')}
              </p>
              <h3 className="mb-5 text-3xl font-bold text-primary md:text-4xl">
                {t('private_clients_teaser.title')}
              </h3>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-text-dark/80">
                {t('private_clients_teaser.description')}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/private-services')}>
                  {t('private_clients_teaser.primary_cta')}
                </Button>
                <Button variant="primary" className="w-full sm:w-auto" onClick={() => { window.location.href = '/#contact'; }}>
                  {t('private_clients_teaser.secondary_cta')}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((index) => {
                const Icon = icons[index];

                return (
                  <div key={index} className="rounded-2xl border border-gray-100 bg-neutral-bg p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/15">
                      <Icon size={20} />
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-primary">
                      {t(`private_clients_teaser.features.${index}.title`)}
                    </h4>
                    <p className="text-sm leading-relaxed text-text-dark/75">
                      {t(`private_clients_teaser.features.${index}.desc`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-accent">
            <span>{t('private_clients_teaser.note')}</span>
            <ChevronRight size={16} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
