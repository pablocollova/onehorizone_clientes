const { isTransactionConflict } = require('../src/transactionConflict');
it.each(['P2034', '40001', '40P01'])('recognizes a transactional conflict %s', code => {
    expect(isTransactionConflict({ code })).toBe(true);
});
it('recognizes a serialization failure exposed directly by the PostgreSQL adapter', () => {
    expect(isTransactionConflict({ name: 'DriverAdapterError', cause: { kind: 'TransactionWriteConflict' } })).toBe(true);
    expect(isTransactionConflict({ name: 'DriverAdapterError', cause: { kind: 'AuthenticationFailed' } })).toBe(false);
    expect(isTransactionConflict(new Error('unrelated error'))).toBe(false);
});
