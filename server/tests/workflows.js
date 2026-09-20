// Exercises the running API and verifies writes directly in MySQL.
// Only this run's uniquely named fixture users/meals are removed in finally.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { pool } = require('../config/db');
const base = process.env.TEST_API_URL || 'http://localhost:5000/api';
const suffix = randomBytes(6).toString('hex');
const password = randomBytes(24).toString('base64url');
const fixtureIds = [];
const prefix = `verify_${suffix}`;
const user = { cookie: '' }, other = { cookie: '' }, admin = { cookie: '' };

function noSecrets(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    assert(!/password|password_hash|jwt_secret|db_password/i.test(key), `Sensitive field returned: ${key}`);
    noSecrets(item);
  }
}

async function request(jar, method, path, body, expected = 200) {
  const response = await fetch(`${base}${path}`, {
    method, headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173', ...(jar.cookie ? { Cookie: jar.cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  assert.match(response.headers.get('content-type') || '', /application\/json/);
  const data = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
  noSecrets(data);
  const cookie = response.headers.get('set-cookie');
  if (cookie) jar.cookie = cookie.split(';')[0];
  return { response, data, cookie };
}

async function main() {
  try {
    const health = await request(user, 'GET', '/health');
    assert.equal(health.response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.equal(health.response.headers.get('access-control-allow-credentials'), 'true');
    await request(user, 'GET', '/meals?date=2026-09-19', undefined, 401);
    for (const [index, jar] of [user, other].entries()) {
      const result = await request(jar, 'POST', '/auth/signup', {
        fullname: `Verification User ${index}`, username: `${prefix}_${index}`,
        email: `${prefix}_${index}@example.invalid`, password, confirmPassword: password
      }, 201);
      fixtureIds.push(result.data.data.user.id);
      assert.match(result.cookie, /HttpOnly/i);
      assert.match(result.cookie, /SameSite=Lax/i);
    }
    const [[stored]] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [fixtureIds[0]]);
    assert.match(stored.password_hash, /^\$2[aby]\$12\$/);
    await request(user, 'POST', '/auth/logout');
    await request(user, 'POST', '/auth/login', { identifier: `${prefix}_0`, password });
    await request(user, 'GET', '/auth/me');
    await request(user, 'GET', '/admin/stats', undefined, 403);
    console.log('PASS signup, login, bcrypt, HttpOnly cookie, CORS, role protection');

    const meal = { food_name: 'Verification breakfast', quantity: 2, unit: 'plates', meal_type: 'Breakfast',
      occurred_at: '2026-09-19T08:30', calories: 500, protein: 25, carbs: 60, fat: 15 };
    const added = await request(user, 'POST', '/meals', meal, 201);
    const mealId = added.data.data.id;
    let [[persisted]] = await pool.execute('SELECT * FROM meals WHERE id = ?', [mealId]);
    assert.equal(persisted.food_name, meal.food_name);
    assert.equal(persisted.calories, 500, 'Quantity must not multiply nutrients');
    for (const method of ['GET', 'PUT', 'DELETE']) {
      await request(other, method, `/meals/${mealId}`, method === 'PUT' ? meal : undefined, 404);
    }
    await request(user, 'POST', '/meals', { ...meal, calories: -1 }, 400);
    await request(user, 'POST', '/meals', { ...meal, occurred_at: '2026-02-30T08:00' }, 400);
    await request(user, 'PUT', `/meals/${mealId}`, { ...meal, food_name: 'Updated breakfast', calories: 650 });
    [[persisted]] = await pool.execute('SELECT * FROM meals WHERE id = ?', [mealId]);
    assert.equal(persisted.food_name, 'Updated breakfast'); assert.equal(persisted.calories, 650);
    const history = await request(user, 'GET', '/meals?date=2026-09-19&page=1&limit=1');
    assert.equal(history.data.pagination.total, 1);
    const daily = await request(user, 'GET', '/reports?date=2026-09-19&period=daily');
    assert.equal(daily.data.data.totals.calories, 650);
    const weekly = await request(user, 'GET', '/reports?date=2026-09-19&period=weekly');
    assert.equal(weekly.data.data.start, '2026-09-14'); assert.equal(weekly.data.data.series.length, 7);
    assert.equal(weekly.data.data.series.filter((day) => day.meals === 0).length, 6);
    const monthly = await request(user, 'GET', '/reports?date=2026-09-19&period=monthly');
    assert.equal(monthly.data.data.series.length, 30); assert.equal(monthly.data.data.totals.calories, 650);
    console.log('PASS persisted INSERT/SELECT/UPDATE, ownership, validation, pagination, all report periods');

    await request(admin, 'POST', '/auth/admin-login', { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_INITIAL_PASSWORD });
    await request(admin, 'GET', '/admin/stats');
    await request(admin, 'GET', '/meals?date=2026-09-19', undefined, 403);
    const users = await request(admin, 'GET', `/admin/users?search=${prefix}`);
    assert.equal(users.data.pagination.total, 2);
    const activity = await request(admin, 'GET', `/admin/meals?search=${prefix}&date=2026-09-19&meal_type=Breakfast`);
    assert.equal(activity.data.pagination.total, 1);
    const details = await request(admin, 'GET', `/admin/users/${fixtureIds[0]}`);
    const updatedUser = { ...details.data.data, calories_goal: 2200, protein_goal: 100, status: 'Inactive' };
    await request(admin, 'PUT', `/admin/users/${fixtureIds[0]}`, updatedUser);
    const [[savedUser]] = await pool.execute('SELECT status, calories_goal FROM users WHERE id = ?', [fixtureIds[0]]);
    assert.equal(savedUser.status, 'Inactive'); assert.equal(savedUser.calories_goal, 2200);
    await request(user, 'GET', '/auth/me', undefined, 403);
    await request(user, 'POST', '/auth/login', { identifier: `${prefix}_0`, password }, 403);
    await request(admin, 'PUT', `/admin/users/${fixtureIds[0]}`, { ...updatedUser, status: 'Active' });
    await request(user, 'POST', '/auth/login', { identifier: `${prefix}_0@example.invalid`, password });
    const me = await request(user, 'GET', '/auth/me');
    assert.equal(me.data.data.user.calories_goal, 2200);
    console.log('PASS admin login, stats, search, activity, goal update, deactivation and reactivation');

    await request(user, 'DELETE', `/meals/${mealId}`);
    const [[deleted]] = await pool.execute('SELECT COUNT(*) AS total FROM meals WHERE id = ?', [mealId]);
    assert.equal(deleted.total, 0);
    const empty = await request(user, 'GET', '/reports?date=2026-09-19&period=daily');
    assert.equal(empty.data.data.totals.calories, 0);
    const previousCookie = user.cookie;
    await request(user, 'POST', '/auth/logout');
    await request(user, 'GET', '/auth/me', undefined, 401);
    await request({ cookie: previousCookie }, 'GET', '/auth/me', undefined, 401);
    await request(admin, 'POST', '/auth/logout');
    await request(admin, 'GET', '/admin/stats', undefined, 401);
    await request(user, 'GET', '/unknown', undefined, 404);
    console.log('PASS persisted DELETE, empty totals, logout invalidation, JSON errors');
  } finally {
    for (const id of fixtureIds) {
      await pool.execute("DELETE FROM sessions WHERE principal_id = ? AND role = 'user'", [id]);
      await pool.execute('DELETE FROM users WHERE id = ? AND username LIKE ?', [id, `${prefix}%`]);
    }
    await pool.end();
    console.log('Removed only this run\'s fixture users and their meals.');
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
