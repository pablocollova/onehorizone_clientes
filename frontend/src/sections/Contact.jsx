import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Contact = () => {
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
                        <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Get in Touch</h2>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
                            Let's Start the Conversation
                        </h3>
                        <p className="text-lg text-text-dark/80 mb-8 max-w-md">
                            Ready to simplify your life in Spain? Contact us today for a confidential consultation.
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
                                <span>+34 900 123 456</span>
                            </div>
                            <div className="flex items-center space-x-4 text-text-dark/80">
                                <div className="w-10 h-10 bg-neutral-bg rounded-full flex items-center justify-center text-primary">
                                    <MapPin size={20} />
                                </div>
                                <span>Marbella</span>
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
                                <label className="block text-sm font-medium text-text-dark mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">Service Interest</label>
                                <select
                                    name="service"
                                    value={formData.service}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all bg-white"
                                >
                                    <option value="">Select a service...</option>
                                    <option value="Personal Relocation">Personal Relocation</option>
                                    <option value="Business Setup">Business Setup</option>
                                    <option value="Concierge">Lifestyle Concierge</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                                    placeholder="How can we help you?"
                                    required
                                />
                            </div>
                            <Button type="submit" variant="primary" className="w-full">
                                Send Message
                            </Button>
                        </form>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
