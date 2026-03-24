const db = require('../config/db');

const OtpModel = {
  // Save OTP
  saveOtp: function(email, otpCode, type, callback) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(process.env.OTP_EXPIRY_MINUTES || 10));
    
    const query = `
      INSERT INTO otp_verifications (email, otp_code, otp_type, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, expires_at
    `;
    
    const values = [email, otpCode, type, expiresAt];
    
    db.query(query, values, function(err, result) {
      if (err) {
        console.error('Error saving OTP:', err);
        return callback(err, null);
      }
      callback(null, result.rows[0]);
    });
  },
  
  // Verify OTP
  verifyOtp: function(email, otpCode, type, callback) {
    const query = `
      SELECT * FROM otp_verifications 
      WHERE email = $1 
        AND otp_code = $2 
        AND otp_type = $3 
        AND is_used = false 
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    db.query(query, [email, otpCode, type], function(err, result) {
      if (err) {
        return callback(err, null);
      }
      
      if (result.rows.length === 0) {
        return callback(null, null);
      }
      
      callback(null, result.rows[0]);
    });
  },
  
  // Mark OTP as used
  markAsUsed: function(otpId, callback) {
    const query = 'UPDATE otp_verifications SET is_used = true WHERE id = $1';
    
    db.query(query, [otpId], function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, true);
    });
  },
  
  // Increment attempts
  incrementAttempts: function(otpId, callback) {
    const query = 'UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1';
    
    db.query(query, [otpId], function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, true);
    });
  }
};

module.exports = OtpModel;