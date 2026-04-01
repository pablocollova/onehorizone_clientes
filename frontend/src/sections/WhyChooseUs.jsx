import React from 'react';
import { motion } from 'framer-motion';
import { Map, Clock, ShieldCheck, UserCheck } from 'lucide-react';

const reasons = [
    {
        icon: <Map className="w-8 h-8 text-white" />,
        title: "Local Knowledge",
        description: "Deep knowledge of how Spanish councils, utilities and compliance actually work."
    },
    {
        icon: <Clock className="w-8 h-8 text-white" />,
        title: "Time-Saving",
        description: "We handle the bureaucracy so you can focus on running your business."
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-white" />,
        title: "Trusted Partners",
        description: "Vetted lawyers, gestorías, insurers and tradespeople, all coordinated by us."
    },
    {
        icon: <UserCheck className="w-8 h-8 text-white" />,
        title: "One Point of Contact",
        description: "You deal with one person. We deal with everyone else."
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
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
                        One Contact. Every Solution.
                    </h3>
                    <p className="text-lg text-text-dark/80 max-w-2xl mx-auto">
                        We’re not a gestoría. We’re not a law firm. We’re the operational backbone that makes your life or business in Spain actually work.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
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
