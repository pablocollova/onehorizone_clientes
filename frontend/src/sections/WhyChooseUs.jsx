import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Heart, Globe, Star, Users } from 'lucide-react';

const reasons = [
    {
        icon: <Globe className="w-8 h-8 text-white" />,
        title: "Local Expertise, Global Standards",
        description: "Deep knowledge of the Spanish market combined with world-class service standards."
    },
    {
        icon: <Clock className="w-8 h-8 text-white" />,
        title: "Time-Saving Efficiency",
        description: "We handle the bureaucracy and logistics so you can focus on enjoying your new life."
    },
    {
        icon: <Shield className="w-8 h-8 text-white" />,
        title: "Trusted Network",
        description: "Access our exclusive network of vetted professionals, from lawyers to interior designers."
    },
    {
        icon: <Heart className="w-8 h-8 text-white" />,
        title: "Personalized Care",
        description: "Tailored solutions that respect your unique preferences, lifestyle, and goals."
    },
    {
        icon: <Star className="w-8 h-8 text-white" />,
        title: "Premium Experience",
        description: "From luxury accommodation to private transport, we ensure every detail is exquisite."
    },
    {
        icon: <Users className="w-8 h-8 text-white" />,
        title: "Dedicated Support",
        description: "Your personal concierge manager is always just a message away."
    }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export const WhyChooseUs = () => {
    return (
        <section id="why-choose-us" className="py-24 bg-neutral-bg">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Why Choose Us</h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                        Excellence in Every Detail
                    </h3>
                    <p className="text-lg text-text-dark/80 max-w-2xl mx-auto">
                        We go beyond standard relocation services to curate a seamless lifestyle experience for you.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {reasons.map((reason, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-transparent hover:border-accent/20"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                                {reason.icon}
                            </div>
                            <h4 className="text-xl font-bold text-primary mb-3">{reason.title}</h4>
                            <p className="text-text-dark/70 leading-relaxed">
                                {reason.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
