-- ============================================================================
-- MIGRATION: 003_user_sessions_table.sql
-- DESCRIPTION: Creates the user sessions table for session management
-- ============================================================================

-- ============================================================================
-- TABLE: user_sessions
-- PURPOSE: Stores user session information for authentication
-- ============================================================================

-- Create user_sessions table with IF NOT EXISTS
CREATE TABLE IF NOT EXISTS user_sessions (
    -- Primary identifier using UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference to user who owns this session
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session token (JWT)
    token VARCHAR(500) NOT NULL UNIQUE,
    
    -- Device information (browser, OS, device type)
    device_info JSONB,
    
    -- IP address of the user
    ip_address INET,
    
    -- Session expiration timestamp
    expires_at TIMESTAMP NOT NULL,
    
    -- Active session status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Session creation timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Last activity timestamp
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES for user_sessions table
-- ============================================================================

-- Index on user_id for finding all sessions of a user
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);

-- Index on token for fast lookup during authentication
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token);

-- Index on expires_at for cleaning up expired sessions
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);

-- Index on is_active for filtering active sessions
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON user_sessions(is_active);

-- Composite index for user_id and is_active for finding active sessions of a user
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON user_sessions(user_id, is_active);

-- Composite index for token and is_active for validating active sessions
CREATE INDEX IF NOT EXISTS idx_sessions_token_active ON user_sessions(token, is_active);

-- Index on last_activity for cleaning up inactive sessions
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON user_sessions(last_activity);

-- ============================================================================
-- TABLE AND COLUMN COMMENTS
-- ============================================================================

COMMENT ON TABLE user_sessions IS 'Stores user session information for authentication and session management';

COMMENT ON COLUMN user_sessions.id IS 'Unique UUID identifier for each session record';

COMMENT ON COLUMN user_sessions.user_id IS 'Reference to the user who owns this session - foreign key to users table';

COMMENT ON COLUMN user_sessions.token IS 'JWT session token - must be unique for security';

COMMENT ON COLUMN user_sessions.device_info IS 'JSONB field storing device information including browser, OS, device type, and user agent';

COMMENT ON COLUMN user_sessions.ip_address IS 'IP address of the user when session was created';

COMMENT ON COLUMN user_sessions.expires_at IS 'Timestamp when session expires - typically 7 days from creation';

COMMENT ON COLUMN user_sessions.is_active IS 'Flag indicating if session is currently active - false for logged out or expired sessions';

COMMENT ON COLUMN user_sessions.created_at IS 'Timestamp when session was created';

COMMENT ON COLUMN user_sessions.last_activity IS 'Timestamp of user''s last activity in this session';

-- ============================================================================
-- MIGRATION COMPLETED
-- Next migration: 004_audit_logs_table.sql
-- ============================================================================