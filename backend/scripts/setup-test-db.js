const { spawnSync } = require('child_process')
const { Client } = require('pg')

const DEFAULT_TEST_URL = 'postgresql://onehorizon:onehorizon@localhost:5432/onehorizon_test'

function getTestUrl() {
  const url = process.env.DATABASE_URL_TEST || DEFAULT_TEST_URL

  if (!url.includes('onehorizon_test') && !url.includes('_test')) {
    throw new Error('DATABASE_URL_TEST must target a test database containing onehorizon_test or _test')
  }

  return url
}

function run(command, args, env) {
  const useNpmCli = command === 'npx' && process.env.npm_execpath
  const executable = useNpmCli ? process.execPath : command
  const executableArgs = useNpmCli ? [process.env.npm_execpath, 'exec', '--', ...args] : args
  const result = spawnSync(executable, executableArgs, {
    cwd: `${__dirname}/..`,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`)
  }
}

async function ensureDatabase(url) {
  const parsed = new URL(url)
  const dbName = parsed.pathname.replace(/^\//, '')

  if (!/^[a-zA-Z0-9_]+$/.test(dbName) || (!dbName.includes('onehorizon_test') && !dbName.includes('_test'))) {
    throw new Error(`Refusing to create unsafe test database name: ${dbName}`)
  }

  const adminUrl = new URL(url)
  adminUrl.pathname = '/postgres'

  const client = new Client({ connectionString: adminUrl.toString() })
  await client.connect()

  try {
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`)
      console.log(`Created test database ${dbName}`)
    } else {
      console.log(`Test database ${dbName} already exists`)
    }
  } finally {
    await client.end()
  }
}

async function main() {
  const testUrl = getTestUrl()
  await ensureDatabase(testUrl)

  const env = { DATABASE_URL: testUrl, DATABASE_URL_TEST: testUrl, NODE_ENV: 'test' }
  run('npx', ['prisma', 'migrate', 'deploy'], env)
  run('npx', ['prisma', 'db', 'seed'], env)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
