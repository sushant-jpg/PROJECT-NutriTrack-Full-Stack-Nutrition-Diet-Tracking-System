const AppError = require('../utils/AppError');
const { normalizeDateTime } = require('../utils/date');

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function validateSignup(req, _res, next) {
  const { fullname, username, email, password, confirmPassword } = req.body;
  const errors = [];
  if (!fullname || fullname.trim().length < 2 || fullname.trim().length > 120) errors.push('Full name must be between 2 and 120 characters.');
  if (!USERNAME_PATTERN.test(username || '')) errors.push('Username must be 3-30 characters and contain only letters, numbers, or underscores.');
  if (!EMAIL_PATTERN.test(email || '')) errors.push('Please provide a valid email address.');
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters.');
  if (password !== confirmPassword) errors.push('Passwords do not match.');
  if (errors.length) return next(new AppError('Please correct the highlighted signup fields.', 400, errors));
  req.body.fullname = fullname.trim();
  req.body.username = username.trim();
  req.body.email = email.trim().toLowerCase();
  next();
}

function validateMeal(req, _res, next) {
  const meal = req.body;
  const errors = [];
  if (!meal.food_name || !meal.food_name.trim() || meal.food_name.trim().length > 160) errors.push('Food name is required and must be 160 characters or fewer.');
  if (!Number.isFinite(Number(meal.quantity)) || Number(meal.quantity) <= 0) errors.push('Quantity must be greater than zero.');
  if (!meal.unit || !meal.unit.trim() || meal.unit.trim().length > 40) errors.push('Unit is required and must be 40 characters or fewer.');
  if (!MEAL_TYPES.includes(meal.meal_type)) errors.push('Meal type must be Breakfast, Lunch, Dinner, or Snack.');
  for (const field of ['calories', 'protein', 'carbs', 'fat']) {
    if (!Number.isFinite(Number(meal[field])) || Number(meal[field]) < 0) errors.push(`${field[0].toUpperCase() + field.slice(1)} cannot be negative.`);
  }
  try {
    meal.occurred_at = normalizeDateTime(meal.occurred_at);
  } catch (error) {
    errors.push(error.message);
  }
  if (errors.length) return next(new AppError('Please correct the meal details.', 400, errors));
  meal.food_name = meal.food_name.trim();
  meal.unit = meal.unit.trim();
  next();
}

module.exports = { validateSignup, validateMeal, EMAIL_PATTERN, MEAL_TYPES };

