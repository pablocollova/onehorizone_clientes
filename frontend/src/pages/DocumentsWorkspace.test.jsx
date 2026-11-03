import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { File as NativeFile } from 'node:buffer';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { AuthProvider } from '../context/AuthContext';
import { users } from '../test/fixtures';
import { server } from '../test/server';
import { DocumentsWorkspace } from './DocumentsWorkspace';

function setup(role = 'CLIENT_ADMIN', initial = []) {
    localStorage.setItem('user', JSON.stringify({ ...users.client, role, ...(role.startsWith('PLATFORM') ? { clientId: null } : {}) }));
    localStorage.setItem('token', 'fictional-doc-token');
    let documents = initial;
    const uploads = [], patches = [];
    server.use(
        http.get('*/api/documents', ({ request }) => { const category = new URL(request.url).searchParams.get('category'); return HttpResponse.json({ documents: documents.filter(x => !category || x.category === category), nextCursor: null }); }),
        http.get('*/api/documents/context', () => HttpResponse.json({ invoices: [{ id: 'invoice-1', number: 'FICTICIA-001' }], receipts: [{ id: 'receipt-1', reference: 'Pago ficticio' }], locations: [], folders: ['Facturas', 'Pagos'] })),
        http.post('*/api/documents/upload', async ({ request }) => {
            const params = Object.fromEntries(new URL(request.url).searchParams), buffer = await request.arrayBuffer();
            uploads.push({ params, bytes: buffer.byteLength, authorization: request.headers.get('Authorization') });
            const doc = { ...params, id: 'doc-1', mimeType: 'application/pdf', sizeBytes: buffer.byteLength, downloadAvailable: true, updatedAt: '2026-11-03T10:00:00.000Z', invoice: { id: 'invoice-1', number: 'FICTICIA-001' } };
            documents = [doc]; return HttpResponse.json(doc, { status: 201 });
        }),
        http.patch('*/api/documents/:id', async ({ request }) => { const body = await request.json(); patches.push(body); documents = documents.map(x => ({ ...x, ...body })); return HttpResponse.json(documents[0]); }),
        http.get('*/api/documents/:id/history', () => HttpResponse.json([{ id: 'event-1', action: 'UPLOADED', actorName: 'fictional-operator', actorRole: role, details: {}, createdAt: '2026-11-03T10:00:00Z' }])),
    );
    render(<AuthProvider><MemoryRouter initialEntries={['/app/documents?invoiceId=invoice-1']}><DocumentsWorkspace /></MemoryRouter></AuthProvider>);
    return { user: userEvent.setup(), uploads, patches };
}

it('uploads with an invoice reference, organizes metadata and displays the actor history', async () => {
    const { user, uploads, patches } = setup();
    await screen.findByRole('button', { name: 'Cargar archivo', exact: true });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cargar archivo', exact: true })).toBeEnabled());
    await user.upload(screen.getByLabelText('Archivo', { exact: true }), new NativeFile(['%PDF-1.4\nFictional'], 'fictional.pdf', { type: 'application/pdf' }));
    expect(screen.getByLabelText('Archivo', { exact: true }).files).toHaveLength(1);
    await user.type(screen.getByLabelText('Carpeta de carga'), 'Facturas');
    // jsdom's native validity ignores user-event's virtual FileList. Real submit
    // validation and binary downloads are covered by the browser E2E scenarios.
    fireEvent.submit(screen.getByRole('form', { name: 'Cargar archivo privado' }));
    expect(await screen.findByRole('heading', { name: 'fictional.pdf' })).toBeInTheDocument();
    expect(uploads[0]).toMatchObject({ authorization: 'Bearer fictional-doc-token', params: { clientId: 'client-1', invoiceId: 'invoice-1', category: 'INVOICE', folder: 'Facturas' } });
    expect(uploads[0].bytes).toBe(new TextEncoder().encode('%PDF-1.4\nFictional').length);
    await user.click(screen.getByRole('button', { name: 'Organizar fictional.pdf' }));
    await user.clear(screen.getByLabelText('Nombre del documento'));
    await user.type(screen.getByLabelText('Nombre del documento'), 'renamed.pdf');
    await user.click(screen.getByRole('button', { name: 'Guardar organización' }));
    expect(await screen.findByRole('heading', { name: 'renamed.pdf' })).toBeInTheDocument();
    expect(patches[0]).toMatchObject({ name: 'renamed.pdf', expectedUpdatedAt: '2026-11-03T10:00:00.000Z' });
    expect(patches[0]).not.toHaveProperty('clientId');
    await user.click(screen.getByRole('button', { name: 'Historial renamed.pdf' }));
    expect(await screen.findByText(/fictional-operator/)).toBeInTheDocument();
});

it.each(['CLIENT_USER', 'PLATFORM_USER'])('shows documents without write controls for %s', async role => {
    const doc = { id: 'doc-1', name: 'readable.pdf', folder: 'Facturas', category: 'INVOICE', sizeBytes: 12, downloadAvailable: true };
    const { user } = setup(role, [doc]);
    if (role === 'PLATFORM_USER') await user.selectOptions(await screen.findByRole('combobox', { name: 'Empresa' }), 'client-1');
    expect(await screen.findByRole('button', { name: 'Descargar readable.pdf' })).toBeEnabled();
    expect(screen.queryByRole('form', { name: 'Cargar archivo privado' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Organizar readable.pdf' })).not.toBeInTheDocument();
});

it('does not offer downloads for historical paths and shows an explicit empty filter result', async () => {
    const { user } = setup('CLIENT_ADMIN', [{ id: 'legacy', name: 'legacy.pdf', category: 'OTHER', folder: '', sizeBytes: null, downloadAvailable: false }]);
    expect(await screen.findByRole('button', { name: 'Descargar legacy.pdf' })).toBeDisabled();
    expect(screen.getByText(/Registro histórico:/)).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Categoría', exact: true }), 'PAYMENT');
    expect(await screen.findByText('No hay documentos con estos filtros.')).toBeInTheDocument();
});

it('preserves file, metadata and upload key when a request fails', async () => {
    const { user } = setup();
    await screen.findByRole('button', { name: 'Cargar archivo', exact: true });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cargar archivo', exact: true })).toBeEnabled());
    const keys = [];
    server.use(http.post('*/api/documents/upload', ({ request }) => { keys.push(new URL(request.url).searchParams.get('uploadKey')); return HttpResponse.json({ error: 'Fallo ficticio de almacenamiento' }, { status: 503 }); }));
    await user.upload(screen.getByLabelText('Archivo', { exact: true }), new NativeFile(['%PDF-1.4\nLocal'], 'local.pdf', { type: 'application/pdf' }));
    fireEvent.submit(screen.getByRole('form', { name: 'Cargar archivo privado' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Fallo ficticio');
    expect(screen.getByLabelText('Archivo', { exact: true }).files[0].name).toBe('local.pdf');
    fireEvent.submit(screen.getByRole('form', { name: 'Cargar archivo privado' }));
    await waitFor(() => expect(keys).toHaveLength(2));
    expect(keys[0]).toBe(keys[1]);
});
