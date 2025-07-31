const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
  body('address.postalCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Postal code cannot exceed 20 characters')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// @route   GET /api/user/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -refreshTokens');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: user
  });
}));

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateProfileValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const { name, phone, address, preferences } = req.body;

  const updateData = {};
  
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (address) updateData.address = { ...req.user.address, ...address };
  if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
}));

// @route   POST /api/user/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', changePasswordValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Check if new password is different from current
  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    throw new AppError('New password must be different from current password', 400);
  }

  // Update password
  user.password = newPassword;
  
  // Clear all refresh tokens (force re-login on all devices)
  user.refreshTokens = [];
  
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully. Please log in again.'
  });
}));

// @route   GET /api/user/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // In a real application, you would calculate these from related models
  const stats = {
    cpdPoints: user.cpdPoints,
    balance: user.balance,
    memberSince: user.dateJoined,
    membershipLevel: user.membershipLevel,
    completedCPDModules: 0, // Would be calculated from CPD model
    upcomingEvents: 0, // Would be calculated from Events model
    totalTransactions: 0, // Would be calculated from Transaction model
    unreadNotifications: 0 // Would be calculated from Notification model
  };

  res.json({
    success: true,
    data: stats
  });
}));

// @route   POST /api/user/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', asyncHandler(async (req, res) => {
  // This would typically use multer for file upload
  // For now, we'll just accept a URL or base64 string
  const { profileImage } = req.body;

  if (!profileImage) {
    throw new AppError('Profile image is required', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profileImage },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'Profile image updated successfully',
    data: { profileImage: user.profileImage }
  });
}));

// @route   DELETE /api/user/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { 
      isActive: false,
      refreshTokens: [] // Clear all refresh tokens
    },
    { new: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'Account deactivated successfully'
  });
}));

// @route   GET /api/user/activity
// @desc    Get user activity log
// @access  Private
router.get('/activity', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // In a real application, you would have an activity log model
  const activity = {
    lastLogin: user.lastLogin,
    accountCreated: user.createdAt,
    profileUpdated: user.updatedAt,
    // Add more activity data as needed
  };

  res.json({
    success: true,
    data: activity
  });
}));

// @route   POST /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.post('/preferences', asyncHandler(async (req, res) => {
  const { notifications, language, timezone } = req.body;

  const updateData = {};
  if (notifications) updateData['preferences.notifications'] = notifications;
  if (language) updateData['preferences.language'] = language;
  if (timezone) updateData['preferences.timezone'] = timezone;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: user.preferences
  });
}));

module.exports = router;
