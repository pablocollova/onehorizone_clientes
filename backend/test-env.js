require('dotenv').config({ path: './.env' })
console.log('DATABASE_URL:', process.env.DATABASE_URL)
console.log('¿Está definida?', process.env.DATABASE_URL ? 'SÍ' : 'NO') 



