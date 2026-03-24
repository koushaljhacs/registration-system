const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const OtpModel = require('../models/otpModel');
const generateUsername = require('../utils/generateUsername');
const { sendOTPEmail, sendCredentialsEmail } = require('../utils/sendEmail');
require('dotenv').config();

const AuthController = {
  // Send OTP only
  sendOtp: function(req, res) {
    const { email } = req.body;
    
    console.log(`📧 Sending OTP to: ${email}`);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Check if user already exists
    UserModel.findByEmail(email, function(err, existingUser) {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      
      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`🔑 Generated OTP: ${otpCode} for ${email}`);
      
      // Save OTP
      OtpModel.saveOtp(email, otpCode, 'registration', function(err, otpRecord) {
        if (err) {
          console.error('❌ Error saving OTP:', err);
          return res.status(500).json({
            success: false,
            message: 'Error saving OTP',
            error: err.message
          });
        }
        
        console.log(`💾 OTP saved with ID: ${otpRecord.id}`);
        
        // Send OTP email
        sendOTPEmail(email, otpCode, function(err, info) {
          if (err) {
            console.error('❌ Email error:', err);
            return res.json({
              success: true,
              message: 'OTP generated. Check console for OTP (email sending failed)',
              otp: process.env.NODE_ENV === 'development' ? otpCode : undefined
            });
          }
          
          console.log(`✅ Email sent: ${info.messageId}`);
          res.json({
            success: true,
            message: 'OTP sent successfully to your email'
          });
        });
      });
    });
  },
  
  // Verify OTP only (without registering)
  verifyOtpOnly: function(req, res) {
    const { email, otp_code } = req.body;
    
    console.log(`🔐 Verifying OTP only for ${email}: ${otp_code}`);
    
    if (!email || !otp_code) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }
    
    // Verify OTP
    OtpModel.verifyOtp(email, otp_code, 'registration', function(err, otpRecord) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (!otpRecord) {
        console.log(`❌ Invalid OTP for ${email}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }
      
      console.log(`✅ OTP verified for ${email}`);
      
      // Mark OTP as used
      OtpModel.markAsUsed(otpRecord.id, function(err) {
        if (err) console.log('Error marking OTP as used:', err);
      });
      
      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    });
  },
  
  // Register with pre-verified OTP
  registerWithVerifiedOtp: function(req, res) {
    const { name, age, gender, mobile_number, email, password } = req.body;
    
    console.log(`📝 Registering user with pre-verified OTP: ${email}`);
    
    // Validate input
    if (!name || !age || !gender || !mobile_number || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Age validation
    if (age < 18 || age > 120) {
      return res.status(400).json({
        success: false,
        message: 'Age must be between 18 and 120 years'
      });
    }
    
    // Check if user already exists by email
    UserModel.findByEmail(email, function(err, existingUser) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      
      // Check if mobile number already exists
      UserModel.findByMobile(mobile_number, function(err, existingMobile) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
          });
        }
        
        if (existingMobile) {
          return res.status(400).json({
            success: false,
            message: 'Mobile number already registered'
          });
        }
        
        // Generate username
        const username = generateUsername(name, email);
        console.log(`👤 Generated username: ${username}`);
        
        // Hash password
        bcrypt.hash(password, 10, function(err, hashedPassword) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Error hashing password'
            });
          }
          
          // Create user
          const userData = {
            name,
            age,
            gender,
            mobile_number,
            email,
            username,
            password_hash: hashedPassword
          };
          
          UserModel.createUser(userData, function(err, newUser) {
            if (err) {
              console.error('❌ Error creating user:', err);
              
              // Check for duplicate mobile number error
              if (err.code === '23505') {
                if (err.constraint === 'users_mobile_number_key') {
                  return res.status(400).json({
                    success: false,
                    message: 'Mobile number already registered'
                  });
                }
                if (err.constraint === 'users_email_key') {
                  return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                  });
                }
                if (err.constraint === 'users_username_key') {
                  return res.status(400).json({
                    success: false,
                    message: 'Username already taken. Please try again.'
                  });
                }
              }
              
              return res.status(500).json({
                success: false,
                message: 'Error creating user',
                error: err.message
              });
            }
            
            // Mark user as verified (since OTP is already verified)
            UserModel.verifyUser(email, function(err) {
              if (err) console.log('Error verifying user:', err);
            });
            
            console.log(`✅ User registered successfully: ${username} (${email})`);
            
            // Send email with username and password
            sendCredentialsEmail(email, username, password, function(err, info) {
              if (err) {
                console.log('Email send error:', err);
              } else {
                console.log(`📧 Credentials email sent to ${email}`);
              }
            });
            
            res.status(201).json({
              success: true,
              message: 'Registration successful! Login details sent to your email.'
            });
          });
        });
      });
    });
  },
  
  // Login with username or email
  loginWithUsername: function(req, res) {
    const { username_or_email, password } = req.body;
    
    console.log(`🔐 Login attempt with: ${username_or_email}`);
    
    if (!username_or_email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/Email and password are required'
      });
    }
    
    // Check if input is email or username
    const isEmail = username_or_email.includes('@');
    
    if (isEmail) {
      // Find by email
      UserModel.findByEmail(username_or_email, function(err, user) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
          });
        }
        
        if (!user) {
          console.log(`❌ User not found: ${username_or_email}`);
          return res.status(401).json({
            success: false,
            message: 'Invalid username/email or password'
          });
        }
        
        handleLogin(user, password, res);
      });
    } else {
      // Find by username
      UserModel.findByUsername(username_or_email, function(err, user) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
          });
        }
        
        if (!user) {
          console.log(`❌ User not found: ${username_or_email}`);
          return res.status(401).json({
            success: false,
            message: 'Invalid username/email or password'
          });
        }
        
        handleLogin(user, password, res);
      });
    }
    
    function handleLogin(user, password, res) {
      // Check if email is verified
      if (!user.is_verified) {
        console.log(`❌ Email not verified: ${user.email}`);
        return res.status(401).json({
          success: false,
          message: 'Please verify your email first'
        });
      }
      
      // Compare password
      bcrypt.compare(password, user.password_hash, function(err, isMatch) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error comparing passwords'
          });
        }
        
        if (!isMatch) {
          console.log(`❌ Invalid password for: ${user.email}`);
          return res.status(401).json({
            success: false,
            message: 'Invalid username/email or password'
          });
        }
        
        console.log(`✅ Login successful for: ${user.email}`);
        
        // Update last login
        UserModel.updateLastLogin(user.id, function(err, result) {
          if (err) {
            console.log('Error updating last login:', err);
          }
        });
        
        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token: token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              username: user.username
            }
          }
        });
      });
    }
  },
  
  // Forgot Password - Send OTP
  forgotPasswordSendOtp: function(req, res) {
    const { username, email } = req.body;
    
    console.log(`🔐 Forgot password request for: ${username} / ${email}`);
    
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username and email are required'
      });
    }
    
    // Check if user exists with matching username and email
    UserModel.findByUsername(username, function(err, user) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this username'
        });
      }
      
      if (user.email !== email) {
        return res.status(400).json({
          success: false,
          message: 'Username and email do not match'
        });
      }
      
      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`🔑 Generated password reset OTP: ${otpCode} for ${email}`);
      
      // Save OTP
      OtpModel.saveOtp(email, otpCode, 'password_reset', function(err, otpRecord) {
        if (err) {
          console.error('❌ Error saving OTP:', err);
          return res.status(500).json({
            success: false,
            message: 'Error saving OTP',
            error: err.message
          });
        }
        
        // Send OTP email
        sendOTPEmail(email, otpCode, function(err, info) {
          if (err) {
            console.error('❌ Email error:', err);
            return res.json({
              success: true,
              message: 'OTP generated. Check console for OTP (email sending failed)',
              otp: process.env.NODE_ENV === 'development' ? otpCode : undefined
            });
          }
          
          console.log(`✅ Password reset OTP sent to ${email}`);
          res.json({
            success: true,
            message: 'OTP sent successfully to your email'
          });
        });
      });
    });
  },
  
  // Forgot Password - Verify OTP
  forgotPasswordVerifyOtp: function(req, res) {
    const { username, email, otp_code } = req.body;
    
    console.log(`🔐 Verifying password reset OTP for: ${email}`);
    
    if (!username || !email || !otp_code) {
      return res.status(400).json({
        success: false,
        message: 'Username, email and OTP are required'
      });
    }
    
    // Verify OTP
    OtpModel.verifyOtp(email, otp_code, 'password_reset', function(err, otpRecord) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (!otpRecord) {
        console.log(`❌ Invalid OTP for ${email}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }
      
      console.log(`✅ Password reset OTP verified for ${email}`);
      
      // Mark OTP as used
      OtpModel.markAsUsed(otpRecord.id, function(err) {
        if (err) console.log('Error marking OTP as used:', err);
      });
      
      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    });
  },
  
  // Reset Password
  resetPassword: function(req, res) {
    const { username, email, new_password } = req.body;
    
    console.log(`🔐 Resetting password for: ${email}`);
    
    if (!username || !email || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email and new password are required'
      });
    }
    
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    
    // Verify user exists
    UserModel.findByUsername(username, function(err, user) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (user.email !== email) {
        return res.status(400).json({
          success: false,
          message: 'Username and email do not match'
        });
      }
      
      // Hash new password
      bcrypt.hash(new_password, 10, function(err, hashedPassword) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error hashing password'
          });
        }
        
        // Update password
        UserModel.updatePassword(user.id, hashedPassword, function(err, result) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Error updating password',
              error: err.message
            });
          }
          
          console.log(`✅ Password reset successful for: ${email}`);
          
          res.json({
            success: true,
            message: 'Password reset successful! You can now login with your new password.'
          });
        });
      });
    });
  },
  
  // Register new user (original flow - kept for compatibility)
  register: function(req, res) {
    const { name, age, gender, mobile_number, email, password } = req.body;
    
    console.log(`📝 Registering user (original flow): ${email}`);
    
    // Validate input
    if (!name || !age || !gender || !mobile_number || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Check if user exists
    UserModel.findByEmail(email, function(err, existingUser) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      
      // Generate username
      const username = generateUsername(name, email);
      
      // Hash password
      bcrypt.hash(password, 10, function(err, hashedPassword) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error hashing password'
          });
        }
        
        // Create user
        const userData = {
          name,
          age,
          gender,
          mobile_number,
          email,
          username,
          password_hash: hashedPassword
        };
        
        UserModel.createUser(userData, function(err, newUser) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Error creating user',
              error: err.message
            });
          }
          
          // Generate OTP
          const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
          console.log(`🔑 Generated OTP for ${email}: ${otpCode}`);
          
          // Save OTP
          OtpModel.saveOtp(email, otpCode, 'registration', function(err, otpRecord) {
            if (err) {
              console.log('OTP save error:', err);
            }
            
            // Send OTP email
            sendOTPEmail(email, otpCode, function(err, info) {
              if (err) {
                console.log('Email send error:', err);
              }
            });
            
            // Return success
            res.status(201).json({
              success: true,
              message: 'Registration successful! Please verify your email with OTP.',
              data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username
              }
            });
          });
        });
      });
    });
  },
  
  // Verify OTP
  verifyOtp: function(req, res) {
    const { email, otp_code } = req.body;
    
    console.log(`🔐 Verifying OTP for ${email}: ${otp_code}`);
    
    if (!email || !otp_code) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }
    
    // Verify OTP
    OtpModel.verifyOtp(email, otp_code, 'registration', function(err, otpRecord) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (!otpRecord) {
        console.log(`❌ Invalid OTP for ${email}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }
      
      console.log(`✅ OTP verified for ${email}`);
      
      // Mark OTP as used
      OtpModel.markAsUsed(otpRecord.id, function(err, result) {
        if (err) {
          console.log('Error marking OTP as used:', err);
        }
      });
      
      // Verify user
      UserModel.verifyUser(email, function(err, verifiedUser) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error verifying user',
            error: err.message
          });
        }
        
        res.json({
          success: true,
          message: 'Email verified successfully! You can now login.'
        });
      });
    });
  },
  
  // Resend OTP
  resendOtp: function(req, res) {
    const { email } = req.body;
    
    console.log(`🔄 Resending OTP to: ${email}`);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Check if user exists
    UserModel.findByEmail(email, function(err, user) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if already verified
      if (user.is_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified'
        });
      }
      
      // Generate new OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`🔑 Generated new OTP: ${otpCode}`);
      
      // Save OTP
      OtpModel.saveOtp(email, otpCode, 'registration', function(err, otpRecord) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error saving OTP',
            error: err.message
          });
        }
        
        // Send OTP email
        sendOTPEmail(email, otpCode, function(err, info) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Error sending email',
              error: err.message
            });
          }
          
          res.json({
            success: true,
            message: 'OTP sent successfully to your email'
          });
        });
      });
    });
  },
  
  // Login user (original - email only)
  login: function(req, res) {
    const { email, password } = req.body;
    
    console.log(`🔐 Login attempt for: ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user by email
    UserModel.findByEmail(email, function(err, user) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Check if email is verified
      if (!user.is_verified) {
        console.log(`❌ Email not verified: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Please verify your email first'
        });
      }
      
      // Compare password
      bcrypt.compare(password, user.password_hash, function(err, isMatch) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error comparing passwords'
          });
        }
        
        if (!isMatch) {
          console.log(`❌ Invalid password for: ${email}`);
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
          });
        }
        
        console.log(`✅ Login successful for: ${email}`);
        
        // Update last login
        UserModel.updateLastLogin(user.id, function(err, result) {
          if (err) {
            console.log('Error updating last login:', err);
          }
        });
        
        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token: token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              username: user.username
            }
          }
        });
      });
    });
  },
  
  // Register with OTP verification (for backward compatibility)
  registerWithOtp: function(req, res) {
    const { name, age, gender, mobile_number, email, password, otp_code } = req.body;
    
    console.log(`📝 Registering user with OTP: ${email}`);
    
    // Validate input
    if (!name || !age || !gender || !mobile_number || !email || !password || !otp_code) {
      return res.status(400).json({
        success: false,
        message: 'All fields including OTP are required'
      });
    }
    
    // Verify OTP first
    OtpModel.verifyOtp(email, otp_code, 'registration', function(err, otpRecord) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }
      
      // Mark OTP as used
      OtpModel.markAsUsed(otpRecord.id, function(err) {
        if (err) console.log('Error marking OTP as used:', err);
      });
      
      // Check if user already exists
      UserModel.findByEmail(email, function(err, existingUser) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }
        
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already registered'
          });
        }
        
        // Generate username
        const username = generateUsername(name, email);
        
        // Hash password
        bcrypt.hash(password, 10, function(err, hashedPassword) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Error hashing password'
            });
          }
          
          // Create user
          const userData = {
            name,
            age,
            gender,
            mobile_number,
            email,
            username,
            password_hash: hashedPassword
          };
          
          UserModel.createUser(userData, function(err, newUser) {
            if (err) {
              return res.status(500).json({
                success: false,
                message: 'Error creating user',
                error: err.message
              });
            }
            
            // Verify user automatically
            UserModel.verifyUser(email, function(err) {
              if (err) console.log('Error verifying user:', err);
            });
            
            // Send credentials email
            sendCredentialsEmail(email, username, password, function(err, info) {
              if (err) {
                console.log('Email send error:', err);
              }
            });
            
            res.status(201).json({
              success: true,
              message: 'Registration successful! Login details sent to your email.',
              data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                username: username
              }
            });
          });
        });
      });
    });
  }
};

module.exports = AuthController;