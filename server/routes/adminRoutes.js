const express = require('express');
const requireAdmin = require('../middleware/adminMiddleware');
const controller = require('../controllers/adminController');

const router = express.Router();
router.use(requireAdmin);
router.get('/stats', controller.stats);
router.get('/users', controller.listUsers);
router.get('/users/:id', controller.getUser);
router.put('/users/:id', controller.updateUser);
router.get('/meals', controller.listMeals);

module.exports = router;

