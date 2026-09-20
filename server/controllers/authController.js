const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { COOKIE_NAME, cookieOptions, signToken } = require('../utils/auth');

const publicUser = (user) => ({
  id: user.id,
  fullname: user.fullname,
  username: user.username,
  email: user.email,
  joined: user.joined,
  status: user.status,
  allocation: user.allocation,
  calories_goal: user.calories_goal,
  protein_goal: user.protein_goal,
  carbs_goal: user.carbs_goal,
  fat_goal: user.fat_goal,
  created_at: user.created_at
});

const signup = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;
  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1',
    [username, email]
  );
  if (existing.length) throw new AppError('That username or email is already registered.', 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const [result] = await pool.execute(
    'INSERT INTO users (fullname, username, email, password_hash) VALUES (?, ?, ?, ?)',
    [fullname, username, email, passwordHash]
  );
  const [rows] = await pool.execute(
    `SELECT id, fullname, username, email, joined, status, allocation,
            calories_goal, protein_goal, carbs_goal, fat_goal, created_at
       FROM users WHERE id = ?`,
    [result.insertId]
  );
  const user = rows[0];
  res.cookie(COOKIE_NAME, await signToken({ id: user.id, role: 'user' }), cookieOptions());
  res.status(201).json({ success: true, message: 'Account created successfully.', data: { user: publicUser(user), role: 'user' } });
});

const login = asyncHandler(async (req, res) => {
  const identifier = String(req.body.identifier || '').trim();
  const password = String(req.body.password || '');
  if (!identifier || !password) throw new AppError('Username/email and password are required.', 400);

  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1',
    [identifier, identifier]
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError('Invalid username or password.', 401);
  }
  if (user.status !== 'Active') {
    throw new AppError('Your account has been deactivated. Please contact the administrator.', 403);
  }

  res.cookie(COOKIE_NAME, await signToken({ id: user.id, role: 'user' }), cookieOptions());
  res.json({ success: true, message: 'Welcome back.', data: { user: publicUser(user), role: 'user' } });
});

const adminLogin = asyncHandler(async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  if (!username || !password) throw new AppError('Administrator username and password are required.', 400);
  const [rows] = await pool.execute('SELECT * FROM admins WHERE LOWER(username) = LOWER(?) LIMIT 1', [username]);
  const admin = rows[0];
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    throw new AppError('Invalid administrator credentials.', 401);
  }
  res.cookie(COOKIE_NAME, await signToken({ id: admin.id, role: 'admin' }), cookieOptions());
  res.json({ success: true, message: 'Administrator login successful.', data: { user: { id: admin.id, username: admin.username }, role: 'admin' } });
});

const logout = asyncHandler(async (req, res) => {
  let payload;
  try { payload = jwt.verify(req.cookies[COOKIE_NAME] || '', process.env.JWT_SECRET); }
  catch (_error) { /* An absent or expired cookie is already logged out. */ }
  if (payload?.jti) await pool.execute('DELETE FROM sessions WHERE id = ?', [payload.jti]);
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(COOKIE_NAME, options);
  res.json({ success: true, message: 'Logged out successfully.' });
});

function me(req, res) {
  res.json({ success: true, data: { user: publicUser(req.user), role: 'user' } });
}

function adminMe(req, res) {
  res.json({ success: true, data: { user: req.admin, role: 'admin' } });
}

module.exports = { signup, login, adminLogin, logout, me, adminMe };
