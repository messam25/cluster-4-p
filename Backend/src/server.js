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

// ─── Test DB connection before accepting requests ─────────────────────────────
pool.getConnection()
  .then((conn) => {
    conn.release();
    console.log(`[server] MySQL connected → ${process.env.DB_USER}@${process.env.DB_HOST}/${process.env.DB_NAME}`);
    app.listen(PORT, () => {
      console.log(`[server] Island Outdoor API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[server] ❌ Cannot connect to MySQL. Check your DB_* variables in Backend/.env');
    console.error(`[server]    ${err.message}`);
    process.exit(1);
  });
