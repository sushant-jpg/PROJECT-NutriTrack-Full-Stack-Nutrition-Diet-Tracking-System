require('dotenv').config();

const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

async function seedAdmin() {
  const username = String(process.env.ADMIN_USERNAME || '').trim();
  const password = String(process.env.ADMIN_INITIAL_PASSWORD || '');
  if (!username || password.length < 12) {
    throw new Error('Set ADMIN_USERNAME and an ADMIN_INITIAL_PASSWORD of at least 12 characters in server/.env.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.execute(
    `INSERT INTO admins (username, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [username, passwordHash]
  );
  console.log(`Development administrator "${username}" is ready. Remove ADMIN_INITIAL_PASSWORD from .env after use.`);
}

seedAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

