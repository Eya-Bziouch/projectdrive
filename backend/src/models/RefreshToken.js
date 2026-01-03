const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Index for automatic cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster lookups
refreshTokenSchema.index({ userId: 1 });

/**
 * Hash a refresh token before storing
 * @param {string} token - Plain text token
 * @returns {string} Hashed token
 */
refreshTokenSchema.statics.hashToken = function(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Create and store a new refresh token
 * @param {string} userId - User ID
 * @param {string} token - Plain text token
 * @param {number} expiresInDays - Number of days until expiration
 * @returns {Promise<RefreshToken>}
 */
refreshTokenSchema.statics.createToken = async function(userId, token, expiresInDays = 7) {
    const hashedToken = this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return await this.create({
        token: hashedToken,
        userId,
        expiresAt
    });
};

/**
 * Verify and find a refresh token
 * @param {string} token - Plain text token
 * @returns {Promise<RefreshToken|null>}
 */
refreshTokenSchema.statics.verifyToken = async function(token) {
    const hashedToken = this.hashToken(token);
    
    const refreshToken = await this.findOne({
        token: hashedToken,
        expiresAt: { $gt: new Date() }
    });

    return refreshToken;
};

/**
 * Delete a specific refresh token
 * @param {string} token - Plain text token
 */
refreshTokenSchema.statics.deleteToken = async function(token) {
    const hashedToken = this.hashToken(token);
    await this.deleteOne({ token: hashedToken });
};

/**
 * Delete all refresh tokens for a user
 * @param {string} userId - User ID
 */
refreshTokenSchema.statics.deleteAllUserTokens = async function(userId) {
    await this.deleteMany({ userId });
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
