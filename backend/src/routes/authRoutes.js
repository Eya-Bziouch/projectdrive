const express = require('express');
const { register, login, refreshAccessToken, logout, logoutAll } = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', register);
router.post('/signup', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/refresh - Refresh access token using refresh token
router.post('/refresh', refreshAccessToken);

// POST /api/auth/logout - Logout and invalidate refresh token
router.post('/logout', logout);

// POST /api/auth/logout-all - Logout from all devices (requires authentication)
router.post('/logout-all', authenticate, logoutAll);

module.exports = router;
