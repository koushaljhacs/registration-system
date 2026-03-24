const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 4001;

// Custom logging middleware
app.use(function(req, res, next) {
  const start = Date.now();
  console.log(`\n📨 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`📡 Headers:`, req.headers);
  
  // Log request body for POST requests
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (body) {
        console.log(`📦 Request Body:`, body);
      }
    });
  }
  
  // Capture response
  const oldJson = res.json;
  res.json = function(data) {
    console.log(`✅ Response:`, JSON.stringify(data, null, 2));
    oldJson.call(this, data);
  };
  
  const oldSend = res.send;
  res.send = function(data) {
    console.log(`✅ Response (send):`, data);
    oldSend.call(this, data);
  };
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`⏱️  ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for easier development
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate limiting for API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Home route - serve index.html
app.get('/', function(req, res) {
  console.log('🏠 Serving index.html');
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Handle all other routes for frontend
app.get('/register', function(req, res) {
  console.log('📝 Serving register.html');
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/login', function(req, res) {
  console.log('🔐 Serving login.html');
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/dashboard', function(req, res) {
  console.log('📊 Serving dashboard.html');
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// 404 handler
app.use(function(req, res) {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(function(err, req, res, next) {
  console.error(`🔥 ERROR: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', function() {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 SERVER STARTED SUCCESSFULLY`);
  console.log('='.repeat(60));
  console.log(`📡 Server running on: http://100.88.168.61:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📝 API Endpoints:`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/verify-otp`);
  console.log(`   POST   /api/auth/resend-otp`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/user/profile`);
  console.log(`   GET    /api/user/dashboard`);
  console.log(`\n📄 Frontend Pages:`);
  console.log(`   Home:     http://100.88.168.61:${PORT}`);
  console.log(`   Register: http://100.88.168.61:${PORT}/register`);
  console.log(`   Login:    http://100.88.168.61:${PORT}/login`);
  console.log(`   Dashboard: http://100.88.168.61:${PORT}/dashboard`);
  console.log('='.repeat(60) + '\n');
});