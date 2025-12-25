const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// GET /api/users/me - Get logged-in user profile
router.get('/me', authenticate, getProfile);

// PUT /api/users/me - Update logged-in user profile
router.put('/me', authenticate, updateProfile);

module.exports = router;
