const db = require('../config/db');
const bcrypt = require('bcrypt');

const UserModel = {
  // Create new user
  createUser: function(userData, callback) {
    const { name, age, gender, mobile_number, email, username, password_hash } = userData;
    
    const query = `
      INSERT INTO users (name, age, gender, mobile_number, email, username, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, username, created_at
    `;
    
    const values = [name, age, gender, mobile_number, email, username, password_hash];
    
    db.query(query, values, function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows[0]);
    });
  },
  
  // Find user by email
  findByEmail: function(email, callback) {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    
    db.query(query, [email], function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows[0]);
    });
  },
  
  // Find user by username
  findByUsername: function(username, callback) {
    const query = 'SELECT * FROM users WHERE username = $1 AND is_active = true';
    
    db.query(query, [username], function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows[0]);
    });
  },
  
  // Find user by mobile number
  findByMobile: function(mobile_number, callback) {
    const query = 'SELECT * FROM users WHERE mobile_number = $1 AND is_active = true';
    
    db.query(query, [mobile_number], function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows[0]);
    });
  },
  
  // Find user by id
  findById: function(id, callback) {
    const query = 'SELECT id, name, email, username, age, gender, mobile_number, is_verified, created_at FROM users WHERE id = $1 AND is_active = true';
    
    db.query(query, [id], function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows[0]);
    });
  },
  
  // Update user verification status
  verifyUser: function(email, callback) {
    const query = 'UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE email = $1 RETURNING id, email';
    
    db.query(query, [email], function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows[0]);
    });
  },
  
  // Update last login time
  updateLastLogin: function(userId, callback) {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
    
    db.query(query, [userId], function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, true);
    });
  },
  
  // Update user password
  updatePassword: function(userId, hashedPassword, callback) {
    const query = 'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    
    db.query(query, [hashedPassword, userId], function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, true);
    });
  }
};

module.exports = UserModel;