export const money = (cents, currency = 'EUR') => {
    try { return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(cents / 100); }
    catch { return `${(cents / 100).toFixed(2)} ${currency}`; }
};
export const recipientLabel = value => value === 'VENDOR' ? 'Proveedor' : 'One Horizon';
