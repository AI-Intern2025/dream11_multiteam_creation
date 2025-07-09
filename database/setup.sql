-- Simplified user management for JWT-based auth
-- Run these commands in your Neon database console

-- Users table for role management
CREATE TABLE IF NOT EXISTS users (
  id TEXT NOT NULL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- OPTIONAL: Insert a default admin user (replace with your email)
-- You can either:
-- 1. Uncomment and use your email below for initial admin access
-- 2. Skip this and promote users to admin after they sign in using the admin panel

-- Insert okambre2@gmail.com as admin
INSERT INTO users (id, email, role, name) 
VALUES (
  'admin-okambre2', 
  'okambre2@gmail.com', 
  'admin', 
  'Admin User'
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Alternative: Add multiple admin users at once:
-- INSERT INTO users (id, email, role, name) 
-- VALUES 
--   ('admin-1', 'admin1@gmail.com', 'admin', 'Admin 1'),
--   ('admin-2', 'admin2@gmail.com', 'admin', 'Admin 2'),
--   ('admin-3', 'admin3@gmail.com', 'admin', 'Admin 3')
-- ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Grant appropriate permissions (adjust as needed for your Neon setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
