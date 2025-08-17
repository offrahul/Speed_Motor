const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');
const logger = require('../utils/logger');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'User already exists with this email' }
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || 'customer',
      department,
      createdBy: req.user ? req.user.id : null
    });

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(emailVerificationToken)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Email Verification - SpeedMotors',
          message: `Please verify your email by clicking on this link: ${req.protocol}://${req.get('host')}/api/v1/auth/verify-email?token=${emailVerificationToken}`
        });
      } catch (error) {
        logger.error('Email sending failed:', error);
      }
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    });
  } catch (error) {
    logger.error('User registration failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'User registration failed' }
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Check if user is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error: { message: 'Account is locked due to too many failed login attempts' }
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('User login failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Login failed' }
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get user failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user information' }
    });
  }
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
const updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      address: req.body.address,
      emergencyContact: req.body.emergencyContact,
      preferences: req.body.preferences
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Update user details failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update user details' }
    });
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: { message: 'Current password is incorrect' }
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error('Update password failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update password' }
    });
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findByEmail(req.body.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send reset email
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Password Reset - SpeedMotors',
          message: `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: ${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`
        });
      } catch (error) {
        logger.error('Password reset email failed:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    logger.error('Forgot password failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to process password reset' }
    });
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid or expired reset token' }
      });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Reset password failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to reset password' }
    });
  }
};

// @desc    Verify email
// @route   POST /api/v1/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid or expired verification token' }
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to verify email' }
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification-email
// @access  Public
const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findByEmail(req.body.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email is already verified' }
      });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(emailVerificationToken)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Email Verification - SpeedMotors',
          message: `Please verify your email by clicking on this link: ${req.protocol}://${req.get('host')}/api/v1/auth/verify-email?token=${emailVerificationToken}`
        });
      } catch (error) {
        logger.error('Verification email failed:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    logger.error('Resend verification email failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to resend verification email' }
    });
  }
};

// @desc    Verify phone
// @route   POST /api/v1/auth/verify-phone
// @access  Public
const verifyPhone = async (req, res) => {
  try {
    const { phone, code } = req.body;

    const user = await User.findOne({
      phone,
      phoneVerificationCode: code,
      phoneVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid or expired verification code' }
      });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Phone verified successfully'
    });
  } catch (error) {
    logger.error('Phone verification failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to verify phone' }
    });
  }
};

// @desc    Resend phone verification
// @route   POST /api/v1/auth/resend-phone-verification
// @access  Public
const resendPhoneVerification = async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.body.phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        error: { message: 'Phone is already verified' }
      });
    }

    // Generate new verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.phoneVerificationCode = code;
    user.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send SMS verification
    if (process.env.ENABLE_SMS_NOTIFICATIONS === 'true') {
      try {
        await sendSMS({
          phone: user.phone,
          message: `Your SpeedMotors verification code is: ${code}. Valid for 10 minutes.`
        });
      } catch (error) {
        logger.error('SMS verification failed:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent'
    });
  } catch (error) {
    logger.error('Resend phone verification failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to resend verification code' }
    });
  }
};

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { message: 'Refresh token is required' }
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' }
      });
    }

    // Generate new access token
    const newToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    logger.error('Token refresh failed:', error);
    res.status(401).json({
      success: false,
      error: { message: 'Invalid refresh token' }
    });
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: { message: 'Current password is incorrect' }
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to change password' }
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout failed:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to logout' }
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  verifyPhone,
  resendPhoneVerification,
  refreshToken,
  changePassword
};
