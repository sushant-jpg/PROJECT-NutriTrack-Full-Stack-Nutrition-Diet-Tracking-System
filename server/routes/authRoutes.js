const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/authController');
const requireUser = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');
const { validateSignup } = require('../middleware/validationMiddleware');

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' }
});

router.post('/signup', authLimiter, validateSignup, controller.signup);
router.post('/login', authLimiter, controller.login);
router.post('/admin-login', authLimiter, controller.adminLogin);
router.post('/logout', controller.logout);
router.get('/me', requireUser, controller.me);
router.get('/admin-me', requireAdmin, controller.adminMe);

module.exports = router;

