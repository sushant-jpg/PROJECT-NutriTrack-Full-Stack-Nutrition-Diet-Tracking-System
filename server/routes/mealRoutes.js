const express = require('express');
const requireUser = require('../middleware/authMiddleware');
const { validateMeal } = require('../middleware/validationMiddleware');
const controller = require('../controllers/mealController');

const router = express.Router();
router.use(requireUser);
router.get('/', controller.listMeals);
router.post('/', validateMeal, controller.createMeal);
router.get('/:id', controller.getMeal);
router.put('/:id', validateMeal, controller.updateMeal);
router.delete('/:id', controller.deleteMeal);

module.exports = router;

