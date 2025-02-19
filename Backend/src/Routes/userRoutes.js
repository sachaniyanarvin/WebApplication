const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes need authentication
router.use(protect);

router.put('/notification-settings', userController.updateNotificationSettings);
router.get('/devices', userController.getUserDevices);
router.delete('/devices/:deviceId', userController.deleteDevice);
router.put('/devices/:deviceId', userController.updateDeviceName);
router.get('/sessions', userController.getActiveSessions);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

module.exports = router;