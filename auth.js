const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please provide a valid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('role').optional().isIn(['customer', 'sales_agent', 'technician', 'service_advisor', 'inventory_manager', 'admin']).withMessage('Invalid role'),
  body('department').optional().isIn(['sales', 'service', 'parts', 'finance', 'admin']).withMessage('Invalid department')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const validatePasswordUpdate = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
];

const validatePasswordReset = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
];

const validateEmailVerification = [
  body('token').notEmpty().withMessage('Verification token is required')
];

const validatePhoneVerification = [
  body('phone').matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please provide a valid phone number'),
  body('code').isLength({ min: 4, max: 6 }).withMessage('Verification code must be between 4 and 6 characters')
];

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], forgotPassword);
router.post('/reset-password/:resetToken', validatePasswordReset, resetPassword);
router.post('/verify-email', validateEmailVerification, verifyEmail);
router.post('/verify-phone', validatePhoneVerification, verifyPhone);
router.post('/resend-verification-email', [body('email').isEmail().normalizeEmail()], resendVerificationEmail);
router.post('/resend-phone-verification', [body('phone').matches(/^[\+]?[1-9][\d]{0,15}$/)], resendPhoneVerification);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.get('/me', getMe);
router.put('/updatedetails', [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  body('emergencyContact.name').optional().trim(),
  body('emergencyContact.relationship').optional().trim(),
  body('emergencyContact.phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/),
  body('preferences.notifications.email').optional().isBoolean(),
  body('preferences.notifications.sms').optional().isBoolean(),
  body('preferences.notifications.push').optional().isBoolean(),
  body('preferences.language').optional().isIn(['en', 'es', 'fr', 'de']),
  body('preferences.timezone').optional().trim()
], updateDetails);

router.put('/updatepassword', validatePasswordUpdate, updatePassword);
router.put('/change-password', validatePasswordUpdate, changePassword);
router.post('/logout', logout);

// Admin only routes
router.get('/users', authorize('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

// Error handling middleware for validation errors
router.use((err, req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }
  next();
});

module.exports = router;
