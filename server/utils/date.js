const AppError = require('./AppError');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?$/;

function isValidDateString(value) {
  if (!DATE_PATTERN.test(String(value || ''))) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function assertDate(value) {
  if (!isValidDateString(value)) throw new AppError('Please provide a valid date in YYYY-MM-DD format.', 400);
  return value;
}

function normalizeDateTime(value) {
  if (!DATETIME_PATTERN.test(String(value || ''))) {
    throw new AppError('Please provide a valid meal date and time.', 400);
  }
  const normalized = value.replace('T', ' ');
  const withSeconds = normalized.length === 16 ? `${normalized}:00` : normalized;
  const [date, time] = withSeconds.split(' ');
  assertDate(date);
  const [hours, minutes, seconds] = time.split(':').map(Number);
  if (hours > 23 || minutes > 59 || seconds > 59) throw new AppError('Please provide a valid meal date and time.', 400);
  return withSeconds;
}

function addDays(dateString, amount) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return date.toISOString().slice(0, 10);
}

function mondayOf(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = date.getUTCDay();
  return addDays(dateString, dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
}

function monthBounds(dateString) {
  const [year, month] = dateString.split('-').map(Number);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const next = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  return { start, endExclusive: next };
}

module.exports = { assertDate, normalizeDateTime, addDays, mondayOf, monthBounds };

