import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        service: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, handle form submission here
        alert("Thank you for your message. We will be in touch shortly.");
        setFormData({ name: '', email: '', service: '', message: '' });
    };

    return (
        <section id="contact" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">{t('contact.subtitle')}</h2>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
                            {t('contact.title')}
                        </h3>
                        <p className="text-lg text-text-dark/80 mb-8 max-w-md">
                            {t('contact.description')}
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 text-text-dark/80">
                                <div className="w-10 h-10 bg-neutral-bg rounded-full flex items-center justify-center text-primary">
                                    <Mail size={20} />
                                </div>
                                <span>concierge@onehorizonspain.com</span>
                            </div>
                            <div className="flex items-center space-x-4 text-text-dark/80">
                                <div className="w-10 h-10 bg-neutral-bg rounded-full flex items-center justify-center text-primary">
                                    <Phone size={20} />
                                </div>
                                <span>+34 613 942 784</span>
                            </div>
                            <div className="flex items-center space-x-4 text-text-dark/80">
                                <div className="w-10 h-10 bg-neutral-bg rounded-full flex items-center justify-center text-primary">
                                    <MapPin size={20} />
                                </div>
                                <span>{t('contact.location')}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-neutral-bg p-8 rounded-2xl md:p-10"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">{t('contact.form.name')}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                                    placeholder={t('contact.form.name_placeholder')}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">{t('contact.form.email')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                                    placeholder={t('contact.form.email_placeholder')}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">{t('contact.form.service')}</label>
                                <select
                                    name="service"
                                    value={formData.service}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all bg-white"
                                >
                                    <option value="">{t('contact.form.service_placeholder')}</option>
                                    <option value="Personal Relocation">{t('contact.form.service_options.personal')}</option>
                                    <option value="Business Setup">{t('contact.form.service_options.business')}</option>
                                    <option value="Concierge">{t('contact.form.service_options.concierge')}</option>
                                    <option value="Other">{t('contact.form.service_options.other')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">{t('contact.form.message')}</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                                    placeholder={t('contact.form.message_placeholder')}
                                    required
                                />
                            </div>
                            <Button type="submit" variant="primary" className="w-full">
                                {t('contact.form.submit')}
                            </Button>
                        </form>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
