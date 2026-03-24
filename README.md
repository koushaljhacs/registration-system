# 🚀 Registration System

A Complete User Authentication System with OTP Verification

Live Demo: https://koushaljhacs.github.io/registration-system/

================================================================================
TABLE OF CONTENTS
================================================================================

1. About The Project
2. Features
3. Tech Stack
4. Live Demo
5. Project Structure
6. Installation
7. API Endpoints
8. Environment Variables
9. Frontend Pages
10. Testing
11. Contributing
12. License
13. Author

================================================================================
1. ABOUT THE PROJECT
================================================================================

Registration System is a complete user authentication and management system built 
with Node.js, Express, and PostgreSQL. It provides secure user registration with 
OTP email verification, JWT-based authentication, and a responsive frontend interface.

Why This Project?
- Secure: Passwords are hashed with bcrypt, OTP verification ensures email authenticity
- Fast: Lightweight Express.js backend with optimized database queries
- Responsive: Beautiful frontend that works on all devices
- Complete: Full authentication flow from registration to password reset
- Email Integration: Automatic OTP and credentials emails via Gmail SMTP

================================================================================
2. FEATURES
================================================================================

Authentication:
- User Registration with OTP Verification
- Email Verification via 6-digit OTP
- Login with Username or Email
- JWT Token Authentication
- Secure Password Hashing with bcrypt

Password Management:
- Forgot Password with OTP Verification
- Secure Password Reset Flow
- Password Confirmation Validation

User Features:
- Auto-generated Unique Username
- User Dashboard with Profile Details
- Last Login Tracking
- Soft Delete (Account Deactivation)

Email Features:
- OTP Email for Registration
- Credentials Email with Username & Password
- Password Reset OTP Email
- Beautiful HTML Email Templates

Security:
- Helmet.js for Security Headers
- CORS Protection
- Rate Limiting (100 requests per 15 minutes)
- SQL Injection Protection
- XSS Protection

================================================================================
3. TECH STACK
================================================================================

Backend:
- Node.js 18.x - JavaScript Runtime
- Express.js 5.x - Web Framework
- PostgreSQL 14.x - Database
- JWT 9.x - Authentication
- bcrypt 6.x - Password Hashing
- Nodemailer 8.x - Email Sending

Frontend:
- HTML5 - Structure
- CSS3 - Styling
- JavaScript (Vanilla) ES6 - Interactivity
- Fetch API - HTTP Requests

Database Schema:
- users - User accounts and profiles
- otp_verifications - OTP codes for verification
- user_sessions - JWT session management
- audit_logs - User activity tracking
- email_logs - Email communication logs
- password_resets - Password reset tokens

================================================================================
4. LIVE DEMO
================================================================================

Frontend: https://koushaljhacs.github.io/registration-system/
Backend API: http://100.88.168.61:4001/api

Test Credentials:
- Username: testuser123456
- Email: test@example.com
- Password: test123

================================================================================
5. PROJECT STRUCTURE
================================================================================

registration-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── models/
│   │   │   ├── userModel.js
│   │   │   └── otpModel.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── userRoutes.js
│   │   └── utils/
│   │       ├── generateUsername.js
│   │       └── sendEmail.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── database/
│   ├── 001_users_table.sql
│   ├── 002_otp_verifications_table.sql
│   ├── 003_user_sessions_table.sql
│   ├── 004_audit_logs_table.sql
│   ├── 005_email_logs_table.sql
│   └── 006_password_resets_table.sql
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── register.js
│   │   ├── login.js
│   │   ├── dashboard.js
│   │   └── forgot-password.js
│   ├── index.html
│   ├── register.html
│   ├── login.html
│   ├── dashboard.html
│   └── forgot-password.html
│
├── README.md
└── .gitignore

================================================================================
6. INSTALLATION
================================================================================

Prerequisites:
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Gmail Account (for email services)

Step 1: Clone the Repository
git clone https://github.com/koushaljhacs/registration-system.git
cd registration-system

Step 2: Install Backend Dependencies
cd backend
npm install

Step 3: Configure Environment Variables
cp .env.example .env
Edit .env with your credentials

.env Configuration:
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=registration_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server
PORT=4001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password

Step 4: Setup Database
createdb registration_db

psql -U your_user -d registration_db -f database/001_users_table.sql
psql -U your_user -d registration_db -f database/002_otp_verifications_table.sql
psql -U your_user -d registration_db -f database/003_user_sessions_table.sql
psql -U your_user -d registration_db -f database/004_audit_logs_table.sql
psql -U your_user -d registration_db -f database/005_email_logs_table.sql
psql -U your_user -d registration_db -f database/006_password_resets_table.sql

Step 5: Start the Server
# Development mode (auto-restart)
npm run dev

# Production mode
npm start

Step 6: Access the Application
Frontend: http://localhost:4001
Backend API: http://localhost:4001/api

================================================================================
7. API ENDPOINTS
================================================================================

Authentication:
POST   /api/auth/send-otp                      Send OTP to email
POST   /api/auth/verify-otp-only               Verify OTP
POST   /api/auth/register-with-verified-otp    Register new user
POST   /api/auth/login-with-username           Login with username/email
POST   /api/auth/login                         Login with email

Password Management:
POST   /api/auth/forgot-password-send-otp      Send OTP for reset
POST   /api/auth/forgot-password-verify-otp    Verify OTP for reset
POST   /api/auth/reset-password                Reset password

User Management (Protected):
GET    /api/user/profile                       Get user profile
GET    /api/user/dashboard                     Get dashboard data

Example Requests:

1. Send OTP
curl -X POST http://localhost:4001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

2. Verify OTP
curl -X POST http://localhost:4001/api/auth/verify-otp-only \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp_code":"123456"}'

3. Register User
curl -X POST http://localhost:4001/api/auth/register-with-verified-otp \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "age":25,
    "gender":"Male",
    "mobile_number":"9876543210",
    "email":"user@example.com",
    "password":"password123"
  }'

4. Login
curl -X POST http://localhost:4001/api/auth/login-with-username \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"user@example.com","password":"password123"}'

================================================================================
8. ENVIRONMENT VARIABLES
================================================================================

Variable              | Description           | Required | Default
----------------------|-----------------------|----------|-----------------
DB_HOST               | Database host         | Yes      | localhost
DB_PORT               | Database port         | Yes      | 5432
DB_NAME               | Database name         | Yes      | registration_db
DB_USER               | Database user         | Yes      | -
DB_PASSWORD           | Database password     | Yes      | -
PORT                  | Server port           | No       | 4001
JWT_SECRET            | JWT secret key        | Yes      | -
EMAIL_USER            | Gmail email           | Yes      | -
EMAIL_APP_PASSWORD    | Gmail app password    | Yes      | -
FRONTEND_URL          | Frontend URL          | No       | http://localhost:4001
NODE_ENV              | Environment           | No       | development

================================================================================
9. FRONTEND PAGES
================================================================================

Page              | URL                    | Description
------------------|------------------------|-------------------------
Home              | /                      | Landing page with features
Register          | /register              | User registration with OTP
Login             | /login                 | Login with username/email
Dashboard         | /dashboard             | User dashboard (protected)
Forgot Password   | /forgot-password       | Password reset flow

================================================================================
10. TESTING
================================================================================

Test Registration Flow:

1. Send OTP
curl -X POST http://localhost:4001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

2. Verify OTP (check console for OTP code)
curl -X POST http://localhost:4001/api/auth/verify-otp-only \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp_code":"123456"}'

3. Register
curl -X POST http://localhost:4001/api/auth/register-with-verified-otp \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "age":25,
    "gender":"Male",
    "mobile_number":"9876543210",
    "email":"test@example.com",
    "password":"test123"
  }'

Test Login Flow:

# Login with email
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Login with username
curl -X POST http://localhost:4001/api/auth/login-with-username \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"testuser123","password":"test123"}'

Test Protected Routes:

# Get dashboard (with token)
curl -X GET http://localhost:4001/api/user/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

================================================================================
11. CONTRIBUTING
================================================================================

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

================================================================================
12. LICENSE
================================================================================

This project is licensed under the ISC License.

================================================================================
13. AUTHOR
================================================================================

Koushal Jha
- GitHub: https://github.com/koushaljhacs
- Email: koushal2023@gmail.com
- Live Demo: https://koushaljhacs.github.io/registration-system/

================================================================================
ACKNOWLEDGMENTS
================================================================================

- Express.js - Web framework
- PostgreSQL - Database
- JWT - Authentication
- Nodemailer - Email service
- bcrypt - Password hashing

================================================================================

Made with ❤️ by Koushal

================================================================================