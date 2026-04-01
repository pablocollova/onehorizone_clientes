import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const features = [
    "Utilities setup & management",
    "Hygiene Plan",
    "APPCC compliance",
    "Business licence coordination",
    "Ongoing retainer & document portal"
];

export const WhoWeAre = () => {
    return (
        <section id="who-we-are" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Who We Are</h2>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
                            Your Operational Backbone in Spain
                        </h3>
                        <p className="text-lg text-text-dark/80 mb-8 leading-relaxed">
                            We’re not a gestoría. We’re not a law firm. We started as energy advisors, working alongside lawyers on business purchases. While they handled the legal side, we handled everything after — utilities, hygiene plans, insurance, compliance. That gap became our business.
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
                        <div className="absolute -inset-4 border-2 border-primary/5 rounded-3xl -z-10" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
