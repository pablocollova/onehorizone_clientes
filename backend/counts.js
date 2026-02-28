require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

// Configurar el pool de conexiones
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Crear el adapter de Prisma
const adapter = new PrismaPg(pool);

// Pasar el adapter al constructor (NO datasourceUrl)
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const clients = await prisma.client.count();
        const users = await prisma.user.count();

        console.log("✅ Conectado a la base de datos");
        console.log("clientes:", clients);
        console.log("usuarios:", users);
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();