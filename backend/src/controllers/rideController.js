const rideService = require('../services/rideService');

/**
 * Create a new ride
 * @route POST /api/rides
 * @access Private (requires authentication)
 */
const createRide = async (req, res) => {
    try {
        const userId = req.user._id;
        const rideData = req.body;

        const ride = await rideService.createRide(rideData, userId);

        res.status(201).json({
            success: true,
            message: 'Ride created successfully',
            ride
        });
    } catch (error) {
        console.error('Create ride error:', error);

        // Handle validation errors with 400 status
        if (error.message.includes('required') ||
            error.message.includes('must have') ||
            error.message.includes('Missing')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating ride',
            error: error.message
        });
    }
};

/**
 * Get all DRIVER rides (announced trajets)
 * @route GET /api/rides/driver
 * @access Public
 */
const getDriverRides = async (req, res) => {
    try {
        const { departure, destination, date } = req.query;

        const filters = {
            type: 'DRIVER',
            ...(departure && { departure }),
            ...(destination && { destination }),
            ...(date && { date })
        };

        const rides = await rideService.getRides(filters);

        res.status(200).json({
            success: true,
            count: rides.length,
            rides
        });
    } catch (error) {
        console.error('Get driver rides error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching driver rides',
            error: error.message
        });
    }
};

/**
 * Get all PASSENGER rides (demandes trajets)
 * @route GET /api/rides/passenger
 * @access Public
 */
const getPassengerRides = async (req, res) => {
    try {
        const { departure, destination, date } = req.query;

        const filters = {
            type: 'PASSENGER',
            ...(departure && { departure }),
            ...(destination && { destination }),
            ...(date && { date })
        };

        const rides = await rideService.getRides(filters);

        res.status(200).json({
            success: true,
            count: rides.length,
            rides
        });
    } catch (error) {
        console.error('Get passenger rides error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching passenger rides',
            error: error.message
        });
    }
};

/**
 * Get logged-in user's ride history (rides hosted & joined)
 * @route GET /api/rides/my-history
 * @access Private (requires authentication)
 */
const getMyHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get all rides created by the user
        const myRides = await rideService.getUserRides(userId);

        // Separate into hosted (DRIVER) and joined (PASSENGER)
        const hosted = myRides.filter(ride => ride.type === 'DRIVER');
        const joined = myRides.filter(ride => ride.type === 'PASSENGER');

        res.status(200).json({
            success: true,
            history: {
                hosted: {
                    count: hosted.length,
                    rides: hosted
                },
                joined: {
                    count: joined.length,
                    rides: joined
                },
                total: myRides.length
            }
        });
    } catch (error) {
        console.error('Get my history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching ride history',
            error: error.message
        });
    }
};

module.exports = {
    createRide,
    getDriverRides,
    getPassengerRides,
    getMyHistory
};
