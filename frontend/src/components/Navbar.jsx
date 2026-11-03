import { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './marketing-nav.css';

export const Navbar = () => {
  const { i18n } = useTranslation();
  const es = (i18n.language || 'en').startsWith('es');
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);
  useEffect(() => {
    const escape = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);
  const links = [['/#who-we-help',es?'Para quién':'Who we help'],['/#services',es?'Servicios':'Services'],['/#how-we-work',es?'Cómo trabajamos':'How we work'],['/#family','One Horizon Family']];
  return <header className="oh-nav"><a className="oh-skip" href="#main-content">{es?'Ir al contenido':'Skip to content'}</a><div className="oh-nav-inner"><Link className="oh-logo" to="/" aria-label="One Horizon — Home"><img src="/images/logo.png" alt="One Horizon"/></Link><button type="button" className="oh-menu-toggle" aria-label={open?(es?'Cerrar menú':'Close menu'):(es?'Abrir menú':'Open menu')} aria-expanded={open} aria-controls="oh-navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><nav id="oh-navigation" aria-label={es?'Navegación principal':'Main navigation'} className={open?'is-open':''}>{links.map(([href,label])=><a key={href} href={href} onClick={()=>setOpen(false)}>{label}</a>)}<div className="oh-nav-tools"><Link to="/login">{es?'Área cliente':'Client portal'}</Link><button type="button" aria-label={es?'Switch to English':'Cambiar a español'} onClick={()=>{i18n.changeLanguage(es?'en':'es');setOpen(false);}}>{es?'EN':'ES'}</button><a className="oh-nav-cta" href="/#contact" onClick={()=>setOpen(false)}>{es?'Hablemos':'Let’s talk'}<ArrowUpRight size={15}/></a></div></nav></div></header>;
};
