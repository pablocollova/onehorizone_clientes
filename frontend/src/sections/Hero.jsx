import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export const Hero = () => {
    return (
        <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden bg-neutral-bg">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/hero_costa_del_sol.png"
                    alt="Costa del Sol Spain"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-neutral-bg/90" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white border border-gray-200 text-primary text-sm font-semibold tracking-wide mb-6 uppercase">
                        Start Your Journey
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6 leading-tight">
                        Buying or opening a business in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Spain?</span> <br />
                        We get it open, compliant, and running.
                    </h1>
                    <p className="text-xl md:text-2xl text-text-dark/80 mb-10 max-w-2xl mx-auto">
                        Utilities, licences, hygiene plans, insurance — all coordinated for you, from day one.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <Button variant="primary" className="flex items-center gap-2">
                            Explore Our Services <ArrowRight size={18} />
                        </Button>
                        <Button variant="outline">
                            Contact Us
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
                <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center p-1">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1.5 h-1.5 bg-primary rounded-full"
                    />
                </div>
            </motion.div>
        </section>
    );
};
