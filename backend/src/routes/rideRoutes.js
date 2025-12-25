const express = require('express');
const {
    createRide,
    getDriverRides,
    getPassengerRides,
    getMyHistory
} = require('../controllers/rideController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// All routes are protected by authentication middleware
router.use(authenticate);

// POST /api/rides - Create a new ride
router.post('/', createRide);

// GET /api/rides/driver - Get all DRIVER rides (announced trajets)
router.get('/driver', getDriverRides);

// GET /api/rides/passenger - Get all PASSENGER rides (demandes trajets)
router.get('/passenger', getPassengerRides);

// GET /api/rides/history - Get logged-in user's ride history
router.get('/history', getMyHistory);

module.exports = router;
