const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', authController.signup);   // Fixed: signup instead of register
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);

// Optional: update profile route (you have updateProfile in controller)
router.put('/profile', authenticateToken, authController.updateProfile);

// Session management
router.get('/sessions', authenticateToken, authController.listSessions);
router.post('/logout', authenticateToken, authController.logoutCurrent);
router.delete('/sessions/:sessionId', authenticateToken, authController.logout);

module.exports = router;
