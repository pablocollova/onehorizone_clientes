const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const path = require('path')

// 👈 CORREGIDO: Especificar la ruta exacta al .env
require('dotenv').config({ 
  path: path.resolve(__dirname, '.env')  // Busca .env en la carpeta actual
})

console.log('📁 Directorio actual:', __dirname)
console.log('🔑 DATABASE_URL:', process.env.DATABASE_URL ? '✓ Cargada' : '✗ NO cargada')

async function checkUser() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está definida en .env')
    process.exit(1)
  }

  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('🔍 Buscando usuario "juan"...')
    const user = await prisma.user.findUnique({
      where: { username: 'juan' }
    })
    
    if (user) {
      console.log('✅ Usuario encontrado:', user)
    } else {
      console.log('❌ Usuario NO encontrado')
      
      // Listar todos los usuarios para ver qué hay
      const allUsers = await prisma.user.findMany()
      console.log('Todos los usuarios en BD:', allUsers)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

checkUser()