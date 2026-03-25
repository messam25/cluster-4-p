'use strict';

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

  try {
    // 1. Connect without specifying the database to ensure we can create it
    const connection = await mysql.createConnection({
      host: DB_HOST || 'localhost',
      port: parseInt(DB_PORT || '3306', 10),
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
      multipleStatements: true // Required to run the sql file with multiple SQL commands
    });

    console.log(`[init-db] Connected to MySQL server at ${DB_HOST || 'localhost'}. Ensuring database \`${DB_NAME || 'island_outdoor'}\` exists...`);

    // 2. Create the Database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME || 'island_outdoor'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`[init-db] Database \`${DB_NAME || 'island_outdoor'}\` is ready.`);

    // 3. Switch to the newly created / existing database
    await connection.changeUser({ database: DB_NAME || 'island_outdoor' });

    // 4. Verify if tables exist to determine if schema import is needed
    const [rows] = await connection.query('SHOW TABLES');
    if (rows.length === 0) {
      console.log(`[init-db] No tables found in \`${DB_NAME || 'island_outdoor'}\`. Initializing schema...`);
      const schemaPath = path.join(__dirname, '../../Database/mysql_schema.sql');
      
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await connection.query(schemaSql);
        console.log(`[init-db] Schema imported successfully from Database/mysql_schema.sql.`);
      } else {
        console.warn(`[init-db] ⚠️ Schema file not found at ${schemaPath}. Database remains empty.`);
      }
    } else {
      console.log(`[init-db] Tables already exist in \`${DB_NAME || 'island_outdoor'}\`. Skipping schema import.`);
    }

    await connection.end();
  } catch (err) {
    console.error(`[init-db] ❌ Error initializing database: ${err.message}`);
    throw err; // Re-throw to prevent server startup
  }
}

module.exports = initializeDatabase;
