const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

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

        // Generate JWT token
        const token = generateToken(user._id.toString());

        // Return user info (without password)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                cin: user.cin,
                governorate: user.governorate,
                phone: user.phone,
                email: user.email,
                profileImage: user.profileImage,
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

        // Generate JWT token
        const token = generateToken(user._id.toString());

        // Return user info (without password)
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                cin: user.cin,
                governorate: user.governorate,
                phone: user.phone,
                email: user.email,
                profileImage: user.profileImage,
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

module.exports = {
    register,
    login
};
