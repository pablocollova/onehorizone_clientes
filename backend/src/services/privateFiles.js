const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const MAX_BYTES = 10 * 1024 * 1024;
class FileError extends Error {
    constructor(message, status = 400) { super(message); this.status = status; }
}
const check = (value, message, status) => { if (!value) throw new FileError(message, status); };
function fileName(value) {
    check(typeof value === 'string' && value.trim().length > 0 && value.length <= 180 && !/[\x00-\x1f\x7f/\\]/.test(value) && !['.', '..'].includes(value.trim()), 'Nombre de archivo inválido.');
    return value.trim();
}
function detect(buffer, name) {
    check(Buffer.isBuffer(buffer) && buffer.length > 0 && buffer.length <= MAX_BYTES, 'El archivo debe tener entre 1 byte y 10 MB.');
    const extension = path.extname(fileName(name)).toLowerCase();
    if (extension === '.pdf' && buffer.subarray(0, 5).toString() === '%PDF-') return 'application/pdf';
    if (extension === '.png' && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
    if (['.jpg', '.jpeg'].includes(extension) && buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return 'image/jpeg';
    if (['.txt', '.csv'].includes(extension)) {
        let value;
        try { value = new TextDecoder('utf-8', { fatal: true }).decode(buffer); } catch { throw new FileError('El texto debe estar codificado en UTF-8.'); }
        check(!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value), 'Contenido de texto inválido.');
        return extension === '.txt' ? 'text/plain' : 'text/csv';
    }
    throw new FileError('Formato no admitido o contenido incompatible. Usá PDF, PNG, JPEG, TXT o CSV.');
}
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const within = (root, value) => {
    const normalize = input => process.platform === 'win32' ? input.toLowerCase() : input;
    return normalize(value) === normalize(root) || normalize(value).startsWith(normalize(root) + path.sep);
};
async function rootDirectory() {
    const configured = process.env.NODE_ENV === 'test' ? process.env.DOCUMENT_STORAGE_DIR_TEST : process.env.DOCUMENT_STORAGE_DIR;
    check(configured && path.isAbsolute(configured), 'Almacenamiento privado no configurado.', 503);
    const candidate = path.resolve(configured), repo = path.resolve(__dirname, '../../..');
    const forbidden = ['public', 'frontend/public', 'frontend/dist', 'backend/public'].map(x => path.resolve(repo, x));
    check(!forbidden.some(x => within(x, candidate)), 'El almacenamiento debe estar fuera de directorios públicos.', 503);
    await fs.mkdir(candidate, { recursive: true, mode: 0o700 });
    const root = await fs.realpath(candidate);
    check(!forbidden.some(x => within(x, root)), 'Almacenamiento privado inválido.', 503);
    return root;
}
function keyPath(root, key) {
    check(typeof key === 'string' && /^[a-f0-9]{64}\.bin$/.test(key), 'Archivo privado no disponible.', 409);
    return path.join(root, key);
}
async function store(buffer) {
    const root = await rootDirectory(), key = `${crypto.randomBytes(32).toString('hex')}.bin`;
    const target = keyPath(root, key);
    let handle;
    try { handle = await fs.open(target, 'wx', 0o600); await handle.writeFile(buffer); await handle.sync(); }
    catch (error) { if (handle) { await handle.close(); handle = null; await fs.unlink(target).catch(() => {}); } throw error; }
    finally { await handle?.close(); }
    return { root, key };
}
async function removeStored(stored) { await fs.unlink(keyPath(stored.root, stored.key)).catch(() => {}); }
async function read(document) {
    check(document.storageKind === 'PRIVATE_LOCAL_V1' && /^[a-f0-9]{64}$/.test(document.checksum || ''), 'Archivo histórico pendiente de incorporación al almacenamiento privado.', 409);
    const root = await rootDirectory(), target = keyPath(root, document.storagePath);
    let handle;
    try {
        const info = await fs.lstat(target);
        check(info.isFile() && !info.isSymbolicLink() && info.size > 0 && info.size <= MAX_BYTES && info.size === document.sizeBytes, 'Integridad del archivo no verificada.', 409);
        check(path.dirname(await fs.realpath(target)) === root, 'Archivo privado no disponible.', 409);
        handle = await fs.open(target, 'r');
        const opened = await handle.stat();
        check(opened.ino === info.ino && opened.dev === info.dev && opened.size === info.size, 'El archivo cambió durante la lectura.', 409);
        const buffer = await handle.readFile();
        check(buffer.length === document.sizeBytes && hash(buffer) === document.checksum, 'Integridad del archivo no verificada.', 409);
        return buffer;
    } catch (error) {
        if (['ENOENT', 'ELOOP'].includes(error.code)) throw new FileError('Archivo privado no disponible.', 409);
        throw error;
    } finally { await handle?.close(); }
}
module.exports = { MAX_BYTES, FileError, check, fileName, detect, hash, store, removeStored, read };
