import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { AuthProvider } from '../context/AuthContext';
import { server } from '../test/server';
import { users } from '../test/fixtures';
import { AccountsWorkspace } from './AccountsWorkspace';

function setup(role = 'CLIENT_ADMIN', currency = 'EUR') {
    localStorage.setItem('user', JSON.stringify({ ...users.client, role, ...(role.startsWith('PLATFORM') ? { clientId: null } : {}) }));
    localStorage.setItem('token', 'fictional-local-token');
    let receipt = null, applied = 0, rate = null;
    const requests = [];
    server.use(
        http.get('*/api/accounts/statement', ({ request }) => {
            const clientId = new URL(request.url).searchParams.get('clientId');
            return HttpResponse.json({ clientId, generatedAt: '2026-11-02T12:00:00Z', warnings: {}, events: [],
                balances: [{ currency, recipient: 'ONE_HORIZON', billedCents: 10000, appliedCents: applied, outstandingCents: 10000 - applied,
                    netCents: receipt?.status === 'CONFIRMED' ? 6000 : 10000, confirmedCents: receipt?.status === 'CONFIRMED' ? 4000 : 0, unappliedCents: receipt?.status === 'CONFIRMED' ? 4000 - applied : 0,
                    processingCents: receipt?.status === 'PROCESSING' ? 4000 : 0, reviewCents: receipt?.status === 'REVIEW' ? 4000 : 0,
                    outstandingEurCents: currency === 'EUR' ? 10000 - applied : rate ? 12500 : null, unappliedEurCents: 0, rate }],
                invoices: [{ id: 'invoice-1', number: 'FICTICIA-001', currency, totalCents: 10000, type: 'ONEHORIZON_FEE', recipient: 'ONE_HORIZON', status: 'ISSUED', eligible: true, appliedCents: applied, allocations: [], legacyPaymentsCount: 0, totalEurCents: currency === 'EUR' ? 10000 : null }],
                receipts: receipt ? [{ ...receipt, allocations: applied ? [{ id: 'allocation-1', invoiceId: 'invoice-1', amountCents: applied }] : [] }] : [],
            });
        }),
        http.post('*/api/accounts/payments', async ({ request }) => {
            const body = await request.json(); requests.push(body); receipt = { ...body, id: 'receipt-1', status: 'PROCESSING' };
            return HttpResponse.json(receipt);
        }),
        http.post('*/api/accounts/payments/:id/state', async ({ request }) => { receipt.status = (await request.json()).status; return HttpResponse.json(receipt); }),
        http.post('*/api/accounts/payments/:id/allocations', async ({ request }) => { const body = await request.json(); requests.push(body); applied = body.amountCents; return HttpResponse.json({ id: 'allocation-1' }); }),
        http.post('*/api/accounts/exchange-rates', async ({ request }) => { const body = await request.json(); requests.push(body); rate = { eurMicros: 1250000, source: body.source, effectiveAt: body.effectiveAt }; return HttpResponse.json(rate); }),
    );
    render(<AuthProvider><MemoryRouter><AccountsWorkspace /></MemoryRouter></AuthProvider>);
    return { requests, user: userEvent.setup() };
}

it('lets a client administrator record, review, confirm and allocate an exact partial payment', async () => {
    const { requests, user } = setup();
    await screen.findByText('FICTICIA-001');
    await user.type(screen.getByLabelText('Importe del pago'), '40.00');
    await user.type(screen.getByLabelText('Referencia del pago'), 'Transferencia ficticia');
    await user.click(screen.getByRole('button', { name: 'Registrar pago', exact: true }));
    const review = await screen.findByRole('button', { name: /Enviar a revisión: Transferencia ficticia/ });
    expect(requests[0]).toMatchObject({ amountCents: 4000, clientId: 'client-1', currency: 'EUR' });
    expect(requests[0].requestKey).toBeTruthy();
    await user.click(review);
    await user.click(await screen.findByRole('button', { name: /Confirmar pago: Transferencia ficticia/ }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /Confirmar pago:/ })).not.toBeInTheDocument());
    await user.selectOptions(screen.getByLabelText('Pago confirmado'), 'receipt-1');
    await user.selectOptions(screen.getByLabelText('Factura a imputar'), 'invoice-1');
    await user.type(screen.getByLabelText('Importe a imputar'), '40');
    await user.click(screen.getByRole('button', { name: 'Imputar pago', exact: true }));
    expect(await screen.findAllByText(/60,00/)).not.toHaveLength(0);
    expect(requests[1]).toMatchObject({ amountCents: 4000, invoiceId: 'invoice-1' });
});

it.each(['CLIENT_USER', 'PLATFORM_USER'])('shows read-only financial data to %s', async role => {
    const { user } = setup(role);
    if (role === 'PLATFORM_USER') await user.selectOptions(await screen.findByLabelText('Empresa'), 'client-1');
    await screen.findByText('FICTICIA-001');
    expect(screen.queryByRole('form', { name: 'Registrar pago' })).not.toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Imputar pago' })).not.toBeInTheDocument();
    expect(screen.getByText(/Acceso de lectura/)).toBeInTheDocument();
});

it('shows missing EUR conversion and replaces it with the documented manual rate', async () => {
    const { user, requests } = setup('CLIENT_ADMIN', 'GBP');
    expect(await screen.findByText(/Equivalente EUR pendiente: falta cotización/)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Euros por unidad'), '1.25');
    await user.type(screen.getByLabelText('Fuente de cotización'), 'Fuente ficticia local');
    await user.click(screen.getByRole('button', { name: 'Registrar cotización', exact: true }));
    expect(await screen.findByText(/1 GBP = 1.250000 EUR/)).toBeInTheDocument();
    expect(requests[0]).toMatchObject({ eurPerUnit: '1.25', source: 'Fuente ficticia local', clientId: 'client-1' });
});

it('keeps form values on API failure and retries with the same idempotency key', async () => {
    const { user, requests } = setup();
    await screen.findByText('FICTICIA-001');
    let fail = true;
    server.use(http.post('*/api/accounts/payments', async ({ request }) => { requests.push(await request.json()); return fail ? HttpResponse.json({ error: 'Conflicto ficticio' }, { status: 409 }) : HttpResponse.json({ id: 'receipt-1' }); }));
    await user.type(screen.getByLabelText('Importe del pago'), '40.00');
    await user.type(screen.getByLabelText('Referencia del pago'), 'Prueba local');
    await user.click(screen.getByRole('button', { name: 'Registrar pago', exact: true }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Conflicto ficticio');
    expect(screen.getByLabelText('Importe del pago')).toHaveValue('40.00');
    fail = false;
    await user.click(screen.getByRole('button', { name: 'Registrar pago', exact: true }));
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[0].requestKey).toBe(requests[1].requestKey);
});
