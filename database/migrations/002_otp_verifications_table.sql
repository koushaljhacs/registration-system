-- ============================================================================
-- MIGRATION: 002_otp_verifications_table.sql
-- DESCRIPTION: Creates the OTP verifications table for email verification
-- ============================================================================

-- ============================================================================
-- TABLE: otp_verifications
-- PURPOSE: Stores OTP codes for email verification during registration
-- ============================================================================

-- Create otp_verifications table with IF NOT EXISTS
CREATE TABLE IF NOT EXISTS otp_verifications (
    -- Primary identifier using UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Email address associated with OTP
    -- References users table email column
    email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    
    -- 6-digit OTP code
    otp_code VARCHAR(6) NOT NULL,
    
    -- Type of OTP verification
    otp_type VARCHAR(20) NOT NULL CHECK (otp_type IN ('registration', 'password_reset', 'login')),
    
    -- Expiration timestamp (OTP valid for 10 minutes)
    expires_at TIMESTAMP NOT NULL,
    
    -- Whether OTP has been used
    is_used BOOLEAN DEFAULT FALSE,
    
    -- Number of verification attempts
    attempts INTEGER DEFAULT 0,
    
    -- Creation timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES for otp_verifications table
-- ============================================================================

-- Index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);

-- Index on expires_at for cleaning up expired OTPs
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_verifications(expires_at);

-- Index on is_used for filtering unused OTPs
CREATE INDEX IF NOT EXISTS idx_otp_is_used ON otp_verifications(is_used);

-- Composite index for email and is_used for faster OTP validation
CREATE INDEX IF NOT EXISTS idx_otp_email_is_used ON otp_verifications(email, is_used);

-- Composite index for email and expires_at for checking valid OTPs
CREATE INDEX IF NOT EXISTS idx_otp_email_expires_at ON otp_verifications(email, expires_at);

-- ============================================================================
-- TABLE AND COLUMN COMMENTS
-- ============================================================================

COMMENT ON TABLE otp_verifications IS 'Stores OTP codes for email verification during registration and other verification processes';

COMMENT ON COLUMN otp_verifications.id IS 'Unique UUID identifier for each OTP record';

COMMENT ON COLUMN otp_verifications.email IS 'Email address associated with this OTP - references users table';

COMMENT ON COLUMN otp_verifications.otp_code IS '6-digit numeric OTP code sent to user email';

COMMENT ON COLUMN otp_verifications.otp_type IS 'Type of verification: registration, password_reset, or login';

COMMENT ON COLUMN otp_verifications.expires_at IS 'Timestamp when OTP expires - typically 10 minutes from creation';

COMMENT ON COLUMN otp_verifications.is_used IS 'Flag indicating if OTP has been used for verification';

COMMENT ON COLUMN otp_verifications.attempts IS 'Number of failed verification attempts made with this OTP';

COMMENT ON COLUMN otp_verifications.created_at IS 'Timestamp when OTP was created';

-- ============================================================================
-- MIGRATION COMPLETED
-- Next migration: 003_user_sessions_table.sql
-- ============================================================================