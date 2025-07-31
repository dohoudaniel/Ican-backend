const express = require("express");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
} = require("../middleware/auth");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/^(?=.*\d)/)
    .withMessage("Password must contain at least one number")
    .matches(/^(?=.*[@$!%*?&])/)
    .withMessage(
      "Password must contain at least one special character (@$!%*?&)"
    ),
  body("phone")
    .trim()
    .matches(/^(\+234|0)[789][01]\d{8}$/)
    .withMessage(
      "Please provide a valid Nigerian phone number (e.g., 08012345678)"
    ),
  body("membershipId")
    .optional()
    .trim()
    .matches(/^ICAN\/\d{4}\/\d{3,6}$/i)
    .withMessage(
      "Membership ID format should be ICAN/YYYY/XXX (e.g., ICAN/2024/001)"
    ),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  authLimiter,
  registerValidation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { name, email, password, phone, membershipId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    // Check if membership ID is already taken (if provided)
    if (membershipId) {
      const existingMembership = await User.findOne({
        membershipId: membershipId.toUpperCase(),
      });
      if (existingMembership) {
        throw new AppError("Membership ID already exists", 400);
      }
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      phone,
      membershipId: membershipId?.toUpperCase(),
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    });
  })
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  authLimiter,
  loginValidation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new AppError(
        "Account is temporarily locked due to too many failed login attempts",
        423
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError("Account is deactivated", 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      throw new AppError("Invalid credentials", 401);
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Clean expired tokens and add new refresh token
    await user.cleanExpiredTokens();
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await user.save();

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    });
  })
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const tokenExists = user.refreshTokens.some(
      (tokenObj) => tokenObj.token === refreshToken
    );
    if (!tokenExists) {
      throw new AppError("Invalid refresh token", 401);
    }

    // Check if user is still active
    if (!user.isActive) {
      throw new AppError("Account is deactivated", 401);
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token: newToken,
      },
    });
  })
);

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate refresh token)
// @access  Public
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Find user by refresh token and remove it
      const user = await User.findOne({ "refreshTokens.token": refreshToken });
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (tokenObj) => tokenObj.token !== refreshToken
        );
        await user.save();
      }
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  })
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();

    // Save reset token to user (in production, you'd send this via email)
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // In production, send email with reset link
    // For now, we'll just return the token (for testing purposes)
    res.json({
      success: true,
      message: "Password reset instructions sent to your email",
      ...(process.env.NODE_ENV === "development" && { resetToken }),
    });
  })
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post(
  "/reset-password",
  resetPasswordValidation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    // Verify reset token
    try {
      verifyPasswordResetToken(token);
    } catch (error) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    // Find user with this reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Clear all refresh tokens (force re-login)
    user.refreshTokens = [];

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  })
);

module.exports = router;
