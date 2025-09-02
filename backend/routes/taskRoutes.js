const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const taskController = require('../controllers/taskController');

router.use(requireAuth);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.patch('/:id/reminder', taskController.toggleReminder);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
