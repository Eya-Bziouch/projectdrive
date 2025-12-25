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
            required: [true, 'Available seats is required'],
            min: [1, 'Available seats must be at least 1']
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
        }
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt
    }
);

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
