-- ============================================
-- Placement Management System - Expanded Schema
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

-- 2. DEPARTMENTS (normalized branch/department master)
CREATE TABLE departments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(10) NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ACADEMIC BATCHES
CREATE TABLE academic_batches (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  batch_label     VARCHAR(20) NOT NULL UNIQUE,
  start_year      SMALLINT NOT NULL,
  end_year        SMALLINT NOT NULL,
  graduation_year SMALLINT NOT NULL UNIQUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (start_year <= end_year)
);

-- 4. STUDENTS (academic profile, one per student user)
-- branch is retained for backward compatibility with existing frontend screens.
CREATE TABLE students (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL UNIQUE,
  reg_number    VARCHAR(50) NOT NULL UNIQUE,
  branch        VARCHAR(50) NOT NULL,
  department_id INT NULL,
  batch_id      INT NULL,
  cgpa          DECIMAL(4,2) NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
  backlogs      INT NOT NULL DEFAULT 0 CHECK (backlogs >= 0),
  phone         VARCHAR(15),
  resume_path   VARCHAR(300),
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (batch_id) REFERENCES academic_batches(id)
);

-- 5. COMPANIES
CREATE TABLE companies (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL UNIQUE,
  sector        VARCHAR(100),
  location      VARCHAR(150),
  contact_email VARCHAR(150),
  website       VARCHAR(200),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. RECRUITERS (company contacts)
CREATE TABLE recruiters (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  company_id  INT NOT NULL,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  phone       VARCHAR(20),
  designation VARCHAR(100),
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_company_recruiter_email (company_id, email),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 7. OFFERS
CREATE TABLE offers (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  company_id   INT NOT NULL,
  posted_by    INT NOT NULL,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  type         ENUM('summer', '6_month', '6_plus_6_month') NOT NULL,
  stipend      DECIMAL(10,2),
  location     VARCHAR(150),
  min_cgpa     DECIMAL(4,2) NOT NULL DEFAULT 0 CHECK (min_cgpa >= 0 AND min_cgpa <= 10),
  max_backlogs INT NOT NULL DEFAULT 0 CHECK (max_backlogs >= 0),
  deadline     DATE NOT NULL,
  status       ENUM('open', 'closed', 'filled') NOT NULL DEFAULT 'open',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (posted_by) REFERENCES users(id)
);

-- 8. BRANCHES (normalized reference used by offer eligibility)
CREATE TABLE branches (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE
);

-- 9. OFFER_BRANCHES (junction table for many-to-many relationship)
CREATE TABLE offer_branches (
  offer_id  INT NOT NULL,
  branch_id INT NOT NULL,
  PRIMARY KEY (offer_id, branch_id),
  FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- 10. APPLICATIONS
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
  FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- 11. PLACEMENT ROUNDS
CREATE TABLE placement_rounds (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  offer_id         INT NOT NULL,
  round_number     INT NOT NULL CHECK (round_number > 0),
  type             ENUM('aptitude', 'technical', 'hr', 'group_discussion', 'case_study') NOT NULL,
  scheduled_at     DATETIME,
  duration_minutes INT CHECK (duration_minutes > 0),
  max_students     INT CHECK (max_students > 0),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_offer_round (offer_id, round_number),
  FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
);

-- 12. ROUND RESULTS
CREATE TABLE round_results (
  application_id INT NOT NULL,
  round_id       INT NOT NULL,
  result         ENUM('pending', 'pass', 'fail') NOT NULL DEFAULT 'pending',
  score          DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
  remarks        TEXT,
  evaluated_by   INT,
  evaluated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (application_id, round_id),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (round_id) REFERENCES placement_rounds(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluated_by) REFERENCES users(id)
);

-- 13. FEEDBACK
CREATE TABLE feedback (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL UNIQUE,
  recruiter_id INT,
  rating       INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments     TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE SET NULL
);

-- 14. DOCUMENTS (multiple document versions per student)
CREATE TABLE documents (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  student_id  INT NOT NULL,
  doc_type    ENUM('resume', 'noc', 'offer_letter', 'id_proof', 'transcript', 'other') NOT NULL,
  version_no  INT NOT NULL DEFAULT 1 CHECK (version_no > 0),
  file_path   VARCHAR(300) NOT NULL,
  verified    BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_student_doc_version (student_id, doc_type, version_no),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- 15. BLACKLIST
CREATE TABLE blacklist (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  student_id     INT NOT NULL,
  reason         TEXT NOT NULL,
  blacklisted_by INT NOT NULL,
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at     DATE,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (blacklisted_by) REFERENCES users(id)
);

-- 16. PLACEMENT STATUSES (student-level final outcome)
CREATE TABLE placement_statuses (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  student_id           INT NOT NULL UNIQUE,
  status               ENUM('not_placed', 'placed', 'higher_studies', 'entrepreneurship', 'inactive') NOT NULL DEFAULT 'not_placed',
  final_application_id INT NULL,
  updated_by           INT,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (final_application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- 17. INTERVIEWS
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

-- 18. NOTIFICATIONS
CREATE TABLE notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 19. PLACEMENT STATS (materialized summary by department and batch)
CREATE TABLE placement_stats (
  department_id  INT NOT NULL,
  batch_id       INT NOT NULL,
  total_students INT NOT NULL DEFAULT 0,
  total_placed   INT NOT NULL DEFAULT 0,
  placement_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  avg_stipend    DECIMAL(10,2),
  max_stipend    DECIMAL(10,2),
  last_refreshed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (department_id, batch_id),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES academic_batches(id) ON DELETE CASCADE
);

-- 20. AUDIT LOG
CREATE TABLE audit_log (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id   INT NOT NULL,
  changed_by  INT,
  old_data    JSON,
  new_data    JSON,
  changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- Indexes for common queries
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_user ON students(user_id);
CREATE INDEX idx_students_reg ON students(reg_number);
CREATE INDEX idx_students_branch ON students(branch);
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_batch ON students(batch_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_deadline ON offers(deadline);
CREATE INDEX idx_offers_type ON offers(type);
CREATE INDEX idx_offers_company ON offers(company_id);
CREATE INDEX idx_apps_status ON applications(status);
CREATE INDEX idx_apps_student ON applications(student_id);
CREATE INDEX idx_apps_offer ON applications(offer_id);
CREATE INDEX idx_notif_user ON notifications(user_id, is_read);
CREATE INDEX idx_interviews_app ON interviews(application_id);
CREATE INDEX idx_round_results_round ON round_results(round_id);
CREATE INDEX idx_recruiters_company ON recruiters(company_id);
CREATE INDEX idx_blacklist_active ON blacklist(student_id, active, expires_at);

-- ============================================
-- Seed: default admin account and master data
-- password = 'admin123' (bcrypt hash - change in production!)
-- ============================================
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin', 'admin@college.edu', '$2b$10$0lhxYLVIY9GcNInbXZ0D8.r5rup.K1GNHsBAzfVrsgzhFBopOJoBK', 'admin');

INSERT INTO departments (code, name) VALUES
  ('CSE', 'Computer Science Engineering'),
  ('IT', 'Information Technology'),
  ('ECE', 'Electronics and Communication Engineering'),
  ('EE', 'Electrical Engineering'),
  ('ME', 'Mechanical Engineering'),
  ('CE', 'Civil Engineering'),
  ('CHE', 'Chemical Engineering'),
  ('BT', 'Biotechnology'),
  ('AE', 'Aerospace Engineering');

INSERT INTO academic_batches (batch_label, start_year, end_year, graduation_year) VALUES
  ('2022-2026', 2022, 2026, 2026),
  ('2023-2027', 2023, 2027, 2027),
  ('2024-2028', 2024, 2028, 2028);

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

-- ============================================
-- Triggers, functions, procedures, views
-- ============================================
DELIMITER //

CREATE TRIGGER trg_block_blacklisted_student
BEFORE INSERT ON applications
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1
    FROM blacklist b
    WHERE b.student_id = NEW.student_id
      AND b.active = TRUE
      AND (b.expires_at IS NULL OR b.expires_at >= CURDATE())
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Application blocked: student is currently blacklisted';
  END IF;
END //

CREATE TRIGGER trg_auto_reject_on_fail
AFTER INSERT ON round_results
FOR EACH ROW
BEGIN
  IF NEW.result = 'fail' THEN
    UPDATE applications
    SET status = 'rejected',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.application_id
      AND status <> 'rejected';

    INSERT INTO notifications (user_id, message)
    SELECT s.user_id,
           CONCAT('Your application for ', o.title, ' at ', c.name,
                  ' was rejected after round ', pr.round_number, '.')
    FROM applications a
    JOIN students s ON s.id = a.student_id
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    JOIN placement_rounds pr ON pr.id = NEW.round_id
    WHERE a.id = NEW.application_id;
  END IF;
END //

CREATE TRIGGER trg_update_placement_stats
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
  DECLARE v_department_id INT;
  DECLARE v_batch_id INT;
  DECLARE v_stipend DECIMAL(10,2);

  IF NEW.status = 'selected' AND OLD.status <> 'selected' THEN
    SELECT s.department_id, s.batch_id
    INTO v_department_id, v_batch_id
    FROM students s
    WHERE s.id = NEW.student_id
    LIMIT 1;

    IF v_department_id IS NOT NULL AND v_batch_id IS NOT NULL THEN
      SELECT o.stipend
      INTO v_stipend
      FROM offers o
      WHERE o.id = NEW.offer_id
      LIMIT 1;

      INSERT INTO placement_stats (
        department_id, batch_id, total_students, total_placed,
        placement_rate, avg_stipend, max_stipend, last_refreshed
      )
      VALUES (
        v_department_id,
        v_batch_id,
        (SELECT COUNT(*) FROM students s WHERE s.department_id = v_department_id AND s.batch_id = v_batch_id),
        0,
        0,
        NULL,
        NULL,
        CURRENT_TIMESTAMP
      )
      ON DUPLICATE KEY UPDATE
        total_students = VALUES(total_students),
        last_refreshed = VALUES(last_refreshed);

      UPDATE placement_stats ps
      SET
        ps.total_placed = ps.total_placed + 1,
        ps.placement_rate = ROUND(((ps.total_placed + 1) * 100.0) / NULLIF(ps.total_students, 0), 2),
        ps.avg_stipend = CASE
          WHEN v_stipend IS NULL THEN ps.avg_stipend
          WHEN ps.avg_stipend IS NULL THEN v_stipend
          ELSE ROUND(((ps.avg_stipend * ps.total_placed) + v_stipend) / (ps.total_placed + 1), 2)
        END,
        ps.max_stipend = CASE
          WHEN v_stipend IS NULL THEN ps.max_stipend
          ELSE GREATEST(COALESCE(ps.max_stipend, 0), v_stipend)
        END,
        ps.last_refreshed = CURRENT_TIMESTAMP
      WHERE ps.department_id = v_department_id
        AND ps.batch_id = v_batch_id;
    END IF;
  END IF;
END //

CREATE TRIGGER trg_log_offer_changes
AFTER UPDATE ON offers
FOR EACH ROW
BEGIN
  IF (OLD.stipend <> NEW.stipend)
      OR (OLD.deadline <> NEW.deadline)
      OR (OLD.status <> NEW.status) THEN
    INSERT INTO audit_log (entity_type, entity_id, changed_by, old_data, new_data)
    VALUES (
      'offer',
      NEW.id,
      NEW.posted_by,
      JSON_OBJECT(
        'stipend', OLD.stipend,
        'deadline', OLD.deadline,
        'status', OLD.status
      ),
      JSON_OBJECT(
        'stipend', NEW.stipend,
        'deadline', NEW.deadline,
        'status', NEW.status
      )
    );
  END IF;
END //

CREATE FUNCTION fn_student_eligibility(p_student_id INT, p_offer_id INT)
RETURNS VARCHAR(30)
READS SQL DATA
BEGIN
  DECLARE v_cgpa DECIMAL(4,2);
  DECLARE v_backlogs INT;
  DECLARE v_department_code VARCHAR(10);
  DECLARE v_branch_code VARCHAR(10);
  DECLARE v_min_cgpa DECIMAL(4,2);
  DECLARE v_max_backlogs INT;
  DECLARE v_match_count INT DEFAULT 0;

  SELECT s.cgpa, s.backlogs, d.code, s.branch
  INTO v_cgpa, v_backlogs, v_department_code, v_branch_code
  FROM students s
  LEFT JOIN departments d ON d.id = s.department_id
  WHERE s.id = p_student_id
  LIMIT 1;

  SELECT o.min_cgpa, o.max_backlogs
  INTO v_min_cgpa, v_max_backlogs
  FROM offers o
  WHERE o.id = p_offer_id
  LIMIT 1;

  IF v_cgpa IS NULL OR v_min_cgpa IS NULL THEN
    RETURN 'wrong_branch';
  END IF;

  IF v_cgpa < v_min_cgpa THEN
    RETURN 'low_cgpa';
  END IF;

  IF v_backlogs > v_max_backlogs THEN
    RETURN 'too_many_backlogs';
  END IF;

  SELECT COUNT(*)
  INTO v_match_count
  FROM offer_branches ob
  JOIN branches b ON b.id = ob.branch_id
  WHERE ob.offer_id = p_offer_id
    AND (
      b.code = 'ALL'
      OR b.code = v_department_code
      OR b.code = v_branch_code
    );

  IF v_match_count = 0 THEN
    RETURN 'wrong_branch';
  END IF;

  RETURN 'eligible';
END //

CREATE FUNCTION fn_days_to_deadline(p_offer_id INT)
RETURNS INT
READS SQL DATA
BEGIN
  DECLARE v_deadline DATE;
  SELECT deadline INTO v_deadline
  FROM offers
  WHERE id = p_offer_id
  LIMIT 1;

  IF v_deadline IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN DATEDIFF(v_deadline, CURDATE());
END //

CREATE FUNCTION fn_placement_rate(p_branch_code VARCHAR(10))
RETURNS DECIMAL(6,2)
READS SQL DATA
BEGIN
  DECLARE v_total INT DEFAULT 0;
  DECLARE v_selected INT DEFAULT 0;

  SELECT COUNT(*)
  INTO v_total
  FROM students s
  LEFT JOIN departments d ON d.id = s.department_id
  WHERE d.code = p_branch_code OR s.branch = p_branch_code;

  IF v_total = 0 THEN
    RETURN 0;
  END IF;

  SELECT COUNT(DISTINCT s.id)
  INTO v_selected
  FROM students s
  LEFT JOIN departments d ON d.id = s.department_id
  JOIN applications a ON a.student_id = s.id
  WHERE a.status = 'selected'
    AND (d.code = p_branch_code OR s.branch = p_branch_code);

  RETURN ROUND((v_selected * 100.0) / v_total, 2);
END //

CREATE PROCEDURE sp_advance_to_next_round(IN p_offer_id INT, IN p_round_number INT)
BEGIN
  INSERT INTO round_results (application_id, round_id, result)
  SELECT rr.application_id, nxt.id, 'pending'
  FROM round_results rr
  JOIN placement_rounds cur
    ON cur.id = rr.round_id
  JOIN placement_rounds nxt
    ON nxt.offer_id = cur.offer_id
   AND nxt.round_number = cur.round_number + 1
  WHERE cur.offer_id = p_offer_id
    AND cur.round_number = p_round_number
    AND rr.result = 'pass'
    AND NOT EXISTS (
      SELECT 1
      FROM round_results existing
      WHERE existing.application_id = rr.application_id
        AND existing.round_id = nxt.id
    );
END //

CREATE PROCEDURE sp_bulk_reject(IN p_offer_id INT)
BEGIN
  START TRANSACTION;

  INSERT INTO notifications (user_id, message)
  SELECT s.user_id,
         CONCAT('Application for ', o.title, ' at ', c.name, ' has been rejected.')
  FROM applications a
  JOIN students s ON s.id = a.student_id
  JOIN offers o ON o.id = a.offer_id
  JOIN companies c ON c.id = o.company_id
  WHERE a.offer_id = p_offer_id
    AND a.status = 'pending';

  UPDATE applications
  SET status = 'rejected',
      updated_at = CURRENT_TIMESTAMP
  WHERE offer_id = p_offer_id
    AND status = 'pending';

  COMMIT;
END //

CREATE PROCEDURE sp_generate_report(IN p_branch_code VARCHAR(10), IN p_year INT)
BEGIN
  SELECT
    p_branch_code AS branch_code,
    p_year AS graduation_year,
    COUNT(DISTINCT s.id) AS total_students,
    COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN s.id END) AS applied_students,
    COUNT(DISTINCT CASE WHEN a.status = 'shortlisted' THEN s.id END) AS shortlisted_students,
    COUNT(DISTINCT CASE WHEN a.status = 'selected' THEN s.id END) AS selected_students,
    ROUND(AVG(CASE WHEN a.status = 'selected' THEN s.cgpa END), 2) AS avg_cgpa_of_placed,
    (
      SELECT c2.name
      FROM applications a2
      JOIN offers o2 ON o2.id = a2.offer_id
      JOIN companies c2 ON c2.id = o2.company_id
      JOIN students s2 ON s2.id = a2.student_id
      LEFT JOIN departments d2 ON d2.id = s2.department_id
      LEFT JOIN academic_batches b2 ON b2.id = s2.batch_id
      WHERE a2.status = 'selected'
        AND (d2.code = p_branch_code OR s2.branch = p_branch_code)
        AND b2.graduation_year = p_year
      GROUP BY c2.id, c2.name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) AS top_company_by_selections
  FROM students s
  LEFT JOIN departments d ON d.id = s.department_id
  LEFT JOIN academic_batches b ON b.id = s.batch_id
  LEFT JOIN applications a ON a.student_id = s.id
  WHERE (d.code = p_branch_code OR s.branch = p_branch_code)
    AND b.graduation_year = p_year;
END //

DELIMITER ;

CREATE VIEW vw_placement_leaderboard AS
SELECT
  s.id AS student_id,
  u.name,
  COALESCE(d.code, s.branch) AS branch_code,
  s.cgpa,
  RANK() OVER (
    PARTITION BY COALESCE(d.code, s.branch)
    ORDER BY s.cgpa DESC
  ) AS branch_rank,
  RANK() OVER (ORDER BY s.cgpa DESC) AS overall_rank,
  COALESCE(
    ps.status,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM applications a
        WHERE a.student_id = s.id AND a.status = 'selected'
      ) THEN 'placed'
      ELSE 'not_placed'
    END
  ) AS placement_status
FROM students s
JOIN users u ON u.id = s.user_id
LEFT JOIN departments d ON d.id = s.department_id
LEFT JOIN placement_statuses ps ON ps.student_id = s.id;

CREATE VIEW vw_offer_pipeline AS
SELECT
  o.id AS offer_id,
  o.title,
  c.name AS company_name,
  COUNT(a.id) AS total_applications,
  SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
  SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) AS shortlisted_count,
  SUM(CASE WHEN rr.result = 'pending' THEN 1 ELSE 0 END) AS in_round_count,
  SUM(CASE WHEN a.status = 'selected' THEN 1 ELSE 0 END) AS selected_count,
  SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count
FROM offers o
JOIN companies c ON c.id = o.company_id
LEFT JOIN applications a ON a.offer_id = o.id
LEFT JOIN round_results rr ON rr.application_id = a.id
GROUP BY o.id, o.title, c.name;

CREATE VIEW vw_company_performance AS
SELECT
  c.id AS company_id,
  c.name AS company_name,
  COUNT(DISTINCT o.id) AS total_offers,
  COUNT(a.id) AS total_applications,
  ROUND(
    (SUM(CASE WHEN a.status = 'selected' THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(a.id), 0),
    2
  ) AS conversion_rate,
  ROUND(AVG(o.stipend), 2) AS average_stipend,
  MAX(o.stipend) AS highest_stipend
FROM companies c
LEFT JOIN offers o ON o.company_id = c.id
LEFT JOIN applications a ON a.offer_id = o.id
GROUP BY c.id, c.name;

-- =====================================================
-- ORIGINAL SQL OBJECTS (Pre-Expansion)
-- =====================================================

-- VIEW: Student Eligible Offers (shows which offers each student can apply to)
CREATE VIEW vw_student_eligible_offers AS
SELECT 
  s.id AS student_id,
  u.name AS student_name,
  s.branch,
  s.cgpa,
  s.backlogs,
  o.id AS offer_id,
  o.title,
  c.name AS company_name,
  o.stipend,
  o.deadline,
  o.type,
  CASE WHEN a.id IS NOT NULL THEN TRUE ELSE FALSE END AS already_applied
FROM students s
JOIN users u ON s.user_id = u.id
CROSS JOIN offers o
JOIN companies c ON o.company_id = c.id
LEFT JOIN applications a ON a.student_id = s.id AND a.offer_id = o.id
WHERE o.status = 'open' 
  AND o.deadline >= CURDATE()
  AND s.cgpa >= o.min_cgpa
  AND s.backlogs <= o.max_backlogs
  AND (o.eligible_branches IS NULL OR FIND_IN_SET(s.branch, o.eligible_branches) > 0);

-- TRIGGER: Notify student when application status changes
DELIMITER $$
CREATE TRIGGER trg_notify_status_change
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO notifications (user_id, message, type)
    SELECT s.user_id,
      CONCAT('Your application for "', o.title, '" has been updated to: ', NEW.status),
      'placement'
    FROM students s
    JOIN offers o ON o.id = NEW.offer_id
    WHERE s.id = NEW.student_id;
  END IF;
END$$
DELIMITER ;

-- TRIGGER: Prevent applying to closed/filled offers
DELIMITER $$
CREATE TRIGGER trg_block_closed_offer_apply
BEFORE INSERT ON applications
FOR EACH ROW
BEGIN
  DECLARE offer_status VARCHAR(20);
  SELECT status INTO offer_status FROM offers WHERE id = NEW.offer_id;
  IF offer_status <> 'open' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot apply to a closed or filled offer';
  END IF;
END$$
DELIMITER ;

-- TRIGGER: Prevent duplicate interview scheduling
DELIMITER $$
CREATE TRIGGER trg_single_interview_per_application
BEFORE INSERT ON interviews
FOR EACH ROW
BEGIN
  IF EXISTS (SELECT 1 FROM interviews WHERE application_id = NEW.application_id AND status != 'cancelled') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'An active interview is already scheduled for this application';
  END IF;
END$$
DELIMITER ;

-- STORED PROCEDURE: Get offer applicant summary stats
DELIMITER $$
CREATE PROCEDURE GetOfferStats(IN p_offer_id INT)
BEGIN
  SELECT 
    o.title,
    c.name AS company,
    COUNT(a.id) AS total_applicants,
    SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) AS shortlisted,
    SUM(CASE WHEN a.status = 'selected' THEN 1 ELSE 0 END) AS selected,
    SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
    AVG(s.cgpa) AS avg_applicant_cgpa,
    MIN(s.cgpa) AS min_cgpa,
    MAX(s.cgpa) AS max_cgpa
  FROM offers o
  JOIN companies c ON o.company_id = c.id
  LEFT JOIN applications a ON o.id = a.offer_id
  LEFT JOIN students s ON a.student_id = s.id
  WHERE o.id = p_offer_id
  GROUP BY o.id, o.title, c.name;
END$$
DELIMITER ;

-- EVENT: Auto-close expired offers (runs daily at midnight)
CREATE EVENT IF NOT EXISTS evt_close_expired_offers
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  UPDATE offers SET status = 'closed'
  WHERE deadline < CURDATE() AND status = 'open';
