import api from './api';

/**
 * Get current user profile
 * @returns {Promise<object>} User object
 */
const getProfile = async () => {
    const response = await api.get('/users/me');
    return response.data.user || response.data; // Extract user from response
};

/**
 * Update user profile
 * @param {object} userData - { phone, governorate, profileImage, driverLicense, vehicleMatricule }
 * @returns {Promise<object>} Updated user object
 */
const updateProfile = async (userData) => {
    const response = await api.put('/users/me', userData);
    return response.data.user || response.data; // Extract user from response
};

/**
 * Get public user profile by ID
 * @param {string} userId - The ID of the user to retrieve
 * @returns {Promise<object>} User object
 */
const getPublicProfile = async (userId) => {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
};

/**
 * Upload profile image
 * For now, we'll use the image URI directly
 * In production, you'd upload to a file storage service
 * @param {string} uri - Local file URI
 * @returns {Promise<string>} Image URL/URI
 */
const uploadProfileImage = async (uri) => {
    // For MVP, return the URI to be stored directly
    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    return uri;
};

/**
 * Upload driver license image
 * For now, stores the URI directly similar to profile image
 * @param {string} uri - Local file URI
 * @returns {Promise<string>} License image URI
 */
const uploadDriverLicense = async (uri) => {
    // Similar to profile image, for MVP we return the URI
    // In production, upload to cloud storage
    return uri;
};

/**
 * Check if a user is a valid driver
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>}
 */
const checkIfDriver = async (userId) => {
    try {
        const userData = await getProfile();

        return Boolean(
            userData &&
            userData.driverLicense &&
            userData.vehicleMatricule
        );
    } catch (error) {
        console.error('Error checking driver status', error);
        return false;
    }
};

const userService = {
    getProfile,
    updateProfile,
    uploadProfileImage,
    uploadDriverLicense,
    checkIfDriver,
    getPublicProfile
};

export default userService;
