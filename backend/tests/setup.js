require('dotenv').config()

process.env.NODE_ENV = 'test'
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
// Never reuse configured application storage, including when .env points elsewhere.
const documentTestRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'onehorizon-doc-test-'))
process.env.DOCUMENT_STORAGE_DIR_TEST = documentTestRoot
afterAll(() => {
  const resolved = path.resolve(documentTestRoot)
  if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('onehorizon-doc-test-')) throw new Error('Unsafe temporary document directory')
  fs.rmSync(resolved, { recursive: true, force: true })
})
// Never send real mail from integration tests, even if a local .env has SMTP settings.
process.env.SMTP_HOST = ''
process.env.SMTP_USER = ''
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret'
process.env.DATABASE_URL_TEST = process.env.DATABASE_URL_TEST || 'postgresql://onehorizon:onehorizon@localhost:5432/onehorizon_test'
