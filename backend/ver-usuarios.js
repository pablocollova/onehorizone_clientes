const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
require('dotenv').config()
require("dotenv").config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function verUsuarios() {
    try {
        const usuarios = await prisma.user.findMany({
            include: {
                client: true
            }
        })

        console.log('USUARIOS ENCONTRADOS:')
        console.log(JSON.stringify(usuarios, null, 2))
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

verUsuarios()