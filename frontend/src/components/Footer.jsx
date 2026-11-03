import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, ArrowUpRight } from 'lucide-react';
import { publicCopy } from '../lib/landingContent';

export function Footer() {
 const { i18n } = useTranslation();
 const c = publicCopy(i18n.language);
 return <footer className="business-footer"><div className="business-container"><div className="business-footer-top"><div><Link to="/" className="business-brand"><Compass size={29} strokeWidth={1.2} /><span>ONE HORIZON</span></Link><p>{c.footerText}</p></div><div><Link to="/login">{c.portal}<ArrowUpRight size={13} /></Link><Link to="/private-services">One Horizon Family<ArrowUpRight size={13} /></Link><a href="mailto:info@onehorizon.es">info@onehorizon.es<ArrowUpRight size={13} /></a></div></div><div className="business-footer-bottom"><span>© {new Date().getFullYear()} {c.rights}</span><Link to="/privacy-policy">{c.privacy}</Link><a href="/#top">{c.back} ↑</a></div></div></footer>;
}
