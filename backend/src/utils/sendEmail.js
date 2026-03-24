const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

function sendOTPEmail(email, otpCode, callback) {
  const mailOptions = {
    from: `"Registration System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Thank you for registering! Please verify your email address using the OTP below:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
          ${otpCode}
        </div>
        <p>This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #777; font-size: 12px;">Registration System</p>
      </div>
    `
  };
  
  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      console.log('Email error:', err);
      return callback(err, null);
    }
    console.log('Email sent:', info.messageId);
    callback(null, info);
  });
}

// Send credentials email with username and password
function sendCredentialsEmail(email, username, password, callback) {
  const loginUrl = process.env.FRONTEND_URL || 'http://100.88.168.61:4001';
  
  const mailOptions = {
    from: `"Registration System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome! Your Account Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h2 style="color: white; margin: 0;">Welcome to Registration System!</h2>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333;">Dear User,</p>
          <p style="font-size: 16px; color: #333;">Your account has been successfully created. Here are your login details:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0; font-size: 16px;"><strong>📧 Email:</strong> ${email}</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>👤 Username:</strong> ${username}</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>🔐 Password:</strong> ${password}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Login to Your Account</a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">For security reasons, please change your password after first login.</p>
          <p style="font-size: 14px; color: #666;">If you didn't create this account, please ignore this email.</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #666; font-size: 12px;">&copy; 2025 Registration System. All rights reserved.</p>
        </div>
      </div>
    `
  };
  
  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      console.log('Credentials email error:', err);
      return callback(err, null);
    }
    console.log('Credentials email sent:', info.messageId);
    callback(null, info);
  });
}

module.exports = { sendOTPEmail, sendCredentialsEmail };