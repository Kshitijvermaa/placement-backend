-- Migration: Normalize eligible_branches field
-- This migration creates the branches and offer_branches tables and migrates existing data

USE placement_db;

-- 1. Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE
);

-- 2. Insert common branches (ignore if already exist)
INSERT IGNORE INTO branches (name, code) VALUES
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

-- 3. Create offer_branches junction table
CREATE TABLE IF NOT EXISTS offer_branches (
  offer_id  INT NOT NULL,
  branch_id INT NOT NULL,
  PRIMARY KEY (offer_id, branch_id),
  FOREIGN KEY (offer_id)  REFERENCES offers(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- 4. Migrate existing data from eligible_branches to offer_branches
-- For offers with 'ALL', insert all branches (only if offers exist)
INSERT IGNORE INTO offer_branches (offer_id, branch_id)
SELECT o.id, b.id
FROM offers o
CROSS JOIN branches b
WHERE o.eligible_branches = 'ALL' AND b.code = 'ALL';

-- 5. Add updated_by field to applications table (check if column exists first)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'placement_db' 
                   AND TABLE_NAME = 'applications' 
                   AND COLUMN_NAME = 'updated_by');

SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE applications ADD COLUMN updated_by INT', 
              'SELECT "Column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Add foreign key for updated_by if it doesn't exist
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = 'placement_db' 
                  AND TABLE_NAME = 'applications' 
                  AND COLUMN_NAME = 'updated_by'
                  AND REFERENCED_TABLE_NAME = 'users');

SET @sql = IF(@fk_exists = 0,
              'ALTER TABLE applications ADD FOREIGN KEY (updated_by) REFERENCES users(id)',
              'SELECT "Foreign key already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. Add missing indexes (with error handling)
SET @idx_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = 'placement_db' 
                  AND TABLE_NAME = 'users' 
                  AND INDEX_NAME = 'idx_users_email');
SET @sql = IF(@idx_check = 0, 'CREATE INDEX idx_users_email ON users(email)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = 'placement_db' 
                  AND TABLE_NAME = 'users' 
                  AND INDEX_NAME = 'idx_users_role');
SET @sql = IF(@idx_check = 0, 'CREATE INDEX idx_users_role ON users(role)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = 'placement_db' 
                  AND TABLE_NAME = 'students' 
                  AND INDEX_NAME = 'idx_students_user');
SET @sql = IF(@idx_check = 0, 'CREATE INDEX idx_students_user ON students(user_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = 'placement_db' 
                  AND TABLE_NAME = 'students' 
                  AND INDEX_NAME = 'idx_students_reg');
SET @sql = IF(@idx_check = 0, 'CREATE INDEX idx_students_reg ON students(reg_number)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = 'placement_db' 
                  AND TABLE_NAME = 'students' 
                  AND INDEX_NAME = 'idx_students_branch');
SET @sql = IF(@idx_check = 0, 'CREATE INDEX idx_students_branch ON students(branch)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = 'placement_db' 
                  AND TABLE_NAME = 'offers' 
                  AND INDEX_NAME = 'idx_offers_company');
SET @sql = IF(@idx_check = 0, 'CREATE INDEX idx_offers_company ON offers(company_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = 'placement_db' 
                  AND TABLE_NAME = 'applications' 
                  AND INDEX_NAME = 'idx_apps_student');
SET @sql = IF(@idx_check = 0, 'CREATE INDEX idx_apps_student ON applications(student_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = 'placement_db' 
                  AND TABLE_NAME = 'applications' 
                  AND INDEX_NAME = 'idx_apps_offer');
SET @sql = IF(@idx_check = 0, 'CREATE INDEX idx_apps_offer ON applications(offer_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = 'placement_db' 
                  AND TABLE_NAME = 'interviews' 
                  AND INDEX_NAME = 'idx_interviews_app');
SET @sql = IF(@idx_check = 0, 'CREATE INDEX idx_interviews_app ON interviews(application_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT 'Migration completed successfully!' AS Status;
