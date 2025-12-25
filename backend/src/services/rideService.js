const Ride = require('../models/Ride');
const User = require('../models/User');

/**
 * Create a new ride with validation
 * @param {Object} rideData - Ride information
 * @param {string} userId - ID of the user creating the ride
 * @returns {Promise<Object>} Created ride
 * @throws {Error} If validation fails
 */
const createRide = async (rideData, userId) => {
    const {
        type,
        departure,
        destination,
        date,
        time,
        availableSeats,
        price,
        description
    } = rideData;

    // Validate required fields
    if (!type || !departure || !destination || !date || !time || !availableSeats) {
        throw new Error('Missing required fields: type, departure, destination, date, time, availableSeats');
    }

    // Get user to check if they can create DRIVER ride
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Check if user can create DRIVER ride
    if (type === 'DRIVER') {
        // User must have both driverLicense and vehicleMatricule to be a driver
        if (!user.isDriver) {
            throw new Error('You must have a driver license and vehicle matricule to create a DRIVER ride');
        }

        // Price is required for DRIVER rides
        if (price === undefined || price === null) {
            throw new Error('Price is required for DRIVER rides');
        }
    }

    // PASSENGER rides don't need any special validation
    // Anyone can create a PASSENGER ride

    // Create the ride
    const ride = await Ride.create({
        creator: userId,
        type,
        departure,
        destination,
        date,
        time,
        availableSeats,
        price: type === 'DRIVER' ? price : undefined,
        description: description || ''
    });

    // Populate creator information (excluding password)
    await ride.populate('creator', '-password');

    return ride;
};

/**
 * Get all rides with optional filters
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} List of rides
 */
const getRides = async (filters = {}) => {
    const query = {};

    // Apply filters
    if (filters.type) {
        query.type = filters.type;
    }

    if (filters.departure) {
        query.departure = new RegExp(filters.departure, 'i'); // Case-insensitive search
    }

    if (filters.destination) {
        query.destination = new RegExp(filters.destination, 'i');
    }

    if (filters.date) {
        // Filter by date (assuming date is provided as YYYY-MM-DD)
        const startOfDay = new Date(filters.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.date);
        endOfDay.setHours(23, 59, 59, 999);

        query.date = {
            $gte: startOfDay,
            $lte: endOfDay
        };
    }

    const rides = await Ride.find(query)
        .populate('creator', '-password')
        .sort({ createdAt: -1 }); // Most recent first

    return rides;
};

/**
 * Get a single ride by ID
 * @param {string} rideId - Ride ID
 * @returns {Promise<Object>} Ride details
 */
const getRideById = async (rideId) => {
    const ride = await Ride.findById(rideId).populate('creator', '-password');

    if (!ride) {
        throw new Error('Ride not found');
    }

    return ride;
};

/**
 * Get rides created by a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of user's rides
 */
const getUserRides = async (userId) => {
    const rides = await Ride.find({ creator: userId })
        .populate('creator', '-password')
        .sort({ createdAt: -1 });

    return rides;
};

module.exports = {
    createRide,
    getRides,
    getRideById,
    getUserRides
};
