import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';

const bundles = [
    {
        name: "Essential Relocation",
        price: "From €2,500",
        desc: "Perfect for individuals and couples seeking a smooth transition.",
        features: [
            "NIE & Residency application",
            "Bank account opening",
            "Initial home search (3 properties)",
            "Utility setup assistance"
        ],
        popular: false
    },
    {
        name: "Premium Lifestyle",
        price: "Custom Quote",
        desc: "Complete peace of mind with our full-service concierge package.",
        features: [
            "All Essential features",
            "Dedicated Concierge Manager",
            "School search & enrollment",
            "Healthcare & Insurance setup",
            "Vehicle registration/import",
            "Ongoing lifestyle support (3 months)"
        ],
        popular: true
    },
    {
        name: "Business Launch",
        price: "From €3,500",
        desc: "Strategic support for entrepreneurs and companies.",
        features: [
            "Company incorporation (SL/SA)",
            "Corporate tax planning",
            "Office search & lease negotiation",
            "Recruitment assistance",
            "Commercial bank account setup"
        ],
        popular: false
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {bundles.map((bundle, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className={`relative bg-white rounded-2xl p-8 border ${bundle.popular ? 'border-primary shadow-2xl scale-105 z-10' : 'border-gray-100 shadow-sm hover:shadow-lg'}`}
                        >
                            {bundle.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-md">
                                    <Star size={14} fill="currentColor" /> Most Popular
                                </div>
                            )}

                            <h4 className="text-2xl font-bold text-primary mb-2">{bundle.name}</h4>
                            <div className="text-3xl font-bold text-text-dark mb-4">{bundle.price}</div>
                            <p className="text-text-dark/70 mb-8 h-12">{bundle.desc}</p>

                            <ul className="space-y-4 mb-8">
                                {bundle.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                        <span className="text-text-dark/80 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button variant={bundle.popular ? "primary" : "outline"} className="w-full">
                                Get Started
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
