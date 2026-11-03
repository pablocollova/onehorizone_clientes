import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import i18n from '../i18n';
import { Landing } from './Landing';
import { PublicLayout } from '../layouts/PublicLayout';

afterEach(async () => { await i18n.changeLanguage('en'); });
function setup() {
 render(<MemoryRouter><Routes><Route element={<PublicLayout />}><Route index element={<Landing />} /><Route path="private-services" element={<h1>Family destination</h1>} /></Route><Route path="login" element={<h1>Portal destination</h1>} /></Routes></MemoryRouter>);
 return userEvent.setup();
}

it('prioritizes business with a secondary Family journey and preserves portal access', async () => {
 const user = setup();
 expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your business in Spain.');
 expect(screen.getByRole('link', { name: 'Tell us about your business' })).toHaveAttribute('href', '#contact');
 await user.click(screen.getByRole('link', { name: 'Explore Family services' }));
 expect(screen.getByRole('heading', { name: 'Family destination' })).toBeVisible();
 await user.click(within(screen.getByRole('navigation')).getByRole('link', { name: 'Client portal' }));
 expect(screen.getByRole('heading', { name: 'Portal destination' })).toBeVisible();
});

it('switches the complete commercial content to Spanish and maintains document language', async () => {
 const user = setup();
 await user.click(screen.getByRole('button', { name: 'Switch to Spanish' }));
 expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tu negocio en España.');
 expect(screen.getByRole('button', { name: 'Preparar correo de consulta' })).toBeVisible();
 expect(document.documentElement.lang).toBe('es');
 expect(document.title).toContain('Apoyo operativo');
 await user.click(screen.getByRole('button', { name: 'Abrir navegación' }));
 expect(screen.getByRole('button', { name: 'Cerrar navegación' })).toHaveAttribute('aria-expanded', 'true');
 await user.keyboard('{Escape}');
 expect(screen.getByRole('button', { name: 'Abrir navegación' })).toHaveAttribute('aria-expanded', 'false');
});

it('prepares an encoded consultation draft without claiming delivery and invalidates it after edits', async () => {
 const user = setup();
 const form = screen.getByRole('form', { name: 'Prepare a business consultation' });
 await user.type(within(form).getByLabelText('Full name'), 'Fictional & Person');
 await user.type(within(form).getByLabelText('Email address'), 'fictional@example.test');
 await user.type(within(form).getByLabelText('Business / company (optional)'), 'Fictional Co');
 await user.selectOptions(within(form).getByLabelText('What do you need?'), '0');
 await user.type(within(form).getByLabelText('Tell us about your project'), 'Opening a café & supplies?');
 await user.click(within(form).getByRole('button', { name: 'Prepare consultation email' }));
 expect(await screen.findByRole('status')).toHaveTextContent('Your email draft is ready');
 const link = screen.getByRole('link', { name: 'Open email application' });
 const url = new URL(link.getAttribute('href'));
 expect(url.protocol).toBe('mailto:');
 expect(url.pathname).toBe('info@onehorizon.es');
 expect(url.searchParams.get('body')).toContain('Opening a café & supplies?');
 expect(url.searchParams.get('body')).toContain('Opening or takeover');
 expect(within(form).getByText(/Nothing is sent by this website/)).toBeVisible();
 await user.type(within(form).getByLabelText('Tell us about your project'), ' Updated');
 expect(screen.queryByRole('link', { name: 'Open email application' })).not.toBeInTheDocument();
});
