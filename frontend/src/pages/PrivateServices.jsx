import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { familyServices } from '../lib/familyServices';

export function PrivateServices() {
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('es') ? 'es' : 'en';
    const subject = encodeURIComponent(t('private_page.cta.subject'));

    return (
        <div className="business-landing">
            <section className="business-container business-section">
                <p className="business-kicker">{t('private_page.subtitle')}</p>
                <h1 className="text-5xl leading-tight md:text-6xl">{t('private_page.title')}</h1>
                <p className="business-lead">{t('private_page.description')}</p>
                <a className="business-button" href="#family-services">
                    {t('private_page.explore')}
                </a>
            </section>

            <section id="family-services" className="business-services" aria-labelledby="family-services-title">
                <div className="business-container business-section">
                    <h2 id="family-services-title" className="mb-8">{t('private_page.catalog')}</h2>
                    <div className="business-service-grid mt-8">
                        {familyServices.map(service => (
                            <article key={service.id}>
                                <h3>{service[language].title}</h3>
                                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                                    {service[language].items.map(item => <li key={item}>{item}</li>)}
                                </ul>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="business-container business-section">
                <h2>{t('private_page.cta.title')}</h2>
                <p className="business-lead">{t('private_page.note')}</p>
                <div className="business-actions">
                    <a href={`mailto:info@onehorizon.es?subject=${subject}`} className="business-button">
                        {t('private_page.cta.primary')}
                    </a>
                    <Link to="/" className="business-text-link">{t('private_page.cta.secondary')}</Link>
                </div>
            </section>
        </div>
    );
}
