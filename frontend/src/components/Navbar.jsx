import { useState } from 'react';
import { Compass, Menu, X, ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { publicCopy } from '../lib/landingContent';

export function Navbar() {
 const { i18n } = useTranslation();
 const { pathname } = useLocation();
 const [open, setOpen] = useState(false);
 const c = publicCopy(i18n.language), spanish = i18n.language?.startsWith('es');
 const close = () => setOpen(false);
 return <header className="business-header" onKeyDown={e => { if (e.key === 'Escape') { close(); e.currentTarget.querySelector('.business-menu')?.focus(); } }}>
  <div className="business-container business-header-inner"><Link to="/" className="business-brand" aria-label="One Horizon — Home" onClick={close}><Compass size={31} strokeWidth={1.2} /><span>ONE HORIZON<small>YOUR OPERATING PARTNER</small></span></Link><button type="button" className="business-menu" aria-label={open ? c.close : c.menu} aria-expanded={open} aria-controls="business-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
   <nav id="business-navigation" aria-label={spanish ? 'Navegación principal' : 'Main navigation'} className={open ? 'is-open' : ''}>{c.nav.map((label, index) => <a key={index} onClick={close} href={`/#${['who-we-help', 'services', 'how-we-work'][index]}`}>{label}</a>)}<Link to="/private-services" onClick={close} aria-current={pathname === '/private-services' ? 'page' : undefined} className="business-family-nav">Family</Link><div className="business-nav-tools"><button className="business-language" type="button" aria-label={c.language} onClick={() => { i18n.changeLanguage(spanish ? 'en' : 'es'); close(); }}>{spanish ? 'EN' : 'ES'}</button><Link to="/login" className="business-login" onClick={close}>{c.portal}</Link><a className="business-button" href="/#contact" onClick={close}>{c.talk}<ArrowUpRight size={14} /></a></div></nav>
  </div>
 </header>;
}
