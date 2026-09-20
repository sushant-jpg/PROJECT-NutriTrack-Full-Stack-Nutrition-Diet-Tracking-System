const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nutritrack',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  decimalNumbers: true,
  timezone: process.env.DB_TIMEZONE || '+05:45'
});

async function testConnection() {
  const connection = await pool.getConnection();
  try { await connection.query('SELECT 1'); }
  finally { connection.release(); }
}

module.exports = { pool, testConnection };
