'use strict';

require('dotenv').config();

// ─── Validate required environment variables ──────────────────────────────────
const REQUIRED_ENV = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`[server] Missing required environment variables: ${missing.join(', ')}`);
  console.error('[server] Copy Backend/.env.example to Backend/.env and fill in the values.');
  process.exit(1);
}

const app = require('./app');
const pool = require('./db');

const PORT = process.env.PORT || 3000;

const initializeDatabase = require('./init-db');

// ─── TLS / HTTPS Setup (Practical Assessment Note) ─────────────────────────
// In production (Vercel, Heroku, etc.), HTTPS/TLS is handled at the edge/proxy level.
// If running locally, you could use a self-signed cert and the built-in 'https' module:
// const https = require('https');
// const fs = require('fs');
// const options = { key: fs.readFileSync('key.pem'), cert: fs.readFileSync('cert.pem') };
// https.createServer(options, app).listen(443);
// HTTPS encrypts data in-transit using TLS to prevent eavesdropping and MITM attacks.

// ─── Test DB connection before accepting requests ─────────────────────────────
initializeDatabase()
  .then(() => pool.getConnection())
  .then((conn) => {
    conn.release();
    console.log(`[server] MySQL query pool connected → ${process.env.DB_USER}@${process.env.DB_HOST}/${process.env.DB_NAME}`);
    app.listen(PORT, () => {
      console.log(`[server] Island Outdoor API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[server] ❌ Cannot start the server or connect to MySQL. Check your DB_* variables in Backend/.env');
    console.error(`[server]    ${err.message}`);
    process.exit(1);
  });
