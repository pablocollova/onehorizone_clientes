export function toCents(value) {
    const normalized = String(value).trim().replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) throw new Error('Ingresá un importe con hasta dos decimales.');
    const [units, decimals = ''] = normalized.split('.');
    const result = Number(units) * 100 + Number(decimals.padEnd(2, '0'));
    if (!Number.isSafeInteger(result) || result < 0 || result > 2147483647) throw new Error('El importe está fuera de rango.');
    return result;
}
