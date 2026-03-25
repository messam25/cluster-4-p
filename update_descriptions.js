const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const descriptions = {
  'Kingston Trekker': 'A rugged, high-performance hiking boot designed for Jamaica\'s toughest trails. Features waterproof lining and superior grip.',
  'Blue Mountain Boots': 'Premium leather boots perfect for the misty peaks of the Blue Mountains. Durable, comfortable, and stylish.',
  'Negril Beach Tent': 'Lightweight, easy-to-assemble tent providing 50+ UPF protection. Ideal for long days on the white sands of Negril.',
  'Ocho Rios Rain Jacket': 'Ultra-lightweight and breathable waterproof shell. Keeps you dry during tropical downpours in the garden parish.',
  'Island Life Bottle': 'Double-walled vacuum insulated stainless steel bottle. Keeps your drinks ice-cold for 24 hours under the Caribbean sun.',
  'Montego Bay Lantern': 'High-lumen LED lantern with multiple light modes. Perfect for beach bonfires or mountain camping.',
  'Peak Gas Stove': 'Compact and efficient single-burner stove. Boiling water in minutes even at high altitudes.',
  'Multi-Tool Pro': '18-in-1 stainless steel multi-tool. Includes everything from wire cutters to a heavy-duty serrated blade.'
};

async function updateDescriptions() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'island_outdoor'
  });

  console.log('Connected to database. Updating descriptions...');

  for (const [name, desc] of Object.entries(descriptions)) {
    await connection.query('UPDATE products SET description = ? WHERE name = ?', [desc, name]);
    console.log(`Updated: ${name}`);
  }

  await connection.end();
  console.log('Finished updating descriptions.');
}

updateDescriptions().catch(console.error);
