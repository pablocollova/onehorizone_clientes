import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AuthProvider } from '../../context/AuthContext';
import { users, clients, serviceRecords, invoices } from '../../test/fixtures';
import { server } from '../../test/server';
import { ServiceWorkspace } from './ServiceWorkspace';
import { InvoiceWorkspace } from './InvoiceWorkspace';
import { ClientOverview } from './ClientOverview';
import { WorkspaceLayout } from '../../layouts/WorkspaceLayout';

function setup(element, role = 'CLIENT_USER', serviceHandler = null) {
    localStorage.setItem('user', JSON.stringify({ ...users.client, role, clientId: role.startsWith('PLATFORM') ? null : 'client-1' }));
    localStorage.setItem('token', 'fictional-token');
    server.use(http.get('*/api/workspace/options', () => HttpResponse.json({ clients, vendors: [] })), serviceHandler || http.get('*/api/workspace/services', () => HttpResponse.json({ records: serviceRecords })));
    const user = userEvent.setup();
    render(<AuthProvider><MemoryRouter>{element}</MemoryRouter></AuthProvider>);
    return user;
}

it('shows client services and filtering without administrative mutations', async () => {
    const user = setup(<ServiceWorkspace />);
    await screen.findByRole('heading', { name: 'HVAC Maintenance' });
    expect(screen.queryByRole('button', { name: 'Registrar servicio' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Estado de HVAC Maintenance')).not.toBeInTheDocument();
    await user.type(screen.getByRole('searchbox'), 'does-not-exist');
    expect(await screen.findByText('No hay servicios para mostrar')).toBeInTheDocument();
});

it('shows API failures and retries services', async () => {
    const user = setup(<ServiceWorkspace />, 'CLIENT_USER', http.get('*/api/workspace/services', () => HttpResponse.json({ error: 'Fallo de prueba' }, { status: 503 })));
    expect(await screen.findByRole('alert')).toHaveTextContent('Fallo de prueba');
    server.use(http.get('*/api/workspace/services', () => HttpResponse.json({ records: serviceRecords })));
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('heading', { name: 'HVAC Maintenance' })).toBeVisible();
});

it('creates a GBP invoice with exact cents and the selected company', async () => {
    let submitted;
    server.use(http.post('*/api/admin/invoices', async ({ request }) => { submitted = await request.json(); return HttpResponse.json({ ...submitted, id: 'new-invoice' }); }));
    const user = setup(<InvoiceWorkspace />, 'PLATFORM_ADMIN');
    await user.click(screen.getByRole('button', { name: 'Nueva factura' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nueva factura' });
    await user.selectOptions(within(dialog).getByLabelText('Empresa'), 'client-1');
    await user.selectOptions(within(dialog).getByLabelText('Moneda'), 'GBP');
    await user.type(within(dialog).getByLabelText('Importe'), '42,50');
    await user.click(within(dialog).getByRole('button', { name: 'Guardar factura' }));
    await waitFor(() => expect(submitted).toMatchObject({ currency: 'GBP', totalCents: 4250, clientId: 'client-1' }));
    expect(await screen.findByText('Factura registrada.')).toBeInTheDocument();
});

it('does not expose invoice writing to an internal reader', async () => {
    setup(<InvoiceWorkspace />, 'PLATFORM_USER');
    await screen.findByText('Registro de facturas');
    expect(screen.queryByRole('button', { name: 'Nueva factura' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar factura/ })).not.toBeInTheDocument();
});

it('preserves the invoice edit form when the backend rejects a financial change', async () => {
    server.use(http.patch('*/api/admin/invoices/invoice-1', () => HttpResponse.json({ error: 'Factura con pagos: cambio bloqueado.' }, { status: 409 })));
    const user = setup(<InvoiceWorkspace />, 'PLATFORM_ADMIN');
    await user.click(await screen.findByRole('button', { name: 'Editar factura sin número' }));
    const dialog = screen.getByRole('dialog', { name: 'Editar factura' });
    await user.clear(within(dialog).getByLabelText('Importe'));
    await user.type(within(dialog).getByLabelText('Importe'), '42,50');
    await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('cambio bloqueado');
    expect(within(dialog).getByLabelText('Importe')).toHaveValue('42,50');
});

it('reads scoped account invoices and links to their account and documents', async () => {
    server.use(http.get('*/api/accounts/statement', () => HttpResponse.json({ invoices: [{ ...invoices[0], number: 'OH-UI-001', appliedCents: 4000, eligible: true }] })));
    setup(<InvoiceWorkspace />);
    expect(await screen.findByText('OH-UI-001')).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver cuenta/ })).toHaveAttribute('href', '/app/payments?clientId=client-1');
    expect(screen.queryByRole('button', { name: 'Nueva factura' })).not.toBeInTheDocument();
});

it('has working mobile navigation for a client and a descriptive summary', async () => {
    const user = setup(<Routes><Route element={<WorkspaceLayout />}><Route path="/" element={<ClientOverview />} /><Route path="/app/services" element={<h1>Listado de servicios</h1>} /></Route></Routes>);
    await screen.findByRole('heading', { name: /Hola, Horizon/ });
    await user.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true');
    await user.click(within(screen.getByRole('navigation', { name: 'Navegación principal' }).parentElement).getByRole('link', { name: 'Servicios', exact: true }));
    expect(await screen.findByRole('heading', { name: 'Listado de servicios' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false');
});
