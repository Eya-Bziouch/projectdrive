const Ride = require('../models/Ride');

/**
 * Authorization middleware: Ensure user is a driver
 * User must have both driverLicense and vehicleMatricule
 * 
 * @security Only drivers can access certain endpoints
 */
const requireDriver = async (req, res, next) => {
    try {
        const user = req.user; // Set by authenticate middleware

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user has driver credentials
        if (!user.driverLicense || !user.vehicleMatricule) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Driver license and vehicle required.'
            });
        }

        next();
    } catch (error) {
        console.error('Authorization error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization check failed',
            error: error.message
        });
    }
};

/**
 * Authorization middleware: Ensure user owns the ride
 * Dynamically checks if req.user._id matches the ride creator
 * 
 * @param {string} rideIdParam - Name of route param containing ride ID (default: 'id')
 * @security Only ride creators can access certain ride data
 */
const requireRideOwner = (rideIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            const userId = req.user._id;
            const rideId = req.params[rideIdParam];

            if (!rideId) {
                return res.status(400).json({
                    success: false,
                    message: `Missing ride ID parameter: ${rideIdParam}`
                });
            }

            // Fetch the ride
            const ride = await Ride.findById(rideId);

            if (!ride) {
                return res.status(404).json({
                    success: false,
                    message: 'Ride not found'
                });
            }

            // Check if user is the creator
            if (ride.creator.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Only the ride creator can perform this action.'
                });
            }

            // Attach ride to request for reuse in controller
            req.ride = ride;

            next();
        } catch (error) {
            console.error('Ride ownership authorization error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization check failed',
                error: error.message
            });
        }
    };
};

/**
 * Authorization middleware: Ensure ride is a DRIVER type
 * Requirements:
 * - Ride must exist
 * - Ride type must be 'DRIVER'
 * 
 * @security Only driver rides can have passenger viewing
 */
const requireDriverRide = (rideIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            const rideId = req.params[rideIdParam];

            // Use ride from previous middleware if available
            let ride = req.ride;

            if (!ride) {
                ride = await Ride.findById(rideId);
            }

            if (!ride) {
                return res.status(404).json({
                    success: false,
                    message: 'Ride not found'
                });
            }

            if (ride.type !== 'DRIVER') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. This feature is only available for driver rides.'
                });
            }

            // Attach ride to request
            req.ride = ride;

            next();
        } catch (error) {
            console.error('Driver ride authorization error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization check failed',
                error: error.message
            });
        }
    };
};

module.exports = {
    requireDriver,
    requireRideOwner,
    requireDriverRide
};
