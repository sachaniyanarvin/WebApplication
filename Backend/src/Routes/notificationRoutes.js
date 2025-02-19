const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes need authentication
router.use(protect);

router.post('/', notificationController.createNotification);
router.get('/', notificationController.getNotifications);
router.get('/stats', notificationController.getNotificationStats);
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;