const express = require('express');
const router = express.Router();
const service = require('../services/documents');
const { FileError, MAX_BYTES } = require('../services/privateFiles');
const { isTransactionConflict } = require('../transactionConflict');
const handle = fn => async (req, res, next) => { try { await fn(req, res, next); } catch (error) { next(error); } };
router.use((req, res, next) => { res.set('Cache-Control', 'private, no-store'); next(); });
router.get('/', handle(async (req, res) => res.json(await service.list(req.user, req.query))));
router.get('/context', handle(async (req, res) => res.json(await service.context(req.user, req.query.clientId))));
router.post('/upload', handle(async (req, res, next) => {
    service.writer(req.user);
    if (!req.is('application/octet-stream')) throw new FileError('Usá carga binaria de archivos.');
    next();
}), express.raw({ type: 'application/octet-stream', limit: MAX_BYTES }), handle(async (req, res) => res.status(201).json(await service.upload(req.user, req.query, req.body))));
router.patch('/:id', handle(async (req, res) => res.json(await service.organize(req.user, req.params.id, req.body))));
router.get('/:id/history', handle(async (req, res) => res.json(await service.history(req.user, req.params.id))));
router.get('/:id/download', handle(async (req, res) => {
    const file = await service.download(req.user, req.params.id);
    res.set({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "sandbox; default-src 'none'" });
    res.attachment(file.name).type(file.mimeType).send(file.buffer);
}));
router.use((error, req, res, next) => {
    if (error instanceof FileError) return res.status(error.status).json({ error: error.message });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'El archivo supera 10 MB.' });
    if (isTransactionConflict(error) || ['P2002', 'P2003'].includes(error.code)) return res.status(409).json({ error: 'Los datos cambiaron. Actualizá la lista y reintentá la operación.' });
    if (['EACCES', 'EPERM', 'ENOSPC', 'EROFS'].includes(error.code)) return res.status(503).json({ error: 'Almacenamiento privado no disponible. Reintentá más tarde.' });
    next(error);
});
module.exports = router;
