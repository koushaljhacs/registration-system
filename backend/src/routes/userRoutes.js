const express = require('express');
const UserController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get user profile
router.get('/profile', UserController.getProfile);

// Get dashboard data
router.get('/dashboard', UserController.getDashboard);

module.exports = router;