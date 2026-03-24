'use strict';

/**
 * Imports mysql_schema.sql into MySQL using mysql2.
 * Run from the Backend folder: node scripts/import-schema.js
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const SCHEMA_PATH = path.join(__dirname, '../../Database/mysql_schema.sql');

async function run() {
  console.log('[import] Reading schema from', SCHEMA_PATH);
  const sql = fs.readFileSync(SCHEMA_PATH, 'utf8');

  // Split on semicolons, filter out empty/comment-only lines
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--'));

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false,
    multipleStatements: true,
  });

  console.log('[import] Connected to MySQL. Running schema…');

  for (const stmt of statements) {
    if (!stmt) continue;
    try {
      await conn.query(stmt + ';');
      // Print first 60 chars to show progress
      console.log('[import] OK:', stmt.substring(0, 60).replace(/\s+/g, ' ').trim());
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DB_CREATE_EXISTS') {
        console.log('[import] SKIP (already exists):', stmt.substring(0, 40).trim());
      } else {
        console.error('[import] ERROR on:', stmt.substring(0, 80).trim());
        console.error('[import]', err.message);
      }
    }
  }

  await conn.end();
  console.log('[import] ✅ Schema import complete!');
}

run().catch((err) => {
  console.error('[import] Fatal:', err.message);
  process.exit(1);
});
