const express = require('express');
const requireUser = require('../middleware/authMiddleware');
const { reports } = require('../controllers/reportController');

const router = express.Router();
router.get('/', requireUser, reports);

module.exports = router;

