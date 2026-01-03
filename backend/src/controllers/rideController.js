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
            status: 'active',
            ...(departure && { departure }),
            ...(destination && { destination }),
            ...(date && { date })
        };

        const rides = await rideService.getRides(filters);

        // Auto-expire old rides with no bookings before returning
        const now = new Date();
        for (const ride of rides) {
            if (ride.status === 'active' && ride.passengers.length === 0) {
                const rideDateTime = new Date(ride.date);
                if (ride.time) {
                    const [hours, minutes] = ride.time.split(':').map(Number);
                    rideDateTime.setHours(hours || 0, minutes || 0, 0);
                }
                if (now > rideDateTime) {
                    ride.status = 'expired';
                    await ride.save();
                }
            }
        }

        // Filter to only return active rides
        const activeRides = rides.filter(r => r.status === 'active');

        res.status(200).json({
            success: true,
            count: activeRides.length,
            rides: activeRides
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
            status: 'active',
            ...(departure && { departure }),
            ...(destination && { destination }),
            ...(date && { date })
        };

        const rides = await rideService.getRides(filters);

        // Auto-expire old rides with no bookings before returning
        const now = new Date();
        for (const ride of rides) {
            if (ride.status === 'active' && ride.passengers.length === 0) {
                const rideDateTime = new Date(ride.date);
                if (ride.time) {
                    const [hours, minutes] = ride.time.split(':').map(Number);
                    rideDateTime.setHours(hours || 0, minutes || 0, 0);
                }
                if (now > rideDateTime) {
                    ride.status = 'expired';
                    await ride.save();
                }
            }
        }

        // Filter to only return active rides
        const activeRides = rides.filter(r => r.status === 'active');

        res.status(200).json({
            success: true,
            count: activeRides.length,
            rides: activeRides
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

        // Get all rides created by or joined by the user
        const myRides = await rideService.getUserRides(userId);

        // Strict Filter: Only COMPLETED rides
        const completedRides = myRides.filter(ride => ride.status === 'completed');

        // Hosted: Rides I CREATED as a DRIVER and actually happened (passengers > 0)
        // (If I created a PASSENGER demand, it technically falls under 'Joined' concept for viewing)
        const hosted = completedRides.filter(ride =>
            ride.creator._id.toString() === userId.toString() &&
            ride.type === 'DRIVER' &&
            ride.passengers.length > 0
        );

        // Joined: Rides where I am a passenger (excluding ones I drove, obviously)
        // This includes Demands I created (since for Demands, creator is usually first passenger or just "the passenger")
        // OR Driver rides I joined.
        const joined = completedRides.filter(ride => {
            // Check if I am in the passengers list
            const isPassenger = ride.passengers.some(p => p._id.toString() === userId.toString());
            // Ensure I didn't drive it (just to be safe, though creator shouldn't be in passengers for Driver rides)
            const isNotDriver = ride.type !== 'DRIVER' || ride.creator._id.toString() !== userId.toString();

            return isPassenger && isNotDriver; // Or just isPassenger if we trust data model
            // Simplified: If I am in passengers list, I entered as a passenger.
            // return isPassenger; 
            // Re-reading rules: "Rides I Joined": User is in ride.passengers[]
        });

        // Let's stick to the prompt's simplicity:
        // "Rides I Joined": User is in ride.passengers[]
        const joinedStrict = completedRides.filter(ride =>
            ride.passengers.some(p => p._id.toString() === userId.toString())
        );

        res.status(200).json({
            success: true,
            history: {
                hosted: hosted,
                joined: joinedStrict,
                total: hosted.length + joinedStrict.length
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

/**
 * Get a specific user's ride history (Publicly accessible with Auth)
 * @route GET /api/rides/user/:userId
 */
const getUserPublicRides = async (req, res) => {
    try {
        const { userId } = req.params;

        // Hosted rides (Created by user)
        const allHosted = await rideService.getUserRides(userId);

        // Joined rides (Participated in)
        const allJoined = await rideService.getParticipatedRides(userId);

        // Filter to only show completed rides (consistent with my history)
        const hostedRides = allHosted.filter(r => r.status === 'completed');
        const joinedRides = allJoined.filter(r => r.status === 'completed');

        res.status(200).json({
            success: true,
            history: {
                hosted: hostedRides,
                joined: joinedRides,
                totalHosted: hostedRides.length,
                totalJoined: joinedRides.length
            }
        });
    } catch (error) {
        console.error('Get user public rides error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user rides',
            error: error.message
        });
    }
};

/**
 * Get ride by ID
 * @route GET /api/rides/:id
 * @access Private
 */
const getRideById = async (req, res) => {
    try {
        const { id } = req.params;
        const ride = await rideService.getRideById(id);

        // Auto-expire check
        if (ride.status === 'active') {
            const now = new Date();
            // Construct precise ride date/time if possible, relying on ride.date for now
            // Assuming ride.date includes time or is the primary sort key
            const rideDate = new Date(ride.date);

            // If ride uses a separate time string "HH:mm", we should combine them for accuracy
            if (ride.time) {
                const [hours, minutes] = ride.time.split(':').map(Number);
                rideDate.setHours(hours || 0, minutes || 0, 0, 0);
            }

            if (now > rideDate) {
                if (ride.passengers.length === 0) {
                    // No passengers and past date -> Expired
                    ride.status = 'expired';
                    await ride.save();
                }
                // If passengers > 0, it stays active waiting for driver to mark completed
            }
        }

        res.status(200).json({
            success: true,
            ride
        });
    } catch (error) {
        console.error('Get ride by ID error:', error);
        res.status(404).json({
            success: false,
            message: error.message || 'Ride not found'
        });
    }
};

/**
 * Join a ride
 * @route POST /api/rides/:id/join
 * @access Private (requires authentication)
 */
const joinRide = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Call the service to join the ride
        const updatedRide = await rideService.joinRideService(id, userId);

        res.status(200).json({
            success: true,
            message: 'Successfully joined ride',
            ride: updatedRide
        });
    } catch (error) {
        console.error('Join ride error details:', error); // Changed logging

        // Handle specific error cases
        if (error.message === 'Ride not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('cannot join') ||
            error.message.includes('already joined') ||
            error.message.includes('No available seats')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while joining ride',
            error: error.message,
            stack: error.stack // Added stack trace for debugging
        });
    }
};

/**
 * Get passengers list for a ride (creator only)
 * @route GET /api/rides/:id/passengers
 * @access Private (requires authentication + creator authorization)
 * @security Returns public passenger data only (name + photo)
 */
const getRidePassengers = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Get the ride by ID with populated passengers
        const ride = await rideService.getRideById(id);

        // Check if the user is the creator
        if (ride.creator._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the ride creator can view passengers'
            });
        }

        // Return only public passenger data (privacy protected)
        const publicPassengers = ride.passengers.map(passenger => ({
            _id: passenger._id,
            fullName: passenger.fullName,
            profileImage: passenger.profileImage,
            isDriver: passenger.isDriver
        }));

        res.status(200).json({
            success: true,
            count: publicPassengers.length,
            passengers: publicPassengers
        });
    } catch (error) {
        console.error('Get ride passengers error:', error);

        if (error.message === 'Ride not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while fetching passengers',
            error: error.message
        });
    }
};

/**
 * Get individual passenger details (creator only)
 * @route GET /api/rides/:id/passengers/:passengerId
 * @access Private (requires authentication + creator authorization)
 * @security Returns authorized passenger data (includes contact info)
 */
const getPassengerDetails = async (req, res) => {
    try {
        const { id: rideId, passengerId } = req.params;
        const userId = req.user._id;

        // Get the ride
        const ride = await rideService.getRideById(rideId);

        // Authorization: Only ride creator can view passenger details
        if (ride.creator._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the ride creator can view passenger details'
            });
        }

        // Check if passenger is in this ride
        const isPassengerInRide = ride.passengers.some(
            p => p._id.toString() === passengerId
        );

        if (!isPassengerInRide) {
            return res.status(404).json({
                success: false,
                message: 'Passenger not found in this ride'
            });
        }

        // Get full passenger details
        const passenger = await rideService.getUserById(passengerId);

        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: 'Passenger not found'
            });
        }

        // Get passenger's ride history
        const passengerRides = await rideService.getUserRides(passengerId);

        // Return authorized data (includes contact info)
        res.status(200).json({
            success: true,
            passenger: {
                _id: passenger._id,
                fullName: passenger.fullName,
                profileImage: passenger.profileImage,
                email: passenger.email,
                phone: passenger.phone,
                governorate: passenger.governorate,
                isDriver: passenger.isDriver,
                createdAt: passenger.createdAt
            },
            rideHistory: {
                total: passengerRides.length,
                asDriver: passengerRides.filter(r => r.type === 'DRIVER').length,
                asPassenger: passengerRides.filter(r => r.type === 'PASSENGER').length
            }
        });
    } catch (error) {
        console.error('Get passenger details error:', error);

        if (error.message === 'Ride not found' || error.message === 'User not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while fetching passenger details',
            error: error.message
        });
    }
};


/**
 * Update a ride demand (Passenger only)
 * @route PATCH /api/rides/:id
 * @access Private (Creator only)
 */
const updateRide = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        // Fields allowed to be updated
        // Added 'availableSeats' and 'price' to allowed updates for drivers
        const allowedUpdates = ['date', 'time', 'neededSeats', 'availableSeats', 'price', 'departure', 'destination', 'status', 'description'];
        const updatesKeys = Object.keys(updates);

        // Filter out non-allowed updates
        const isValidOperation = updatesKeys.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({
                success: false,
                message: 'Invalid updates! You can only update: date, time, seats, price, location, status, and description.'
            });
        }

        const ride = await rideService.getRideById(id);

        // Authorization: Only creator can update
        if (ride.creator._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only the ride creator can update this ride.'
            });
        }

        // Prevent changing critical fields if passengers already joined
        if (ride.passengers.length > 0) {
            const restrictedFields = ['departure', 'destination'];
            const attemptedRestricted = updatesKeys.some(key => restrictedFields.includes(key));

            if (attemptedRestricted) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot change departure or destination after passengers have joined'
                });
            }
        }

        // Logic check: Seats consistency
        if (updates.availableSeats !== undefined) {
            const seats = parseInt(updates.availableSeats);
            if (isNaN(seats) || seats < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Available seats cannot be negative.'
                });
            }
            // CRITICAL: Ensure we don't drop below 0 if manual logic was needed, 
            // but here we are setting the *new* available count directly.
            // The user prompt says: "Total seats = booked passengers + available seats"
            // "Driver CANNOT set available seats lower than: alreadyBookedPassengers" <--- This wording in prompt was slightly confusing.
            // Clarification from prompt example: "Initially: 2 available seats... 2 booked... Driver realizes he can take 1 more... Updates available seats -> 1".
            // So the driver is setting the *Available* seats directly.
            // The constraint "Driver CANNOT set available seats lower than alreadyBookedPassengers" implies setting *Total Capacity*.
            // BUT the field is `availableSeats`. 
            // If I have 2 booked and I want 1 more, I set `availableSeats` to 1.
            // If I have 2 booked and I set `availableSeats` to -1, that's invalid.
            // So `availableSeats >= 0` is the correct validation for this field.
        }

        if (ride.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'This ride is completed and cannot be modified.'
            });
        }

        if (updates.status) {
            // Validation for marking as completed
            if (updates.status === 'completed') {
                if (ride.type === 'DRIVER') {
                    const rideDate = new Date(ride.date);
                    // Reset time to start of day for date-only comparison if needed, 
                    // BUT prompt says "AFTER ride date/time".
                    // ride.date is usually stored as T00:00:00 if it was date picker only, 
                    // or full date-time if date+time picker.
                    // Let's assume strict check against current time.
                    const now = new Date();

                    // Combine date and time to be precise?
                    // ride.date is a Date object. ride.time is a String "HH:mm".
                    // Let's rely on ride.date if it holds full info, or construct it.
                    // Given `Ride.js`: date: Date, time: String.
                    // We need to parse.

                    const [hours, minutes] = ride.time.split(':').map(Number);
                    const specificRideDate = new Date(ride.date);
                    specificRideDate.setHours(hours || 0, minutes || 0, 0, 0);

                    if (now < specificRideDate) {
                        return res.status(400).json({
                            success: false,
                            message: 'Cannot mark ride as done before the scheduled date and time.'
                        });
                    }

                    // Prevent completing rides with no passengers
                    if (ride.passengers.length === 0) {
                        return res.status(400).json({
                            success: false,
                            message: 'Cannot complete a ride with no passengers. Please cancel it instead.'
                        });
                    }
                }
                // PASSENGER can mark as fulfilled anytime (no specific restriction in prompt other than "Passenger can mark...").
            }

            // Check if already completed
            if (ride.status === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Ride is already completed and cannot be modified.'
                });
            }
        }

        // Apply updates
        updatesKeys.forEach((update) => {
            // Prevent updating other fields if status is already completed
            if (ride.status === 'completed' && update !== 'status') {
                // Actually, if it WAS completed, we shouldn't be here?
                // Wait, if the REQUEST is to update status FROM active TO completed, we verify above.
                // If the ride IS ALREADY completed, we should block ALL updates.
            }
            ride[update] = updates[update];
        });

        // Re-check lock for safety: If the ride was ALREADY completed before this request
        // (We need to check this BEFORE applying updates)
        // Moving this check to top of function would be better, but let's do it here relative to the 'ride' object fetched.

        // Let's refactor: Check read-only state immediately after fetching ride.

        await ride.save();

        res.status(200).json({
            success: true,
            message: 'Ride updated successfully',
            ride
        });
    } catch (error) {
        console.error('Update ride error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating ride',
            error: error.message
        });
    }
};

/**
 * Leave a ride (Cancel Booking)
 * @route POST /api/rides/:id/leave
 * @access Private
 */
const leaveRide = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const updatedRide = await rideService.leaveRideService(id, userId);

        res.status(200).json({
            success: true,
            message: 'Successfully left the ride',
            ride: updatedRide
        });
    } catch (error) {
        console.error('Leave ride error:', error);

        if (error.message === 'Ride not found') {
            return res.status(404).json({ success: false, message: error.message });
        }

        // Handle validation errors (Not in ride, Ride passed, etc.)
        if (error.message.includes('Cannot') || error.message.includes('not a passenger')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while leaving ride',
            error: error.message
        });
    }
};

/**
 * Cancel a ride (Soft Delete) - Formerly deleteRide
 * @route PUT /api/rides/:id/cancel
 * @access Private (Creator only)
 */
const cancelRide = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const updatedRide = await rideService.cancelRideService(id, userId);

        res.status(200).json({
            success: true,
            message: 'Ride cancelled successfully',
            ride: updatedRide
        });
    } catch (error) {
        console.error('Cancel ride error:', error);

        if (error.message === 'Ride not found') {
            return res.status(404).json({ success: false, message: error.message });
        }

        if (error.message.includes('Not authorized')) {
            return res.status(403).json({ success: false, message: error.message });
        }

        if (error.message.includes('Cannot')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while cancelling ride',
            error: error.message
        });
    }
};

// Deprecated: deleteRide kept as alias or removed. 
// For now, replacing the export of deleteRide with cancelRide logic if route points to it,
// OR explicitly exporting cancelRide.
// The user prompt said: "deleteRide should be removed... replaced entirely by cancelRide"
// So I will NOT export deleteRide anymore locally, but I replaced the function body above.
// Actually, I am REPLACING the 'deleteRide' function body in the file with 'leaveRide' and 'cancelRide' definitions.
// NOTE: I need to export these names correctly at the bottom of the file.

module.exports = {
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
};

