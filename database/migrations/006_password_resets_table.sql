-- ============================================================================
-- MIGRATION: 006_password_resets_table.sql
-- DESCRIPTION: Creates the password resets table for managing password reset requests
-- ============================================================================

-- ============================================================================
-- TABLE: password_resets
-- PURPOSE: Stores password reset tokens for users who forgot their password
-- ============================================================================

-- Create password_resets table with IF NOT EXISTS
CREATE TABLE IF NOT EXISTS password_resets (
    -- Primary identifier using UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference to user requesting password reset
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Secure reset token
    reset_token VARCHAR(255) NOT NULL UNIQUE,
    
    -- Token expiration timestamp
    expires_at TIMESTAMP NOT NULL,
    
    -- Whether token has been used
    is_used BOOLEAN DEFAULT FALSE,
    
    -- Request creation timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES for password_resets table
-- ============================================================================

-- Index on user_id for finding all reset requests for a user
CREATE INDEX IF NOT EXISTS idx_resets_user_id ON password_resets(user_id);

-- Index on reset_token for fast lookup during password reset
CREATE INDEX IF NOT EXISTS idx_resets_token ON password_resets(reset_token);

-- Index on expires_at for cleaning up expired tokens
CREATE INDEX IF NOT EXISTS idx_resets_expires_at ON password_resets(expires_at);

-- Index on is_used for filtering unused tokens
CREATE INDEX IF NOT EXISTS idx_resets_is_used ON password_resets(is_used);

-- Composite index for user_id and is_used for finding unused tokens for a user
CREATE INDEX IF NOT EXISTS idx_resets_user_unused ON password_resets(user_id, is_used);

-- Composite index for token and is_used for validating unused tokens
CREATE INDEX IF NOT EXISTS idx_resets_token_unused ON password_resets(reset_token, is_used);

-- Composite index for token and expires_at for validating non-expired tokens
CREATE INDEX IF NOT EXISTS idx_resets_token_expires ON password_resets(reset_token, expires_at);

-- ============================================================================
-- TABLE AND COLUMN COMMENTS
-- ============================================================================

COMMENT ON TABLE password_resets IS 'Stores password reset tokens for users who request password reset';

COMMENT ON COLUMN password_resets.id IS 'Unique UUID identifier for each password reset record';

COMMENT ON COLUMN password_resets.user_id IS 'Reference to the user requesting password reset - foreign key to users table';

COMMENT ON COLUMN password_resets.reset_token IS 'Secure unique token used to verify password reset request';

COMMENT ON COLUMN password_resets.expires_at IS 'Timestamp when reset token expires - typically 1 hour from creation';

COMMENT ON COLUMN password_resets.is_used IS 'Flag indicating if reset token has been used to change password';

COMMENT ON COLUMN password_resets.created_at IS 'Timestamp when password reset request was created';

-- ============================================================================
-- MIGRATION COMPLETED
-- ============================================================================