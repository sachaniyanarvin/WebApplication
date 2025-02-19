const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.post('/generate-qrcode', protect, authController.generateQRCode);
router.post('/verify-qrcode', protect, authController.verifyQRCode);
router.post('/disconnect', protect, authController.disconnectSession);

module.exports = router;