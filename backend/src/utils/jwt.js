const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

/**
 * Generate a JWT token with user id
 * @param {string} userId - The user's ID to encode in the token
 * @param {string} expiresIn - Token expiration time (default: 7 days)
 * @returns {string} The generated JWT token
 */
const generateToken = (userId, expiresIn = '7d') => {
    const token = jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn }
    );
    return token;
};

/**
 * Verify a JWT token and extract the payload
 * @param {string} token - The JWT token to verify
 * @returns {Object} The decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

module.exports = {
    generateToken,
    verifyToken
};
