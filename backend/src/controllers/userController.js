const User = require('../models/User');

/**
 * Get logged-in user profile
 * @route GET /api/users/profile
 * @access Private (requires authentication)
 */
const getProfile = async (req, res) => {
    try {
        // User is already attached to req by authenticate middleware
        const user = req.user;

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                cin: user.cin,
                governorate: user.governorate,
                phone: user.phone,
                email: user.email,
                profileImage: user.profileImage,
                driverLicense: user.driverLicense,
                vehicleMatricule: user.vehicleMatricule,
                isDriver: user.isDriver,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile',
            error: error.message
        });
    }
};

/**
 * Update logged-in user profile
 * @route PUT /api/users/profile
 * @access Private (requires authentication)
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            phone,
            governorate,
            profileImage,
            driverLicense,
            vehicleMatricule
        } = req.body;

        // Build update object with only allowed fields
        const updateData = {};

        if (phone !== undefined) updateData.phone = phone;
        if (governorate !== undefined) updateData.governorate = governorate;
        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (driverLicense !== undefined) updateData.driverLicense = driverLicense;
        if (vehicleMatricule !== undefined) updateData.vehicleMatricule = vehicleMatricule;

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided for update'
            });
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                fullName: updatedUser.fullName,
                cin: updatedUser.cin,
                governorate: updatedUser.governorate,
                phone: updatedUser.phone,
                email: updatedUser.email,
                profileImage: updatedUser.profileImage,
                driverLicense: updatedUser.driverLicense,
                vehicleMatricule: updatedUser.vehicleMatricule,
                isDriver: updatedUser.isDriver,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile',
            error: error.message
        });
    }
};

/**
 * Get public profile by ID
 * @route GET /api/users/:id/profile
 * @access Private
 */
const getPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password -cin'); // Exclude sensitive info like CIN or Password

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                fullName: user.fullName,
                governorate: user.governorate,
                phone: user.phone,
                email: user.email,
                profileImage: user.profileImage,
                driverLicense: user.driverLicense,
                vehicleMatricule: user.vehicleMatricule,
                isDriver: user.isDriver,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching public profile',
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getPublicProfile
};
