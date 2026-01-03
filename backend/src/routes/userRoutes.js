const express = require('express');
const { getProfile, updateProfile, getPublicProfile } = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// GET /api/users/me - Get logged-in user profile
router.get('/me', authenticate, getProfile);

// PUT /api/users/me - Update logged-in user profile
router.put('/me', authenticate, updateProfile);

// GET /api/users/:id/profile - Get public user profile
router.get('/:id/profile', authenticate, getPublicProfile);

module.exports = router;
