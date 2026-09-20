const { pool } = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { assertDate } = require('../utils/date');
const { EMAIL_PATTERN, MEAL_TYPES } = require('../middleware/validationMiddleware');

function pageValues(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, offset: (page - 1) * limit };
}

function pagination(page, limit, total) {
  return { page, limit, total: Number(total), pages: Math.ceil(Number(total) / limit) };
}

const stats = asyncHandler(async (_req, res) => {
  const [[data]] = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM users WHERE status = 'Active') AS active_users,
      (SELECT COUNT(*) FROM meals WHERE DATE(occurred_at) = CURRENT_DATE) AS meals_today,
      (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL WEEKDAY(CURRENT_DATE) DAY)) AS new_users_this_week,
      (SELECT COUNT(*) FROM meals) AS total_meals`
  );
  res.json({ success: true, data });
});

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = pageValues(req.query);
  const search = String(req.query.search || '').trim();
  const status = String(req.query.status || '').trim();
  const conditions = [];
  const values = [];
  if (search) {
    conditions.push('(fullname LIKE ? OR username LIKE ? OR email LIKE ?)');
    values.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status) {
    if (!['Active', 'Inactive'].includes(status)) throw new AppError('Invalid status filter.', 400);
    conditions.push('status = ?');
    values.push(status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [[count]] = await pool.execute(`SELECT COUNT(*) AS total FROM users ${where}`, values);
  const [rows] = await pool.execute(
    `SELECT id, fullname, username, email, joined, status, allocation, calories_goal,
            protein_goal, carbs_goal, fat_goal, created_at, updated_at
       FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  res.json({ success: true, data: rows, pagination: pagination(page, limit, count.total) });
});

const getUser = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT id, fullname, username, email, joined, status, allocation, calories_goal,
            protein_goal, carbs_goal, fat_goal, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
    [req.params.id]
  );
  if (!rows[0]) throw new AppError('User not found.', 404);
  res.json({ success: true, data: rows[0] });
});

const updateUser = asyncHandler(async (req, res) => {
  const { fullname, email, status, allocation, calories_goal, protein_goal, carbs_goal, fat_goal } = req.body;
  const errors = [];
  if (!fullname || fullname.trim().length < 2 || fullname.trim().length > 120) errors.push('Full name must be 2-120 characters.');
  if (!EMAIL_PATTERN.test(email || '')) errors.push('A valid email is required.');
  if (!['Active', 'Inactive'].includes(status)) errors.push('Status must be Active or Inactive.');
  if (!allocation || allocation.trim().length > 80) errors.push('Allocation is required and must be 80 characters or fewer.');
  const goals = { calories_goal, protein_goal, carbs_goal, fat_goal };
  Object.entries(goals).forEach(([key, value]) => {
    if (!Number.isFinite(Number(value)) || Number(value) < 0) errors.push(`${key.replace('_', ' ')} cannot be negative.`);
  });
  if (errors.length) throw new AppError('Please correct the user details.', 400, errors);

  const [result] = await pool.execute(
    `UPDATE users SET fullname = ?, email = ?, status = ?, allocation = ?, calories_goal = ?,
                      protein_goal = ?, carbs_goal = ?, fat_goal = ? WHERE id = ?`,
    [fullname.trim(), email.trim().toLowerCase(), status, allocation.trim(), calories_goal, protein_goal, carbs_goal, fat_goal, req.params.id]
  );
  if (!result.affectedRows) throw new AppError('User not found.', 404);
  const [rows] = await pool.execute(
    `SELECT id, fullname, username, email, joined, status, allocation, calories_goal,
            protein_goal, carbs_goal, fat_goal, created_at, updated_at FROM users WHERE id = ?`,
    [req.params.id]
  );
  res.json({ success: true, message: 'User updated successfully.', data: rows[0] });
});

const listMeals = asyncHandler(async (req, res) => {
  const { page, limit, offset } = pageValues(req.query);
  const search = String(req.query.search || '').trim();
  const date = String(req.query.date || '').trim();
  const mealType = String(req.query.meal_type || '').trim();
  const conditions = [];
  const values = [];
  if (search) {
    conditions.push('(m.food_name LIKE ? OR u.fullname LIKE ? OR u.username LIKE ?)');
    values.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (date) {
    assertDate(date);
    conditions.push('DATE(m.occurred_at) = ?');
    values.push(date);
  }
  if (mealType) {
    if (!MEAL_TYPES.includes(mealType)) throw new AppError('Invalid meal type filter.', 400);
    conditions.push('m.meal_type = ?');
    values.push(mealType);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [[count]] = await pool.execute(`SELECT COUNT(*) AS total FROM meals m JOIN users u ON u.id = m.user_id ${where}`, values);
  const [rows] = await pool.execute(
    `SELECT m.id, m.food_name, m.quantity, m.unit, m.meal_type, m.calories, m.protein,
            m.carbs, m.fat, m.occurred_at, u.id AS user_id, u.fullname, u.username
       FROM meals m JOIN users u ON u.id = m.user_id
       ${where} ORDER BY m.occurred_at DESC, m.id DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  res.json({ success: true, data: rows, pagination: pagination(page, limit, count.total) });
});

module.exports = { stats, listUsers, getUser, updateUser, listMeals };
