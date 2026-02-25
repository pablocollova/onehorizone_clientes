import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-accent text-white hover:bg-accent/90',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
};

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
};
