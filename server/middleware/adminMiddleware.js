const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { COOKIE_NAME, sessionExists } = require('../utils/auth');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const requireAdmin = asyncHandler(async (req, _res, next) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) throw new AppError('Administrator login required.', 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    throw new AppError('Your administrator session is invalid or has expired.', 401);
  }

  if (payload.role !== 'admin') throw new AppError('Administrator access required.', 403);
  if (!(await sessionExists(payload))) throw new AppError('Your administrator session has ended.', 401);
  const [rows] = await pool.execute('SELECT id, username, created_at FROM admins WHERE id = ? LIMIT 1', [payload.id]);
  if (!rows[0]) throw new AppError('Administrator account not found.', 401);
  req.admin = rows[0];
  next();
});

module.exports = requireAdmin;
