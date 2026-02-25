import React from 'react';
import { Hero } from '../sections/Hero';
import { WhoWeAre } from '../sections/WhoWeAre';
import { WhyChooseUs } from '../sections/WhyChooseUs';
import { Services } from '../sections/Services';
import { Bundles } from '../sections/Bundles';
import { Contact } from '../sections/Contact';

export const Landing = () => {
    return (
        <>
            <Hero />
            <WhoWeAre />
            <WhyChooseUs />
            <Services />
            <Bundles />
            <Contact />
        </>
    );
};
