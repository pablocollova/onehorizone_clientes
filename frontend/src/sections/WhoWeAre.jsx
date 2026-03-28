import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const features = [
    "Comprehensive relocation support",
    "Exclusive concierge services",
    "Business setup and legal guidance",
    "Personalized lifestyle management"
];

export const WhoWeAre = () => {
    return (
        <section id="who-we-are" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Who We Are</h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                            Your Trusted Partners in Spain
                        </h3>
                        <p className="text-lg text-text-dark/80 mb-8 leading-relaxed">
                            At One Horizon Spain, we understand that moving to or managing a life in a new country can be complex. We are here to simplify that journey.
                            Our team of experts provides seamless, high-end support for individuals and businesses looking to establish themselves in Spain with confidence and ease.
                        </p>

                        <ul className="space-y-4">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center space-x-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                        <Check size={14} strokeWidth={3} />
                                    </span>
                                    <span className="text-text-dark font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Real Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="/images/who_we_are_team.png"
                                alt="One Horizon Spain team"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">10+</span>
                            </div>
                            <div>
                                <p className="font-bold text-primary text-sm">Years</p>
                                <p className="text-text-dark/60 text-xs">Experience</p>
                            </div>
                        </div>
                        {/* Outline Frame */}
                        <div className="absolute -inset-4 border-2 border-primary/5 rounded-3xl -z-10" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
