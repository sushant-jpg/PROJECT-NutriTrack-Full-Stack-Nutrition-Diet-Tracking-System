const { pool } = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { assertDate } = require('../utils/date');

function pagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, offset: (page - 1) * limit };
}

const listMeals = asyncHandler(async (req, res) => {
  const date = assertDate(req.query.date);
  const { page, limit, offset } = pagination(req.query);
  const [[count]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM meals WHERE user_id = ? AND DATE(occurred_at) = ?',
    [req.user.id, date]
  );
  const [rows] = await pool.execute(
    `SELECT id, food_name, quantity, unit, meal_type, calories, protein, carbs, fat,
            occurred_at, created_at, updated_at
       FROM meals
      WHERE user_id = ? AND DATE(occurred_at) = ?
      ORDER BY occurred_at DESC, id DESC
      LIMIT ? OFFSET ?`,
    [req.user.id, date, limit, offset]
  );
  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) }
  });
});

const getMeal = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT id, food_name, quantity, unit, meal_type, calories, protein, carbs, fat,
            occurred_at, created_at, updated_at
       FROM meals WHERE id = ? AND user_id = ? LIMIT 1`,
    [req.params.id, req.user.id]
  );
  if (!rows[0]) throw new AppError('Meal not found.', 404);
  res.json({ success: true, data: rows[0] });
});

const createMeal = asyncHandler(async (req, res) => {
  const meal = req.body;
  const [result] = await pool.execute(
    `INSERT INTO meals
      (user_id, food_name, quantity, unit, meal_type, calories, protein, carbs, fat, occurred_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, meal.food_name, meal.quantity, meal.unit, meal.meal_type, meal.calories, meal.protein, meal.carbs, meal.fat, meal.occurred_at]
  );
  const [rows] = await pool.execute(
    `SELECT id, food_name, quantity, unit, meal_type, calories, protein, carbs, fat,
            occurred_at, created_at, updated_at FROM meals WHERE id = ?`,
    [result.insertId]
  );
  res.status(201).json({ success: true, message: 'Meal added.', data: rows[0] });
});

const updateMeal = asyncHandler(async (req, res) => {
  const meal = req.body;
  const [result] = await pool.execute(
    `UPDATE meals
        SET food_name = ?, quantity = ?, unit = ?, meal_type = ?, calories = ?,
            protein = ?, carbs = ?, fat = ?, occurred_at = ?
      WHERE id = ? AND user_id = ?`,
    [meal.food_name, meal.quantity, meal.unit, meal.meal_type, meal.calories, meal.protein, meal.carbs, meal.fat, meal.occurred_at, req.params.id, req.user.id]
  );
  if (!result.affectedRows) throw new AppError('Meal not found.', 404);
  const [rows] = await pool.execute(
    `SELECT id, food_name, quantity, unit, meal_type, calories, protein, carbs, fat,
            occurred_at, created_at, updated_at FROM meals WHERE id = ? AND user_id = ?`,
    [req.params.id, req.user.id]
  );
  res.json({ success: true, message: 'Meal updated.', data: rows[0] });
});

const deleteMeal = asyncHandler(async (req, res) => {
  const [result] = await pool.execute('DELETE FROM meals WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!result.affectedRows) throw new AppError('Meal not found.', 404);
  res.json({ success: true, message: 'Meal deleted.' });
});

module.exports = { listMeals, getMeal, createMeal, updateMeal, deleteMeal };

