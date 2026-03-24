-- ============================================================================
-- MIGRATION: 004_audit_logs_table.sql
-- DESCRIPTION: Creates the audit logs table for tracking user activities
-- ============================================================================

-- ============================================================================
-- TABLE: audit_logs
-- PURPOSE: Stores audit trail of all user actions for security and debugging
-- ============================================================================

-- Create audit_logs table with IF NOT EXISTS
CREATE TABLE IF NOT EXISTS audit_logs (
    -- Auto-incrementing primary key using BIGSERIAL
    id BIGSERIAL PRIMARY KEY,
    
    -- Reference to user who performed the action
    -- ON DELETE SET NULL preserves audit logs even if user is deleted
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Type of action performed
    action VARCHAR(50) NOT NULL,
    
    -- Type of entity affected (user, session, etc.)
    entity_type VARCHAR(50),
    
    -- Identifier of affected entity
    entity_id VARCHAR(255),
    
    -- Previous state before change (JSON format)
    old_data JSONB,
    
    -- New state after change (JSON format)
    new_data JSONB,
    
    -- IP address of the request
    ip_address INET,
    
    -- Browser/device information
    user_agent TEXT,
    
    -- Log creation timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES for audit_logs table
-- ============================================================================

-- Index on user_id for finding all actions of a specific user
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);

-- Index on action for filtering by action type
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- Index on created_at for time-based queries and reporting
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);

-- Index on entity_type and entity_id for finding actions on specific entities
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);

-- Composite index for user_id and created_at for user activity timeline
CREATE INDEX IF NOT EXISTS idx_audit_user_created ON audit_logs(user_id, created_at);

-- Composite index for action and created_at for filtered time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_action_created ON audit_logs(action, created_at);

-- Index on ip_address for security analysis
CREATE INDEX IF NOT EXISTS idx_audit_ip_address ON audit_logs(ip_address);

-- ============================================================================
-- TABLE AND COLUMN COMMENTS
-- ============================================================================

COMMENT ON TABLE audit_logs IS 'Stores audit trail of all user actions for security monitoring, debugging, and compliance';

COMMENT ON COLUMN audit_logs.id IS 'Auto-incrementing unique identifier for each audit log entry';

COMMENT ON COLUMN audit_logs.user_id IS 'Reference to the user who performed the action - NULL if user deleted';

COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (e.g., CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VERIFY_OTP)';

COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected (e.g., user, session, password)';

COMMENT ON COLUMN audit_logs.entity_id IS 'Identifier of the entity affected by the action';

COMMENT ON COLUMN audit_logs.old_data IS 'Previous state of the entity before the change (JSON format)';

COMMENT ON COLUMN audit_logs.new_data IS 'New state of the entity after the change (JSON format)';

COMMENT ON COLUMN audit_logs.ip_address IS 'IP address from which the request originated';

COMMENT ON COLUMN audit_logs.user_agent IS 'Browser and device information from the request';

COMMENT ON COLUMN audit_logs.created_at IS 'Timestamp when the action was performed';

-- ============================================================================
-- MIGRATION COMPLETED
-- Next migration: 005_email_logs_table.sql
-- ============================================================================