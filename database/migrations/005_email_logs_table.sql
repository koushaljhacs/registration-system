-- ============================================================================
-- MIGRATION: 005_email_logs_table.sql
-- DESCRIPTION: Creates the email logs table for tracking email communications
-- ============================================================================

-- ============================================================================
-- TABLE: email_logs
-- PURPOSE: Stores all email communications sent to users for tracking and debugging
-- ============================================================================

-- Create email_logs table with IF NOT EXISTS
CREATE TABLE IF NOT EXISTS email_logs (
    -- Auto-incrementing primary key using BIGSERIAL
    id BIGSERIAL PRIMARY KEY,
    
    -- Recipient email address
    email_to VARCHAR(255) NOT NULL,
    
    -- Type of email sent
    email_type VARCHAR(50) NOT NULL CHECK (email_type IN ('registration', 'otp', 'credentials', 'password_reset', 'welcome')),
    
    -- Email subject line
    subject VARCHAR(255) NOT NULL,
    
    -- Email body content
    content TEXT NOT NULL,
    
    -- Delivery status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    
    -- Error message if delivery failed
    error_message TEXT,
    
    -- Actual timestamp when email was sent
    sent_at TIMESTAMP,
    
    -- Record creation timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES for email_logs table
-- ============================================================================

-- Index on email_to for finding all emails sent to a specific recipient
CREATE INDEX IF NOT EXISTS idx_email_to ON email_logs(email_to);

-- Index on email_type for filtering by email type
CREATE INDEX IF NOT EXISTS idx_email_type ON email_logs(email_type);

-- Index on status for tracking pending and failed emails
CREATE INDEX IF NOT EXISTS idx_email_status ON email_logs(status);

-- Index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_email_created_at ON email_logs(created_at);

-- Index on sent_at for tracking delivery times
CREATE INDEX IF NOT EXISTS idx_email_sent_at ON email_logs(sent_at);

-- Composite index for email_to and email_type for finding specific email types for a user
CREATE INDEX IF NOT EXISTS idx_email_to_type ON email_logs(email_to, email_type);

-- Composite index for status and created_at for monitoring pending emails
CREATE INDEX IF NOT EXISTS idx_email_status_created ON email_logs(status, created_at);

-- Composite index for email_to and created_at for user email timeline
CREATE INDEX IF NOT EXISTS idx_email_to_created ON email_logs(email_to, created_at);

-- ============================================================================
-- TABLE AND COLUMN COMMENTS
-- ============================================================================

COMMENT ON TABLE email_logs IS 'Stores all email communications sent to users for tracking, debugging, and compliance';

COMMENT ON COLUMN email_logs.id IS 'Auto-incrementing unique identifier for each email log entry';

COMMENT ON COLUMN email_logs.email_to IS 'Recipient email address where the email was sent';

COMMENT ON COLUMN email_logs.email_type IS 'Type of email sent (registration, otp, credentials, password_reset, welcome)';

COMMENT ON COLUMN email_logs.subject IS 'Subject line of the email';

COMMENT ON COLUMN email_logs.content IS 'Complete body content of the email';

COMMENT ON COLUMN email_logs.status IS 'Delivery status: pending, sent, failed, or bounced';

COMMENT ON COLUMN email_logs.error_message IS 'Error details if email delivery failed';

COMMENT ON COLUMN email_logs.sent_at IS 'Actual timestamp when email was successfully sent';

COMMENT ON COLUMN email_logs.created_at IS 'Timestamp when email record was created in database';

-- ============================================================================
-- MIGRATION COMPLETED
-- Next migration: 006_password_resets_table.sql
-- ============================================================================