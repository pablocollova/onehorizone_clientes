const { validateTestDatabaseUrl } = require('../src/testDatabaseUrl')

describe('destructive test database guard', () => {
  it.each([
    'postgresql://onehorizon_test:password@db.example.com/production',
    'postgresql://user:password_test@localhost/production',
    'postgresql://user:password@db.example.com/onehorizon_test',
    'postgresql://user:password@localhost/production?application_name=onehorizon_test',
    'postgresql://user:password@localhost/onehorizon_test/production',
    'postgresql://user:password@localhost/onehorizon_test?host=production.example.com',
    'postgresql://user:password@localhost/onehorizon_test?options=-csearch_path%3Dproduction',
    'postgresql://user:password@localhost/onehorizon_test#production',
    'https://localhost/onehorizon_test', 'invalid', undefined,
  ])('rejects unsafe target %s', value => expect(() => validateTestDatabaseUrl(value)).toThrow())
  it.each(['localhost', '127.0.0.1', '[::1]'])('accepts isolated loopback %s', host => {
    const url = `postgresql://test:test@${host}:55432/onehorizon_security_test`
    expect(validateTestDatabaseUrl(url)).toBe(url)
  })
})
