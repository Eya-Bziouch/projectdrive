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
        neededSeats,
        price,
        description
    } = rideData;

    // Validate common required fields
    if (!type || !departure || !destination || !date || !time) {
        throw new Error('Missing required fields: type, departure, destination, date, time');
    }

    // Conditional seat validation based on type
    if (type === 'DRIVER' && (availableSeats === undefined || availableSeats === null)) {
        throw new Error('Missing required field: availableSeats for DRIVER ride');
    }

    if (type === 'PASSENGER' && (neededSeats === undefined || neededSeats === null)) {
        throw new Error('Missing required field: neededSeats for PASSENGER ride');
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
        // Conditionally set seat fields
        availableSeats: type === 'DRIVER' ? availableSeats : undefined,
        neededSeats: type === 'PASSENGER' ? neededSeats : undefined,
        originalSeats: type === 'DRIVER' ? availableSeats : undefined, // Track originally offered seats for drivers
        price: type === 'DRIVER' ? price : undefined,
        description: description || '',
        passengers: [] // Initialize with empty passengers array
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
    const ride = await Ride.findById(rideId)
        .populate('creator', '-password')
        .populate('passengers', '-password'); // Also populate passengers

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

/**
 * Join a ride - Add user to passengers array and decrement seats
 * @param {string} rideId - Ride ID to join
 * @param {string} userId - ID of the user joining
 * @returns {Promise<Object>} Updated ride details
 * @throws {Error} If validation fails
 */
const joinRideService = async (rideId, userId) => {
    // Find the ride and populate creator
    const ride = await Ride.findById(rideId).populate('creator', '-password');

    if (!ride) {
        throw new Error('Ride not found');
    }

    // Validation 1: User cannot join their own ride
    if (ride.creator._id.toString() === userId.toString()) {
        throw new Error('You cannot join your own ride');
    }

    // Validation 2: User cannot join the same ride twice
    // Note: This only checks THIS specific ride. Users CAN join multiple rides from the same driver.
    if (ride.hasPassenger(userId)) {
        throw new Error('You have already joined this specific ride');
    }

    // Validation 3: Check if seats are available
    if (!ride.canJoin()) {
        throw new Error('No available seats for this ride');
    }

    // Add user to passengers array
    ride.passengers.push(userId);

    // Decrement available seats
    ride.availableSeats -= 1;

    // Save the updated ride
    await ride.save();

    // Populate passengers for the response
    await ride.populate('passengers', '-password');

    return ride;
};

/**
 * Leave a ride (Cancel Booking)
 * @param {string} rideId - Ride ID to leave
 * @param {string} userId - ID of the user leaving
 * @returns {Promise<Object>} Updated ride details
 */
const leaveRideService = async (rideId, userId) => {
    const ride = await Ride.findById(rideId);

    if (!ride) {
        throw new Error('Ride not found');
    }

    // Validation: Ride must be active
    if (ride.status !== 'active') {
        throw new Error('Cannot leave a ride that is not active');
    }

    // Validation: Date must not be passed
    const now = new Date();
    const rideDate = new Date(ride.date);
    if (ride.time) {
        const [hours, minutes] = ride.time.split(':').map(Number);
        rideDate.setHours(hours || 0, minutes || 0, 0, 0);
    }

    if (now > rideDate) {
        throw new Error('Cannot leave a past ride');
    }

    // Validation: User must be in passengers list
    // Use hardened check manually first
    const passengerIndex = ride.passengers.findIndex(p =>
        (p._id || p).toString() === userId.toString()
    );

    if (passengerIndex === -1) {
        throw new Error('User is not a passenger in this ride');
    }

    // Remove user from passengers
    ride.passengers.splice(passengerIndex, 1);

    // Increment available seats, but forbid exceeding originalSeats
    // (Safety check: Double seat restoration prevention)
    if (ride.type === 'DRIVER') {
        if (ride.availableSeats < ride.originalSeats) {
            ride.availableSeats += 1;
        } else {
            // Logic error if seats are full but we are removing a passenger? 
            // Ideally availableSeats should never be >= originalSeats if we have passengers.
            // But if specific data corruption happened, we clamp it.
            ride.availableSeats = ride.originalSeats;
        }
    }

    await ride.save();

    // Notify driver (Hook placeholder)
    // sendNotification(ride.creator, "Passenger left your ride");

    return ride;
};

/**
 * Cancel a ride (Soft Delete)
 * @param {string} rideId - Ride ID to cancel
 * @param {string} userId - ID of the user cancelling (must be creator)
 * @returns {Promise<Object>} Updated ride details
 */
const cancelRideService = async (rideId, userId) => {
    const ride = await Ride.findById(rideId);

    if (!ride) {
        throw new Error('Ride not found');
    }

    // Authorization
    if (ride.creator.toString() !== userId.toString()) {
        throw new Error('Not authorized to cancel this ride');
    }

    // Idempotency: If already cancelled, just return it
    if (ride.status === 'cancelled') {
        return ride;
    }

    // Validation: Can only cancel active rides
    if (ride.status !== 'active') {
        throw new Error(`Cannot cancel a ${ride.status} ride`);
    }

    ride.status = 'cancelled';
    await ride.save();

    // Notify passengers (Hook placeholder)
    // ride.passengers.forEach(p => sendNotification(p, "Ride cancelled"));

    return ride;
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User details
 */
const getUserById = async (userId) => {
    const user = await User.findById(userId).select('-password');

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

/**
 * Get rides where the user is a passenger
 * @param {string} userId
 */
const getParticipatedRides = async (userId) => {
    // Find rides where passengers array contains userId
    const rides = await Ride.find({ passengers: userId })
        .populate('creator', '-password')
        .sort({ createdAt: -1 });
    return rides;
};

module.exports = {
    createRide,
    getRides,
    getRideById,
    getUserRides,
    joinRideService,
    leaveRideService,
    cancelRideService,
};
