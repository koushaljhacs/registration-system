const UserModel = require('../models/userModel');

const UserController = {
  // Get user profile
  getProfile: function(req, res) {
    const userId = req.userId;
    
    UserModel.findById(userId, function(err, user) {
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
      
      res.json({
        success: true,
        data: user
      });
    });
  },
  
  // Get dashboard data
  getDashboard: function(req, res) {
    const userId = req.userId;
    
    UserModel.findById(userId, function(err, user) {
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
      
      res.json({
        success: true,
        data: {
          user: user,
          message: `Welcome to your dashboard, ${user.name}!`,
          loginTime: new Date().toISOString()
        }
      });
    });
  }
};

module.exports = UserController;