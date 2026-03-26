const mysql = require('mysql2/promise');

async function testPasswords() {
  const passwords = ['Jahjah123.', 'Jahjah123', 'root', '', 'password', '123456', 'admin'];
  for (const pwd of passwords) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: pwd
      });
      console.log('SUCCESS with password:', pwd);
      await conn.end();
      return;
    } catch (err) {
      console.log('Failed with password:', pwd, '->', err.message);
    }
  }
}
testPasswords();
