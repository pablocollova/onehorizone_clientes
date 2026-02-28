const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
require('dotenv').config()

// Configuración correcta para Prisma 7
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter }) // <-- SOLO 'adapter', NO 'datasourceUrl'

async function test() {
    try {
        const users = await prisma.user.findMany()
        console.log('Usuarios encontrados:', users)
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

test()