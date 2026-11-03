const { detect, fileName } = require('../src/services/privateFiles');
it.each([
    ['invoice.pdf', Buffer.from('%PDF-1.4\nFictional'), 'application/pdf'],
    ['photo.png', Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]), 'image/png'],
    ['photo.jpeg', Buffer.from([255, 216, 255, 224, 255, 217]), 'image/jpeg'],
    ['note.txt', Buffer.from('Texto ficticio UTF-8 áé'), 'text/plain'],
    ['table.csv', Buffer.from('referencia,importe\nficticia,100'), 'text/csv'],
])('identifies allowed content %s independently of client MIME headers', (name, bytes, type) => {
    expect(detect(bytes, name)).toBe(type);
});
it.each([
    ['disguised.pdf', Buffer.from('<html>not a pdf</html>')],
    ['binary.txt', Buffer.from([0, 1, 2])],
    ['invalid.txt', Buffer.from([255, 255])],
    ['script.svg', Buffer.from('<svg/>')],
])('rejects invalid or disallowed content %s', (name, bytes) => expect(() => detect(bytes, name)).toThrow());
it('rejects CRLF filenames and paths before any download header or file operation', () => {
    expect(() => fileName('invoice.pdf\r\nX-Fake: test')).toThrow();
    expect(() => fileName('C:\\private\\file.pdf')).toThrow();
});
