const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
const { pool } = require('../config/db');

const COOKIE_NAME = 'nutritrack_token';

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  };
}

async function signToken(payload) {
  const sessionId = randomUUID();
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    jwtid: sessionId,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
  const { exp } = jwt.decode(token);
  await pool.execute('DELETE FROM sessions WHERE expires_at <= UNIX_TIMESTAMP()');
  await pool.execute('INSERT INTO sessions (id, principal_id, role, expires_at) VALUES (?, ?, ?, ?)',
    [sessionId, payload.id, payload.role, exp]);
  return token;
}

async function sessionExists(payload) {
  if (!payload.jti) return false;
  const [rows] = await pool.execute(
    'SELECT id FROM sessions WHERE id = ? AND principal_id = ? AND role = ? AND expires_at > UNIX_TIMESTAMP()',
    [payload.jti, payload.id, payload.role]
  );
  return rows.length > 0;
}

module.exports = { COOKIE_NAME, cookieOptions, signToken, sessionExists };
