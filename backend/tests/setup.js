require('dotenv').config()

process.env.NODE_ENV = 'test'
// Never send real mail from integration tests, even if a local .env has SMTP settings.
process.env.SMTP_HOST = ''
process.env.SMTP_USER = ''
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret'
process.env.DATABASE_URL_TEST = process.env.DATABASE_URL_TEST || 'postgresql://onehorizon:onehorizon@localhost:5432/onehorizon_test'
