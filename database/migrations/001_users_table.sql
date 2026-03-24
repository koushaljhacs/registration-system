-- ============================================================================
-- MIGRATION: 001_users_table.sql
-- DESCRIPTION: Creates the users table for registration system
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: users
-- ============================================================================

-- Create users table with IF NOT EXISTS
CREATE TABLE IF NOT EXISTS users (
    -- Primary identifier using UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User's full name - required field
    name VARCHAR(100) NOT NULL,
    
    -- Age with validation (18-120 years)
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 120),
    
    -- Gender with predefined allowed values
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    
    -- Mobile number with country code
    mobile_number VARCHAR(15) NOT NULL UNIQUE,
    
    -- Email address - used for login
    email VARCHAR(255) NOT NULL UNIQUE,
    
    -- Auto-generated username for login
    username VARCHAR(50) NOT NULL UNIQUE,
    
    -- Hashed password storage
    password_hash VARCHAR(255) NOT NULL,
    
    -- Email verification status
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Soft delete flag
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- INDEXES for users table
-- ============================================================================

-- Index on name for faster search
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- Index on is_verified for filtering
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);

-- Index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Composite index for active and verified users
CREATE INDEX IF NOT EXISTS idx_users_active_verified ON users(is_active, is_verified);

-- ============================================================================
-- TABLE AND COLUMN COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Stores all registered user accounts with authentication and profile information';

COMMENT ON COLUMN users.id IS 'Unique UUID identifier for each user - primary key';

COMMENT ON COLUMN users.name IS 'User''s full name as provided during registration';

COMMENT ON COLUMN users.age IS 'User''s age - must be between 18 and 120 years';

COMMENT ON COLUMN users.gender IS 'User''s gender preference from predefined list (Male, Female, Other, Prefer not to say)';

COMMENT ON COLUMN users.mobile_number IS 'Mobile number with country code - unique per user';

COMMENT ON COLUMN users.email IS 'Email address - used for login and communication - must be unique';

COMMENT ON COLUMN users.username IS 'Auto-generated username for login - unique identifier';

COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password - never store plain text passwords';

COMMENT ON COLUMN users.is_verified IS 'Flag indicating if email has been verified via OTP';

COMMENT ON COLUMN users.created_at IS 'Timestamp when user account was created';

COMMENT ON COLUMN users.updated_at IS 'Timestamp when user account was last modified';

COMMENT ON COLUMN users.last_login IS 'Timestamp of user''s most recent login';

COMMENT ON COLUMN users.is_active IS 'Soft delete flag - false means account is deactivated';

-- ============================================================================
-- MIGRATION COMPLETED
-- ============================================================================