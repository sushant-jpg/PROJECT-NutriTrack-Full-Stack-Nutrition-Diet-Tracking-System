const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { COOKIE_NAME, sessionExists } = require('../utils/auth');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const requireUser = asyncHandler(async (req, _res, next) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) throw new AppError('Please log in to continue.', 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    throw new AppError('Your session is invalid or has expired. Please log in again.', 401);
  }

  if (payload.role !== 'user') throw new AppError('This area is for user accounts only.', 403);
  if (!(await sessionExists(payload))) throw new AppError('Your session has ended. Please log in again.', 401);

  const [rows] = await pool.execute(
    `SELECT id, fullname, username, email, joined, status, allocation,
            calories_goal, protein_goal, carbs_goal, fat_goal, created_at
       FROM users WHERE id = ? LIMIT 1`,
    [payload.id]
  );
  const user = rows[0];
  if (!user) throw new AppError('User account not found.', 401);
  if (user.status !== 'Active') {
    throw new AppError('Your account has been deactivated. Please contact the administrator.', 403);
  }
  req.user = user;
  next();
});

module.exports = requireUser;
