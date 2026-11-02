const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const { validateTestDatabaseUrl } = require('./testDatabaseUrl')

function resolveDatabaseUrl() {
    if (process.env.NODE_ENV !== 'test') {
        return process.env.DATABASE_URL
    }

    const testUrl = process.env.DATABASE_URL_TEST

    if (!testUrl) {
        throw new Error('DATABASE_URL_TEST is required when NODE_ENV=test')
    }

    return validateTestDatabaseUrl(testUrl)
}

const databaseUrl = resolveDatabaseUrl()

// Configurar el pool de conexiones
const pool = new Pool({
    connectionString: databaseUrl
})

// Crear el adapter de Prisma
const adapter = new PrismaPg(pool)

// Crear el cliente de Prisma con el adapter
const prisma = new PrismaClient({ adapter })

// Manejar la desconexión al cerrar la aplicación
process.on('beforeExit', async () => {
    await prisma.$disconnect()
    await pool.end()
})

module.exports = prisma
module.exports.resolveDatabaseUrl = resolveDatabaseUrl
