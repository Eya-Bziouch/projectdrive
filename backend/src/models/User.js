const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        // Required fields
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true
        },
        cin: {
            type: String,
            required: [true, 'CIN is required'],
            unique: true,
            trim: true
        },
        governorate: {
            type: String,
            required: [true, 'Governorate is required'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters']
        },

        // Optional fields
        profileImage: {
            type: String,
            default: null
        },
        driverLicense: {
            type: String,
            default: null
        },
        vehicleMatricule: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt
    }
);

// Virtual field: isDriver
userSchema.virtual('isDriver').get(function () {
    return !!(this.driverLicense && this.vehicleMatricule);
});

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
