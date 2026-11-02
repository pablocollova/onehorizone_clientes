import { money, recipientLabel } from '../lib/finance';
export function BalanceSummary({ balances }) {
    return <div className="grid gap-4 md:grid-cols-2">
        {balances.filter(x => x.billedCents || x.confirmedCents || x.processingCents || x.reviewCents).map(row => <section key={`${row.currency}-${row.recipient}`} className="p-5 bg-white rounded-xl border space-y-2">
            <h2 className="font-bold">{recipientLabel(row.recipient)} · {row.currency}</h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
                {row.recipient === 'ONE_HORIZON' && row.netCents !== undefined ? <><dt>Saldo neto de cuenta</dt><dd>{money(row.netCents, row.currency)}{row.netCents < 0 ? ' a favor' : ''}</dd></> : null}
                <dt>Deuda pendiente</dt><dd>{money(row.outstandingCents, row.currency)}</dd>
                <dt>Ya imputado</dt><dd>{money(row.appliedCents, row.currency)}</dd>
                <dt>Confirmado sin aplicar</dt><dd>{money(row.unappliedCents, row.currency)}</dd>
                <dt>Pagos en proceso</dt><dd>{money(row.processingCents, row.currency)}</dd>
                <dt>Pagos en revisión</dt><dd>{money(row.reviewCents, row.currency)}</dd>
            </dl>
            {row.recipient === 'ONE_HORIZON' ? <p className="text-xs text-gray-600">El saldo neto resta los pagos confirmados sin aplicar. La deuda de cada factura se cancela mediante imputación.</p> : <p className="text-xs text-gray-600">Resumen de proveedores. Cada imputación debe corresponder al mismo proveedor.</p>}
            {row.currency !== 'EUR' ? <div className="text-sm text-gray-600">
                {row.outstandingEurCents === null ? <p>Equivalente EUR pendiente: falta cotización.</p> : <>
                    <p>Deuda equivalente: {money(row.outstandingEurCents)} · Sin aplicar equivalente: {money(row.unappliedEurCents)}</p>
                    {row.recipient === 'ONE_HORIZON' && row.netEurCents !== undefined ? <p>Saldo neto equivalente: {money(row.netEurCents)}</p> : null}
                    <p>Cotización manual: 1 {row.currency} = {(row.rate.eurMicros / 1000000).toFixed(6)} EUR. {row.rate.source} · {new Date(row.rate.effectiveAt).toLocaleDateString('es-ES')}</p>
                </>}
                <p>Referencia informativa; no convierte ni liquida la deuda.</p>
            </div> : null}
        </section>)}
        {!balances.some(x => x.billedCents || x.confirmedCents || x.processingCents || x.reviewCents) ? <p>No hay movimientos reconocidos en la cuenta.</p> : null}
    </div>;
}
