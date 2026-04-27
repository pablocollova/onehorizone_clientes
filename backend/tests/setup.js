require('dotenv').config()

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret'
process.env.DATABASE_URL_TEST = process.env.DATABASE_URL_TEST || 'postgresql://onehorizon:onehorizon@localhost:5432/onehorizon_test'
