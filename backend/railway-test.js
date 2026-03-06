// railway-test.js
const express = require('express');
const app = express();

// Solo lo mínimo indispensable
app.get('/health', (req, res) => {
  console.log('📡 Health check received at:', new Date().toISOString());
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Test server working' });
});

const port = process.env.PORT;
console.log('🚀 Starting test server...');
console.log('📌 PORT from env:', port);
console.log('📂 Current directory:', process.cwd());

if (!port) {
  console.error('❌ No PORT variable!');
  process.exit(1);
}

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ TEST SERVER listening on 0.0.0.0:${port}`);
  console.log('⏱️  Waiting for health checks...');
});

// Log cada 10 segundos para ver que está vivo
setInterval(() => {
  console.log('💓 Server alive at:', new Date().toISOString());
}, 10000);

// Manejar errores
server.on('error', (err) => {
  console.error('❌ Server error:', err);
});