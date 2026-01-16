const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('firstName', 'First name is required').not().isEmpty().trim().escape(),
  body('lastName', 'Last name is required').not().isEmpty().trim().escape(),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Register validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + errors.array().map(e => e.msg).join(', '),
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Registration failed: User already exists', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    console.log('Attempting to create user in DB...');
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });
    console.log('User created successfully in DB:', user._id);

    // Generate token
    const token = generateToken(user._id);

    // Send response (don't send password)
    const userData = { ...user.toObject() };
    delete userData.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({
      success: false,
      message: `Registration failed: ${error.message}`,
      error: error.toString()
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Login validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Send response (don't send password)
    const userData = { ...user.toObject() };
    delete userData.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Login error detailed:', error);
    res.status(500).json({
      success: false,
      message: `Login failed: ${error.message}`,
      error: error.toString()
    });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is populated by the protect middleware
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      message: 'Current user retrieved successfully',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          medicalConditions: user.medicalConditions,
          medications: user.medications,
          allergies: user.allergies,
          isActive: user.isActive,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user details'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
router.put('/me', protect, [
  body('firstName').optional().trim().escape(),
  body('lastName').optional().trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, dateOfBirth, gender, medicalConditions, medications, allergies } = req.body;

    // Check if email is being updated and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user is already registered with this email'
        });
      }
    }

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
    if (gender) updateFields.gender = gender;
    if (medicalConditions) updateFields.medicalConditions = medicalConditions;
    if (medications) updateFields.medications = medications;
    if (allergies) updateFields.allergies = allergies;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

module.exports = router;