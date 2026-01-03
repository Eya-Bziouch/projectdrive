const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator is required']
        },
        type: {
            type: String,
            enum: {
                values: ['DRIVER', 'PASSENGER'],
                message: 'Type must be either DRIVER or PASSENGER'
            },
            required: [true, 'Ride type is required']
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled', 'expired'],
            default: 'active'
        },
        departure: {
            type: String,
            required: [true, 'Departure location is required'],
            trim: true
        },
        destination: {
            type: String,
            required: [true, 'Destination is required'],
            trim: true
        },
        date: {
            type: Date,
            required: [true, 'Date is required']
        },
        time: {
            type: String,
            required: [true, 'Time is required'],
            trim: true
        },
        availableSeats: {
            type: Number,
            validate: {
                validator: function (value) {
                    if (this.type === 'DRIVER') {
                        return value != null && value >= 0;
                    }
                    return true;
                },
                message: 'Available seats is required for DRIVER rides'
            },
            min: [0, 'Available seats must be at least 0']
        },
        neededSeats: {
            type: Number,
            validate: {
                validator: function (value) {
                    if (this.type === 'PASSENGER') {
                        return value != null && value >= 1;
                    }
                    return true;
                },
                message: 'Needed seats is required for PASSENGER rides'
            },
            min: [1, 'Needed seats must be at least 1']
        },


        price: {
            type: Number,
            min: [0, 'Price cannot be negative'],
            validate: {
                validator: function (value) {
                    // Price is required only when type is DRIVER
                    if (this.type === 'DRIVER') {
                        return value != null && value >= 0;
                    }
                    return true;
                },
                message: 'Price is required when ride type is DRIVER'
            }
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        passengers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        originalSeats: {
            type: Number,
            required: function () {
                // originalSeats is required for DRIVER rides
                return this.type === 'DRIVER';
            }
        }
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt
    }
);

// Schema methods for validation
rideSchema.methods.hasPassenger = function (userId) {
    if (!this.passengers || !userId) return false;
    return this.passengers.some(passengerId => {
        const pId = passengerId._id || passengerId; // Handle populated or unpopulated
        return pId.toString() === userId.toString();
    });
};

rideSchema.methods.canJoin = function () {
    return this.availableSeats > 0;
};

// Pre-save validation to ensure price is set for DRIVER rides
rideSchema.pre('save', function (next) {
    if (this.type === 'DRIVER' && (this.price == null || this.price === undefined)) {
        next(new Error('Price is required for DRIVER rides'));
    } else {
        next();
    }
});

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
