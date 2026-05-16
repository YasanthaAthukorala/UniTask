const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markRead,
  markAllRead,
} = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getNotifications);
router.patch('/read-all', requireAuth, markAllRead);
router.patch('/:id/read', requireAuth, markRead);

module.exports = router;
