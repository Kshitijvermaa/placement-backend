-- ============================================
-- Placement Management System - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS placement_db;
USE placement_db;

-- 1. USERS (auth for both students and admins)
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. STUDENTS (academic profile, one per student user)
CREATE TABLE students (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL UNIQUE,
  reg_number  VARCHAR(50) NOT NULL UNIQUE,
  branch      VARCHAR(50) NOT NULL,
  cgpa        DECIMAL(4,2) NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
  backlogs    INT NOT NULL DEFAULT 0,
  phone       VARCHAR(15),
  resume_path VARCHAR(300),
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. COMPANIES
CREATE TABLE companies (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  sector        VARCHAR(100),
  location      VARCHAR(150),
  contact_email VARCHAR(150),
  website       VARCHAR(200),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. OFFERS
CREATE TABLE offers (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  company_id        INT NOT NULL,
  posted_by         INT NOT NULL,
  title             VARCHAR(200) NOT NULL,
  description       TEXT,
  type              ENUM('summer', '6_month', '6_plus_6_month') NOT NULL,
  stipend           DECIMAL(10,2),
  location          VARCHAR(150),
  min_cgpa          DECIMAL(4,2) NOT NULL DEFAULT 0 CHECK (min_cgpa >= 0 AND min_cgpa <= 10),
  max_backlogs      INT NOT NULL DEFAULT 0 CHECK (max_backlogs >= 0),
  deadline          DATE NOT NULL,
  status            ENUM('open', 'closed', 'filled') NOT NULL DEFAULT 'open',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (posted_by)  REFERENCES users(id)
);

-- 4a. BRANCHES (normalized reference table)
CREATE TABLE branches (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE
);

-- 4b. OFFER_BRANCHES (junction table for many-to-many relationship)
CREATE TABLE offer_branches (
  offer_id  INT NOT NULL,
  branch_id INT NOT NULL,
  PRIMARY KEY (offer_id, branch_id),
  FOREIGN KEY (offer_id)  REFERENCES offers(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- 5. APPLICATIONS
CREATE TABLE applications (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL,
  offer_id        INT NOT NULL,
  status          ENUM('pending', 'shortlisted', 'selected', 'rejected', 'withdrawn') NOT NULL DEFAULT 'pending',
  resume_snapshot VARCHAR(300),
  updated_by      INT,
  applied_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_application (student_id, offer_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (offer_id)   REFERENCES offers(id)   ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- 6. INTERVIEWS
CREATE TABLE interviews (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL UNIQUE,
  scheduled_at   DATETIME NOT NULL,
  mode           ENUM('online', 'offline') NOT NULL DEFAULT 'online',
  link_or_venue  VARCHAR(300),
  notes          TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 7. NOTIFICATIONS
CREATE TABLE notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Indexes for common queries
-- ============================================
CREATE INDEX idx_users_email     ON users(email);
CREATE INDEX idx_users_role      ON users(role);
CREATE INDEX idx_students_user   ON students(user_id);
CREATE INDEX idx_students_reg    ON students(reg_number);
CREATE INDEX idx_students_branch ON students(branch);
CREATE INDEX idx_offers_status   ON offers(status);
CREATE INDEX idx_offers_deadline ON offers(deadline);
CREATE INDEX idx_offers_type     ON offers(type);
CREATE INDEX idx_offers_company  ON offers(company_id);
CREATE INDEX idx_apps_status     ON applications(status);
CREATE INDEX idx_apps_student    ON applications(student_id);
CREATE INDEX idx_apps_offer      ON applications(offer_id);
CREATE INDEX idx_notif_user      ON notifications(user_id, is_read);
CREATE INDEX idx_interviews_app  ON interviews(application_id);

-- ============================================
-- Seed: default admin account and common branches
-- password = 'admin123' (bcrypt hash - change in production!)
-- ============================================
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin', 'admin@college.edu', '$2b$10$0lhxYLVIY9GcNInbXZ0D8.r5rup.K1GNHsBAzfVrsgzhFBopOJoBK', 'admin');

-- Common engineering branches
INSERT INTO branches (name, code) VALUES
  ('Computer Science Engineering', 'CSE'),
  ('Information Technology', 'IT'),
  ('Electronics and Communication Engineering', 'ECE'),
  ('Electrical Engineering', 'EE'),
  ('Mechanical Engineering', 'ME'),
  ('Civil Engineering', 'CE'),
  ('Chemical Engineering', 'CHE'),
  ('Biotechnology', 'BT'),
  ('Aerospace Engineering', 'AE'),
  ('ALL', 'ALL');
