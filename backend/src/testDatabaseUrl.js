// Test suites delete data. Only explicit loopback test databases are accepted.
function validateTestDatabaseUrl(value) {
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('Invalid DATABASE_URL_TEST'); }
  const name = decodeURIComponent(parsed.pathname.slice(1));
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) ||
      !['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) ||
      parsed.search || parsed.hash ||
      !/^[a-zA-Z0-9_]+_test$/.test(name)) {
    throw new Error('DATABASE_URL_TEST must target a loopback database ending in _test, without query or fragment');
  }
  return value;
}
module.exports = { validateTestDatabaseUrl };
