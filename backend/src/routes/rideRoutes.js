const express = require('express');
const {
    createRide,
    getDriverRides,
    getPassengerRides,
    getMyHistory,
    getRideById,
    joinRide,
    leaveRide,
    cancelRide,
    getRidePassengers,
    getPassengerDetails,
    updateRide,
    getUserPublicRides
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

// GET /api/rides/user/:userId - Get specific user's ride history
router.get('/user/:userId', getUserPublicRides);

// GET /api/rides/:id/passengers - Get passengers list (creator only)
router.get('/:id/passengers', getRidePassengers);

// GET /api/rides/:id/passengers/:passengerId - Get passenger details (creator only)
router.get('/:id/passengers/:passengerId', getPassengerDetails);

// GET /api/rides/:id - Get ride details by ID
router.get('/:id', getRideById);

// POST /api/rides/:id/join - Join a specific ride
router.post('/:id/join', joinRide);

// POST /api/rides/:id/leave - Leave a specific ride (Cancel booking)
router.post('/:id/leave', leaveRide);

// PATCH /api/rides/:id - Update a ride demand (Creator only)
router.patch('/:id', updateRide);

// PUT /api/rides/:id/cancel - Cancel a ride (Creator only - Soft Delete)
router.put('/:id/cancel', cancelRide);

module.exports = router;


