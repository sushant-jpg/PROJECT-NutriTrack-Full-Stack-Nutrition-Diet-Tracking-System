const { pool } = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { assertDate, addDays, mondayOf, monthBounds } = require('../utils/date');

const emptyTotals = () => ({ calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 });
const normalizeTotals = (row = {}) => ({
  calories: Number(row.calories || 0),
  protein: Number(row.protein || 0),
  carbs: Number(row.carbs || 0),
  fat: Number(row.fat || 0),
  meals: Number(row.meals || 0)
});

async function totalBetween(userId, start, endExclusive) {
  const [rows] = await pool.execute(
    `SELECT COALESCE(SUM(calories), 0) AS calories, COALESCE(SUM(protein), 0) AS protein,
            COALESCE(SUM(carbs), 0) AS carbs, COALESCE(SUM(fat), 0) AS fat,
            COUNT(*) AS meals
       FROM meals WHERE user_id = ? AND occurred_at >= ? AND occurred_at < ?`,
    [userId, `${start} 00:00:00`, `${endExclusive} 00:00:00`]
  );
  return normalizeTotals(rows[0]);
}

const reports = asyncHandler(async (req, res) => {
  const date = assertDate(req.query.date);
  const period = req.query.period || 'daily';
  if (!['daily', 'weekly', 'monthly'].includes(period)) throw new AppError('Period must be daily, weekly, or monthly.', 400);

  if (period === 'daily') {
    const end = addDays(date, 1);
    const totals = await totalBetween(req.user.id, date, end);
    const [breakdown] = await pool.execute(
      `SELECT meal_type, COALESCE(SUM(calories), 0) AS calories,
              COALESCE(SUM(protein), 0) AS protein, COALESCE(SUM(carbs), 0) AS carbs,
              COALESCE(SUM(fat), 0) AS fat, COUNT(*) AS meals
         FROM meals
        WHERE user_id = ? AND occurred_at >= ? AND occurred_at < ?
        GROUP BY meal_type ORDER BY FIELD(meal_type, 'Breakfast', 'Lunch', 'Dinner', 'Snack')`,
      [req.user.id, `${date} 00:00:00`, `${end} 00:00:00`]
    );
    return res.json({ success: true, data: { period, start: date, end: date, totals, breakdown: breakdown.map((row) => ({ ...row, ...normalizeTotals(row) })) } });
  }

  const bounds = period === 'weekly'
    ? { start: mondayOf(date), endExclusive: addDays(mondayOf(date), 7) }
    : monthBounds(date);
  const [rows] = await pool.execute(
    `SELECT DATE_FORMAT(occurred_at, '%Y-%m-%d') AS date,
            COALESCE(SUM(calories), 0) AS calories, COALESCE(SUM(protein), 0) AS protein,
            COALESCE(SUM(carbs), 0) AS carbs, COALESCE(SUM(fat), 0) AS fat, COUNT(*) AS meals
       FROM meals
      WHERE user_id = ? AND occurred_at >= ? AND occurred_at < ?
      GROUP BY DATE(occurred_at) ORDER BY DATE(occurred_at)`,
    [req.user.id, `${bounds.start} 00:00:00`, `${bounds.endExclusive} 00:00:00`]
  );
  const byDate = new Map(rows.map((row) => [row.date, normalizeTotals(row)]));
  const series = [];
  for (let cursor = bounds.start; cursor < bounds.endExclusive; cursor = addDays(cursor, 1)) {
    series.push({ date: cursor, ...(byDate.get(cursor) || emptyTotals()) });
  }
  const totals = await totalBetween(req.user.id, bounds.start, bounds.endExclusive);
  res.json({
    success: true,
    data: { period, start: bounds.start, end: addDays(bounds.endExclusive, -1), totals, series }
  });
});

module.exports = { reports };

