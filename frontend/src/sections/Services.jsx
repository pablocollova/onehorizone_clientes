import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Briefcase, ChevronRight } from 'lucide-react';

const services = {
    personal: [
        { title: "Golden Visa & Residency", desc: "Expert guidance on visa applications and residency permits." },
        { title: "Home Finding", desc: "Curated property search for purchase or rental in prime locations." },
        { title: "Education & Schools", desc: "Advisory on top international schools and enrollment support." },
        { title: "Banking & Finance", desc: "Opening bank accounts and connecting with financial advisors." },
        { title: "Healthcare", desc: "Navigating the private healthcare system and insurance options." },
        { title: "Lifestyle Concierge", desc: "From private chefs to yacht charters, we manage your lifestyle." }
    ],
    business: [
        { title: "Company Formation", desc: "Full legal setup of SL or SA companies in Spain." },
        { title: "Tax Planning", desc: "Strategic tax advice for businesses and entrepreneurs." },
        { title: "Office Relocation", desc: "Finding and setting up your ideal office space." },
        { title: "Recruitment", desc: "Sourcing top local talent for your growing team." },
        { title: "Legal Compliance", desc: "Ongoing support to ensure regulatory compliance." },
        { title: "Market Entry", desc: "Consultancy on entering the Spanish market successfully." }
    ]
};

export const Services = () => {
    const [activeTab, setActiveTab] = useState('personal');

    return (
        <section id="services" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Our Expertise</h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                        Services Tailored to You
                    </h3>
                    <p className="text-lg text-text-dark/80 max-w-2xl mx-auto">
                        Whether you are moving your family or expanding your business, we provide the specialized support you need.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="bg-neutral-bg p-1 rounded-full inline-flex">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`px-8 py-3 rounded-full text-base font-semibold transition-all duration-300 ${activeTab === 'personal' ? 'bg-primary text-white shadow-md' : 'text-text-dark hover:text-primary'}`}
                        >
                            <span className="flex items-center gap-2"><Home size={18} /> Personal & Relocation</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('business')}
                            className={`px-8 py-3 rounded-full text-base font-semibold transition-all duration-300 ${activeTab === 'business' ? 'bg-primary text-white shadow-md' : 'text-text-dark hover:text-primary'}`}
                        >
                            <span className="flex items-center gap-2"><Briefcase size={18} /> Business & Corporate</span>
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {services[activeTab].map((service, index) => (
                            <div key={index} className="group p-8 border border-gray-100 rounded-2xl hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 cursor-pointer">
                                <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent mb-6 transform origin-left group-hover:scale-x-150 transition-transform" />
                                <h4 className="text-2xl font-bold text-primary mb-3">{service.title}</h4>
                                <p className="text-text-dark/70 mb-6 min-h-[48px]">
                                    {service.desc}
                                </p>
                                <div className="flex items-center text-accent font-semibold group-hover:gap-2 transition-all">
                                    Learn More <ChevronRight size={16} />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};
