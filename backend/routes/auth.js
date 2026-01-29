import express from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import { protect, generateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, async (req, res) => {
    let user;
    try {
        const { email, password, role, profileData } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user
        user = await User.create({
            email,
            password,
            role
        });

        // Create role-specific profile
        try {
            if (role === 'student') {
                await Student.create({
                    userId: user._id,
                    email: user.email,
                    ...profileData
                });
            } else if (role === 'teacher') {
                await Teacher.create({
                    userId: user._id,
                    email: user.email,
                    ...profileData
                });
            }
        } catch (profileError) {
            // Clean up the user if profile creation fails
            if (user) await User.findByIdAndDelete(user._id);

            if (profileError.code === 11000) {
                const field = Object.keys(profileError.keyPattern)[0];
                const msg = field === 'rollNumber' ? 'Roll number' : (field === 'employeeId' ? 'Employee ID' : field);
                return res.status(400).json({ message: `${msg} is already registered` });
            }
            throw profileError;
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: role === 'teacher' ? 'Registration successful. Awaiting admin approval.' : 'Registration successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved
            }
        });
    } catch (error) {
        console.error('Registration error:', error);

        // Handle other duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Registration failed: Duplicate data detected' });
        }

        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password for verification
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Get profile data
        let profile = null;
        if (user.role === 'student') {
            profile = await Student.findOne({ userId: user._id });
        } else if (user.role === 'teacher') {
            profile = await Teacher.findOne({ userId: user._id });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                profile
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        let profile = null;

        if (req.user.role === 'student') {
            profile = await Student.findOne({ userId: req.user._id });
        } else if (req.user.role === 'teacher') {
            profile = await Teacher.findOne({ userId: req.user._id }).populate('assignedSubjects');
        }

        res.json({
            success: true,
            user: {
                id: req.user._id,
                email: req.user.email,
                role: req.user.role,
                isApproved: req.user.isApproved,
                profile
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
