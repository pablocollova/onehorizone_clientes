import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
import { Overview } from './Overview';

const summary = { counts: { clients: 2, locations: 4, activeUsers: 6, pendingInvitations: 1, pendingInvoices: 3, pendingServices: 5, documents: 7 }, generatedAt: '2026-11-02T12:00:00Z' };

it('shows current API counts and usable navigation without invented trends', async () => {
    server.use(http.get('*/api/admin/overview', () => HttpResponse.json(summary)));
    render(<MemoryRouter><Overview /></MemoryRouter>);
    expect(await screen.findByRole('link', { name: 'Open companies' })).toHaveAttribute('href', '/app/admin/clients');
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.queryByText(/vs last month/i)).not.toBeInTheDocument();
});

it('shows a failed request and recovers on retry', async () => {
    server.use(http.get('*/api/admin/overview', () => new HttpResponse(null, { status: 503 })));
    render(<MemoryRouter><Overview /></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load overview');
    server.use(http.get('*/api/admin/overview', () => HttpResponse.json(summary)));
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('7')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
