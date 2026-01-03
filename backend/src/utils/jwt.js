const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET } = require('../config/config');

/**
 * Generate an access token (short-lived)
 * @param {string} userId - The user's ID to encode in the token
 * @returns {string} The generated access token
 */
const generateAccessToken = (userId) => {
    const token = jwt.sign(
        {
            userId,
            type: 'access'
        },
        JWT_SECRET,
        { expiresIn: '15m' } // 15 minutes
    );
    return token;
};

/**
 * Generate a refresh token (long-lived)
 * @param {string} userId - The user's ID to encode in the token
 * @returns {string} The generated refresh token
 */
const generateRefreshToken = (userId) => {
    // Generate a random token string
    const randomToken = crypto.randomBytes(40).toString('hex');

    const token = jwt.sign(
        {
            userId,
            type: 'refresh',
            jti: randomToken // JWT ID for uniqueness
        },
        JWT_SECRET,
        { expiresIn: '7d' } // 7 days
    );
    return token;
};

/**
 * Generate both access and refresh tokens
 * @param {string} userId - The user's ID to encode in the tokens
 * @returns {Object} Object containing accessToken and refreshToken
 */
const generateTokenPair = (userId) => {
    return {
        accessToken: generateAccessToken(userId),
        refreshToken: generateRefreshToken(userId)
    };
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
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        }
        throw new Error('Invalid token');
    }
};

/**
 * Verify an access token specifically
 * @param {string} token - The access token to verify
 * @returns {Object} The decoded token payload
 * @throws {Error} If token is invalid, expired, or not an access token
 */
const verifyAccessToken = (token) => {
    const decoded = verifyToken(token);
    if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
    }
    return decoded;
};

/**
 * Verify a refresh token specifically
 * @param {string} token - The refresh token to verify
 * @returns {Object} The decoded token payload
 * @throws {Error} If token is invalid, expired, or not a refresh token
 */
const verifyRefreshToken = (token) => {
    const decoded = verifyToken(token);
    if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
    }
    return decoded;
};

// Legacy function for backward compatibility
const generateToken = (userId, expiresIn = '7d') => {
    const token = jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn }
    );
    return token;
};

module.exports = {
    generateToken, // Legacy
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    verifyToken,
    verifyAccessToken,
    verifyRefreshToken
};
