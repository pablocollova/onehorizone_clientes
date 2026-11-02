// Prisma may wrap serialization failures as P2034 or expose adapter-pg's error
// directly when COMMIT fails. Both mean the transaction did not commit.
function isTransactionConflict(error) {
    return ['P2034', '40001', '40P01'].includes(error?.code) ||
        (error?.name === 'DriverAdapterError' && error.cause?.kind === 'TransactionWriteConflict');
}
module.exports = { isTransactionConflict };
