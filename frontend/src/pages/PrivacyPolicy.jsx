import React from 'react';

export const PrivacyPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto py-16 px-6">
            <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>
            <p className="text-text-dark/80 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section className="mb-10">
                <h2 className="text-2xl font-bold text-primary mb-4">1. Introduction</h2>
                <p className="text-text-dark/80 mb-4">
                    One Horizon Spain ("we", "our", "us") respects your privacy and is committed to protecting your personal data. 
                    This privacy notice tells you how we look after your personal data when you visit our website and tells you about your privacy rights.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-primary mb-4">2. The Data We Collect</h2>
                <p className="text-text-dark/80 mb-4">
                    We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-text-dark/80">
                    <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier, marital status, title, date of birth and gender.</li>
                    <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                    <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                    <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-primary mb-4">3. How We Use Your Data</h2>
                <p className="text-text-dark/80 mb-4">
                    We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-text-dark/80">
                    <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                    <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                    <li>Where we need to comply with a legal obligation.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-primary mb-4">4. Data Retention</h2>
                <p className="text-text-dark/80 mb-4">
                    We will only retain your personal data for as long as reasonably necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-primary mb-4">5. Your Legal Rights (GDPR)</h2>
                <p className="text-text-dark/80 mb-4">
                    Under certain circumstances, you have rights under data protection laws in relation to your personal data:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-text-dark/80">
                    <li><strong>Request access</strong> to your personal data (Right to access).</li>
                    <li><strong>Request correction</strong> of the personal data that we hold about you (Right to rectification).</li>
                    <li><strong>Request erasure</strong> of your personal data (Right to be forgotten).</li>
                    <li><strong>Object to processing</strong> of your personal data.</li>
                    <li><strong>Request restriction of processing</strong> of your personal data.</li>
                    <li><strong>Request the transfer</strong> of your personal data to you or to a third party (Right to portability).</li>
                    <li><strong>Withdraw consent at any time</strong> where we are relying on consent to process your personal data.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-primary mb-4">6. Third-Party Services</h2>
                <p className="text-text-dark/80 mb-4">
                    We use third-party services for hosting (Railway) and database managed services (PostgreSQL via Neon). 
                    These providers act as Data Processors and are compliant with GDPR regulations.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-primary mb-4">7. Contact Us</h2>
                <p className="text-text-dark/80 mb-4">
                    If you have any questions about this privacy policy or our privacy practices, please contact us at: privacy@onehorizon.spain.
                </p>
            </section>
        </div>
    );
};
