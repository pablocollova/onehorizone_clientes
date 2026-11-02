import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AdminLayout } from './AdminLayout';

it('lets an internal reader use the console without the invitation menu', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 'fictional-reader', name: 'Reader', role: 'PLATFORM_USER' }));
    localStorage.setItem('token', 'fictional-reader-token');
    render(<AuthProvider><MemoryRouter initialEntries={['/app/admin/overview']}><Routes>
        <Route path="/app/admin" element={<AdminLayout />}><Route path="overview" element={<h1>Real overview route</h1>} /></Route>
    </Routes></MemoryRouter></AuthProvider>);
    expect(await screen.findByRole('heading', { name: 'Real overview route' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Invoices' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Invite User' })).not.toBeInTheDocument();
});
