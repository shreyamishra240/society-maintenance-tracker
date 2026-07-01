-- Society Maintenance Tracker - Database Schema
-- Run this file in PostgreSQL to create all tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (residents)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  flat_number VARCHAR(20) NOT NULL,
  role VARCHAR(20) DEFAULT 'resident' CHECK (role IN ('resident', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Plumbing', 'Electrical', 'Lift', 'Cleaning', 'Security', 'Other')),
  description TEXT NOT NULL,
  photo_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  priority VARCHAR(10) DEFAULT 'Low' CHECK (priority IN ('Low', 'Medium', 'High')),
  is_overdue BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Complaint status history (every change recorded)
CREATE TABLE IF NOT EXISTS complaint_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id),
  actor_name VARCHAR(100),
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  note TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Notices table
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT FALSE,
  posted_at TIMESTAMP DEFAULT NOW()
);

-- Default admin account (password: admin123)
INSERT INTO users (name, email, password_hash, flat_number, role)
VALUES (
  'Society Admin',
  'admin@society.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'ADMIN',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_user ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_history_complaint ON complaint_history(complaint_id);
