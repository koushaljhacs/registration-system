const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();

// Registration flow
router.post('/send-otp', AuthController.sendOtp);
router.post('/verify-otp-only', AuthController.verifyOtpOnly);
router.post('/register-with-verified-otp', AuthController.registerWithVerifiedOtp);

// Login flow
router.post('/login-with-username', AuthController.loginWithUsername);
router.post('/login', AuthController.login);

// Forgot Password flow
router.post('/forgot-password-send-otp', AuthController.forgotPasswordSendOtp);
router.post('/forgot-password-verify-otp', AuthController.forgotPasswordVerifyOtp);
router.post('/reset-password', AuthController.resetPassword);

// Old flow endpoints (kept for compatibility)
router.post('/register', AuthController.register);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/resend-otp', AuthController.resendOtp);
router.post('/register-with-otp', AuthController.registerWithOtp);

module.exports = router;