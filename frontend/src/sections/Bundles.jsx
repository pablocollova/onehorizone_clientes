import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';

const bundles = [
    {
        label: "STAGE 1 — ONE-OFF SETUP",
        name: "Business Kickstart",
        desc: "Everything you need to open or take over a business in Spain, managed end to end.",
        features: [
            "Utilities setup",
            "Hygiene Plan",
            "Business licence",
            "Commercial insurance",
            "Client portal setup"
        ],
        buttonText: "Request a Quote",
        dark: false
    },
    {
        label: "STAGE 2 — MONTHLY RETAINER",
        name: "Operations Retainer",
        desc: "Once open, we keep everything running. One monthly fee. No surprises.",
        features: [
            "Accounting coordination",
            "1 maintenance visit per month",
            "Document portal",
            "Utility & bill management",
            "Compliance monitoring"
        ],
        buttonText: "Get In Touch",
        dark: true
    }
];

export const Bundles = () => {
    return (
        <section id="bundles" className="py-24 bg-neutral-bg">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Our Bundles</h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                        Everything You Need, Packaged
                    </h3>
                    <p className="text-lg text-text-dark/80 max-w-2xl mx-auto">
                        Choose a package that suits your needs, or contact us for a bespoke proposal.
                    </p>
                </div>

                {/* Lifestyle image banner */}
                <div className="relative rounded-2xl overflow-hidden mb-16 h-64 shadow-xl">
                    <img
                        src="/images/lifestyle_spain.png"
                        alt="Luxury lifestyle in Spain"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center px-12">
                        <div className="text-white max-w-md">
                            <p className="text-sm font-semibold uppercase tracking-widest mb-2 text-accent">Your New Beginning</p>
                            <h4 className="text-3xl font-bold mb-2">Life in Spain,<br/>Exactly as You Imagined</h4>
                            <p className="text-white/80 text-sm">From the first day you arrive to the moment you feel at home.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
                    {bundles.map((bundle, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className={`relative rounded-2xl p-8 shadow-xl ${bundle.dark ? 'bg-primary text-white border-primary border' : 'bg-white border-gray-100 border'}`}
                        >
                            <div className="text-sm font-bold uppercase tracking-wider mb-2 text-accent">
                                {bundle.label}
                            </div>
                            <h4 className={`text-3xl font-bold mb-4 ${bundle.dark ? 'text-white' : 'text-primary'}`}>
                                {bundle.name}
                            </h4>
                            <p className={`mb-8 h-12 ${bundle.dark ? 'text-white/80' : 'text-text-dark/70'}`}>
                                {bundle.desc}
                            </p>

                            <ul className="space-y-4 mb-8 text-left">
                                {bundle.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                        <span className={`text-sm ${bundle.dark ? 'text-white/90' : 'text-text-dark/80'}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button variant={bundle.dark ? "outline" : "primary"} className={`w-full ${bundle.dark ? 'text-white border-white hover:bg-white hover:text-primary' : ''}`}>
                                {bundle.buttonText}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
