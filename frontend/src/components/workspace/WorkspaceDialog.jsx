import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function WorkspaceDialog({ title, onClose, busy, children }) {
    const box = useRef(null);
    useEffect(() => {
        const previous = document.activeElement;
        box.current?.querySelector('input,select,button')?.focus();
        return () => previous?.focus();
    }, []);
    return <div className="workspace-modal-backdrop" onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }}><section ref={box} role="dialog" aria-modal="true" aria-label={title} className="workspace-modal" onKeyDown={event => {
        if (event.key === 'Escape' && !busy) onClose();
        if (event.key === 'Tab') {
            const elements = [...box.current.querySelectorAll('button,input,select,textarea,a[href]')].filter(x => !x.disabled);
            const first = elements[0], last = elements.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
    }}><div className="workspace-card-heading"><h2>{title}</h2><button type="button" aria-label="Cerrar formulario" onClick={onClose} disabled={busy}><X size={19} /></button></div>{children}</section></div>;
}
