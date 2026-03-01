const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

// Configurar el pool de conexiones
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
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