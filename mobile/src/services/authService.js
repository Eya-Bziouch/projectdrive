import api from './api';
import tokenService from './tokenService';

/**
 * Authentication Service
 * Provides methods for user authentication operations
 */

/**
 * Register a new user
 * @param {string} fullName 
 * @param {string} cin 
 * @param {string} governorate 
 * @param {string} phone 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{accessToken: string, refreshToken: string, user: object}>}
 */
const register = async (fullName, cin, governorate, phone, email, password) => {
    const response = await api.post('/auth/register', {
        fullName,
        cin,
        governorate,
        phone,
        email,
        password,
    });
    return response.data;
};

/**
 * Login a user
 * @param {string} emailOrFullName 
 * @param {string} password 
 * @returns {Promise<{accessToken: string, refreshToken: string, user: object}>}
 */
const login = async (emailOrFullName, password) => {
    const response = await api.post('/auth/login', {
        emailOrName: emailOrFullName,
        password,
    });
    return response.data;
};

/**
 * Refresh the access token using the stored refresh token
 * @returns {Promise<{accessToken: string}>}
 */
const refreshAccessToken = async () => {
    const refreshToken = await tokenService.getRefreshToken();
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', {
        refreshToken,
    });
    return response.data;
};

/**
 * Logout the user
 * Clears local tokens and invalidates the refresh token on the server
 * @returns {Promise<{success: boolean}>}
 */
const logout = async () => {
    try {
        const refreshToken = await tokenService.getRefreshToken();
        if (refreshToken) {
            await api.post('/auth/logout', { refreshToken });
        }
    } catch (error) {
        console.error('Logout API error:', error);
        // Continue with local logout even if API fails
    }

    // Clear all stored tokens
    await tokenService.clearTokens();
    await tokenService.clearRememberMe();

    return { success: true };
};

/**
 * Logout from all devices
 * Requires authentication - invalidates all refresh tokens for the user
 * @returns {Promise<{success: boolean}>}
 */
const logoutAll = async () => {
    try {
        await api.post('/auth/logout-all');
    } catch (error) {
        console.error('Logout all API error:', error);
    }

    // Clear local tokens
    await tokenService.clearTokens();
    await tokenService.clearRememberMe();

    return { success: true };
};

const authService = {
    register,
    login,
    refreshAccessToken,
    logout,
    logoutAll,
};

export default authService;
