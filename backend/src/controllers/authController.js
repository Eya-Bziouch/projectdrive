const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateTokenPair, verifyRefreshToken, generateAccessToken } = require('../utils/jwt');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const {
            fullName,
            cin,
            governorate,
            phone,
            email,
            password,
            passwordConfirm,
            profileImage,
            driverLicense,
            vehicleMatricule
        } = req.body;

        // Validate required fields
        if (!fullName || !cin || !governorate || !phone || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: fullName, cin, governorate, phone, email, password'
            });
        }

        // Validate password confirmation if provided
        if (passwordConfirm && password !== passwordConfirm) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Check if user already exists (by email or cin)
        const existingUser = await User.findOne({
            $or: [{ email }, { cin }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or CIN already exists'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const user = await User.create({
            fullName,
            cin,
            governorate,
            phone,
            email,
            password: hashedPassword,
            profileImage,
            driverLicense,
            vehicleMatricule
        });

        // Generate access and refresh tokens
        const { accessToken, refreshToken } = generateTokenPair(user._id.toString());

        // Store refresh token in database
        await RefreshToken.createToken(user._id.toString(), refreshToken, 7);

        // Return user info (without password)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            accessToken,
            refreshToken,
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
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
};

/**
 * Login user using email OR fullName + password
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, fullName, password, emailOrName } = req.body;

        // Validate that password is provided
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        // Validate that either email or fullName or emailOrName is provided
        if (!email && !fullName && !emailOrName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide either email or fullName'
            });
        }

        // Find user by email or fullName
        let query = {};
        if (emailOrName) {
            query = {
                $or: [{ email: emailOrName }, { fullName: emailOrName }]
            };
        } else {
            query = email ? { email } : { fullName };
        }

        const user = await User.findOne(query);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate access and refresh tokens
        const { accessToken, refreshToken } = generateTokenPair(user._id.toString());

        // Store refresh token in database
        await RefreshToken.createToken(user._id.toString(), refreshToken, 7);

        // Return user info (without password)
        res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken,
            refreshToken,
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
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh
 */
const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify the refresh token JWT
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
                error: error.message
            });
        }

        // Check if refresh token exists in database
        const storedToken = await RefreshToken.verifyToken(refreshToken);

        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found or expired'
            });
        }

        // Verify user still exists
        const user = await User.findById(decoded.userId);

        if (!user) {
            // Clean up invalid token
            await RefreshToken.deleteToken(refreshToken);
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user._id.toString());

        res.status(200).json({
            success: true,
            message: 'Access token refreshed successfully',
            accessToken: newAccessToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during token refresh',
            error: error.message
        });
    }
};

/**
 * Logout user and invalidate refresh token
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Delete the refresh token from database
        await RefreshToken.deleteToken(refreshToken);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout',
            error: error.message
        });
    }
};

/**
 * Logout from all devices (invalidate all refresh tokens)
 * @route POST /api/auth/logout-all
 */
const logoutAll = async (req, res) => {
    try {
        // Get user ID from authenticated request
        const userId = req.user.userId;

        // Delete all refresh tokens for this user
        await RefreshToken.deleteAllUserTokens(userId);

        res.status(200).json({
            success: true,
            message: 'Logged out from all devices successfully'
        });
    } catch (error) {
        console.error('Logout all error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    refreshAccessToken,
    logout,
    logoutAll
};

