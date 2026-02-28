const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
require('dotenv').config()

// Configuración del adapter para Prisma 7
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function verTodos() {
    try {
        console.log('📊 CONSULTANDO BASE DE DATOS...\n')

        // Consultar todas las tablas
        const [users, clients, invoices, documents, locations, payments, vendors] = await Promise.all([
            prisma.user.findMany(),
            prisma.client.findMany(),
            prisma.invoice.findMany(),
            prisma.document.findMany(),
            prisma.location.findMany(),
            prisma.payment.findMany(),
            prisma.vendor.findMany()
        ])

        console.log('👥 USUARIOS:', JSON.stringify(users, null, 2))
        console.log('\n🏢 CLIENTES:', JSON.stringify(clients, null, 2))
        console.log('\n📄 FACTURAS:', JSON.stringify(invoices, null, 2))
        console.log('\n📁 DOCUMENTOS:', JSON.stringify(documents, null, 2))
        console.log('\n📍 UBICACIONES:', JSON.stringify(locations, null, 2))
        console.log('\n💰 PAGOS:', JSON.stringify(payments, null, 2))
        console.log('\n🏭 PROVEEDORES:', JSON.stringify(vendors, null, 2))

        // Resumen
        console.log('\n📈 RESUMEN:')
        console.log(`- Usuarios: ${users.length}`)
        console.log(`- Clientes: ${clients.length}`)
        console.log(`- Facturas: ${invoices.length}`)
        console.log(`- Documentos: ${documents.length}`)
        console.log(`- Ubicaciones: ${locations.length}`)
        console.log(`- Pagos: ${payments.length}`)
        console.log(`- Proveedores: ${vendors.length}`)

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

verTodos()