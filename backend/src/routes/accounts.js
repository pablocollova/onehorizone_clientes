const router = require('express').Router();
const service = require('../services/accounts');
const { isTransactionConflict } = require('../transactionConflict');
function handler(fn) {
    return async (req, res, next) => {
        try { res.json(await fn(req)); }
        catch (error) {
            if (error instanceof service.AccountError) return res.status(error.status).json({ error: error.message });
            if (isTransactionConflict(error) || ['P2002', 'P2003'].includes(error.code)) return res.status(409).json({ error: 'Financial data changed; reload and retry with the same request key' });
            next(error);
        }
    };
}
router.get('/statement', handler(req => service.statement(req.user, req.query.clientId)));
router.post('/payments', handler(req => service.createReceipt(req.user, req.body || {})));
router.post('/payments/:id/state', handler(req => service.transition(req.user, req.params.id, req.body?.status)));
router.post('/payments/:id/allocations', handler(req => service.allocate(req.user, req.params.id, req.body || {})));
router.post('/invoices/:id/advance', handler(req => service.recordAdvance(req.user, req.params.id, req.body || {})));
router.post('/exchange-rates', handler(req => service.recordRate(req.user, req.body || {})));
module.exports = router;
