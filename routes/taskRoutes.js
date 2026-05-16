const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  hireTask,
  rateTask,
} = require('../controllers/taskController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getAllTasks);
router.post('/', requireAuth, createTask);
router.put('/:id', requireAuth, updateTask);
router.delete('/:id', requireAuth, deleteTask);
router.post('/:id/hire', requireAuth, hireTask);
router.post('/:id/rate', requireAuth, rateTask);

module.exports = router;
