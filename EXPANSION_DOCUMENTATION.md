# Placement Portal - Database Expansion & Advanced Features Documentation

**Date:** April 2026  
**Version:** 2.0 (Expanded Schema)

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema Expansion](#database-schema-expansion)
3. [SQL Objects & Advanced Features](#sql-objects--advanced-features)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Frontend Features](#frontend-features)
6. [SQL Commands Reference](#sql-commands-reference)
7. [Normalization & Data Integrity](#normalization--data-integrity)

---

## Overview

The Placement Portal has been expanded from a basic system to a **comprehensive, enterprise-grade placement management platform** with:

- **20 normalized tables** (3NF compliant)
- **4 triggers** for automated workflow management
- **3 user-defined functions** for complex business logic
- **3 stored procedures** for batch operations
- **3 materialized views** for analytics
- **Full-stack integration** with React frontend and Express backend

### Key Improvements

✅ **Normalized Data Model**: Department and batch tracking  
✅ **Recruiter Management**: Multiple contacts per company  
✅ **Multi-Round Placements**: Track aptitude, technical, HR rounds  
✅ **Document Versioning**: Multiple document types with version control  
✅ **Blacklist System**: Prevent applications from blocked students  
✅ **Placement Analytics**: Real-time stats, leaderboards, pipelines  
✅ **Audit Logging**: Track all critical changes  
✅ **Advanced SQL**: Functions, procedures, triggers, views

---

## Database Schema Expansion

### New Tables Added

#### 1. **departments** (Normalized Branch Master)
Stores all academic departments in the institution.

```sql
CREATE TABLE departments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(10) NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Centralizes department data, eliminates redundancy in student records.

**Sample Data**:
- CSE → Computer Science Engineering
- IT → Information Technology
- ECE → Electronics and Communication Engineering
- ME → Mechanical Engineering

---

#### 2. **academic_batches** (Batch/Cohort Tracking)
Tracks student batches with graduation years.

```sql
CREATE TABLE academic_batches (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  batch_label     VARCHAR(20) NOT NULL UNIQUE,
  start_year      SMALLINT NOT NULL,
  end_year        SMALLINT NOT NULL,
  graduation_year SMALLINT NOT NULL UNIQUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (start_year <= end_year)
);
```

**Purpose**: Group students by graduation year for placement statistics and reporting.

**Sample Data**:
- 2022-2026 → Graduates in 2026
- 2023-2027 → Graduates in 2027

---

#### 3. **recruiters** (Company Contacts)
Stores recruiter/HR contacts for each company.

```sql
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
```

**Purpose**: Track multiple contact persons per company for better communication.

**Sample Data**:
- Aditi Rao → Talent Partner @ TechNova Systems
- Nikhil Shah → Hiring Manager @ FinEdge Analytics

---

#### 4. **placement_rounds** (Multi-Stage Recruitment)
Defines recruitment rounds for each offer.

```sql
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
```

**Purpose**: Model multi-stage hiring processes (e.g., Round 1: Aptitude → Round 2: Technical → Round 3: HR).

**Sample Data**:
- Round 1: Aptitude Test (60 mins, max 300 students)
- Round 2: Technical Interview (45 mins, max 150 students)
- Round 3: HR Interview (30 mins, max 80 students)

---

#### 5. **round_results** (Performance Tracking)
Stores student results for each round.

```sql
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
```

**Purpose**: Track student performance in each recruitment round with scores and evaluator details.

**Automated Behavior**: Trigger `trg_auto_reject_on_fail` automatically rejects applications when a student fails any round.

---

#### 6. **feedback** (Recruiter Feedback)
Stores recruiter feedback on student performance.

```sql
CREATE TABLE feedback (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL UNIQUE,
  recruiter_id   INT,
  rating         INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments       TEXT,
  is_anonymous   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE SET NULL
);
```

**Purpose**: Collect structured feedback from recruiters to improve student performance tracking.

**Sample Data**:
- Rating: 4/5, Comments: "Good technical foundation and communication."

---

#### 7. **documents** (Version-Controlled Documents)
Stores student documents with version tracking.

```sql
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
```

**Purpose**: 
- Track multiple document types per student
- Support document versioning (v1, v2, v3)
- Admin verification workflow

**Use Cases**:
- Resume v1, v2, v3 (track resume updates)
- NOC (No Objection Certificate)
- Offer letters from companies
- ID proof verification

---

#### 8. **blacklist** (Access Control)
Manages students blocked from applying to offers.

```sql
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
```

**Purpose**: Prevent students from applying if they violated placement rules.

**Automated Behavior**: Trigger `trg_block_blacklisted_student` prevents blacklisted students from submitting applications.

**Sample Reasons**:
- "Accepted offer but didn't join company"
- "Multiple offer acceptances (policy violation)"
- "Unprofessional behavior during interview"

---

#### 9. **placement_statuses** (Final Placement Outcome)
Tracks final placement status of each student.

```sql
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
```

**Purpose**: Track whether student got placed, opted for higher studies, started a business, etc.

**Status Types**:
- `not_placed`: Still searching
- `placed`: Got internship/job
- `higher_studies`: Pursuing MS/MTech
- `entrepreneurship`: Started own venture
- `inactive`: Not participating in placements

---

#### 10. **placement_stats** (Materialized Analytics)
Aggregated placement statistics by department and batch.

```sql
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
```

**Purpose**: Pre-computed statistics for fast dashboard queries.

**Automated Behavior**: Trigger `trg_update_placement_stats` automatically updates stats when students get selected.

**Sample Data**:
- CSE 2026: 50 students, 42 placed → 84% placement rate
- Avg stipend: ₹52,000/month
- Max stipend: ₹75,000/month

---

#### 11. **audit_log** (Change Tracking)
Logs all critical changes to offers.

```sql
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
```

**Purpose**: Track who changed what and when for compliance/debugging.

**Automated Behavior**: Trigger `trg_log_offer_changes` logs changes to offer stipend, deadline, or status.

**Sample Entry**:
```json
{
  "entity_type": "offer",
  "old_data": {"stipend": 50000, "deadline": "2026-05-15"},
  "new_data": {"stipend": 60000, "deadline": "2026-05-20"}
}
```

---

### Enhanced Tables

#### **students** (Added Foreign Keys)
```sql
ALTER TABLE students
  ADD COLUMN department_id INT NULL,
  ADD COLUMN batch_id INT NULL,
  ADD FOREIGN KEY (department_id) REFERENCES departments(id),
  ADD FOREIGN KEY (batch_id) REFERENCES academic_batches(id);
```

**Purpose**: Link students to normalized department and batch data while maintaining backward compatibility with `branch` column.

---

## SQL Objects & Advanced Features

### Triggers (Automated Workflows)

#### 1. **trg_block_blacklisted_student**
```sql
CREATE TRIGGER trg_block_blacklisted_student
BEFORE INSERT ON applications
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1 FROM blacklist b
    WHERE b.student_id = NEW.student_id
      AND b.active = TRUE
      AND (b.expires_at IS NULL OR b.expires_at >= CURDATE())
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Application blocked: student is currently blacklisted';
  END IF;
END;
```

**When**: Before any new application is inserted  
**What**: Checks if student is blacklisted  
**Action**: Prevents application submission with error message  

**Use Case**: Student who violated placement rules tries to apply → Application automatically rejected.

---

#### 2. **trg_auto_reject_on_fail**
```sql
CREATE TRIGGER trg_auto_reject_on_fail
AFTER INSERT ON round_results
FOR EACH ROW
BEGIN
  IF NEW.result = 'fail' THEN
    UPDATE applications
    SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.application_id AND status <> 'rejected';

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
END;
```

**When**: After a round result is recorded  
**What**: If student failed the round  
**Action**: 
1. Auto-reject the application
2. Send notification to student

**Use Case**: Student fails technical round → Application status automatically changes to "rejected" and student gets notified.

---

#### 3. **trg_update_placement_stats**
```sql
CREATE TRIGGER trg_update_placement_stats
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
  DECLARE v_department_id INT;
  DECLARE v_batch_id INT;
  DECLARE v_stipend DECIMAL(10,2);

  IF NEW.status = 'selected' AND OLD.status <> 'selected' THEN
    -- Fetch student's department and batch
    SELECT s.department_id, s.batch_id
    INTO v_department_id, v_batch_id
    FROM students s
    WHERE s.id = NEW.student_id LIMIT 1;

    IF v_department_id IS NOT NULL AND v_batch_id IS NOT NULL THEN
      -- Fetch offer stipend
      SELECT o.stipend INTO v_stipend
      FROM offers o
      WHERE o.id = NEW.offer_id LIMIT 1;

      -- Update placement statistics
      INSERT INTO placement_stats (...)
      VALUES (...)
      ON DUPLICATE KEY UPDATE
        total_placed = total_placed + 1,
        placement_rate = ROUND((total_placed + 1) * 100.0 / total_students, 2),
        avg_stipend = ...,
        max_stipend = GREATEST(COALESCE(max_stipend, 0), v_stipend);
    END IF;
  END IF;
END;
```

**When**: After application status is updated  
**What**: If status changed to "selected"  
**Action**: Automatically update placement statistics for that department + batch

**Use Case**: CSE student gets selected → CSE 2026 placement rate automatically recalculated (e.g., 83% → 84%).

---

#### 4. **trg_log_offer_changes**
```sql
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
      JSON_OBJECT('stipend', OLD.stipend, 'deadline', OLD.deadline, 'status', OLD.status),
      JSON_OBJECT('stipend', NEW.stipend, 'deadline', NEW.deadline, 'status', NEW.status)
    );
  END IF;
END;
```

**When**: After offer is updated  
**What**: If stipend, deadline, or status changed  
**Action**: Log the change in audit_log table with old and new values

**Use Case**: Track who changed offer stipend from ₹50K to ₹60K and when.

---

### Functions (Reusable Business Logic)

#### 1. **fn_student_eligibility**
```sql
CREATE FUNCTION fn_student_eligibility(p_student_id INT, p_offer_id INT)
RETURNS VARCHAR(30)
READS SQL DATA
BEGIN
  -- Check CGPA, backlogs, and branch eligibility
  -- Returns: 'eligible', 'low_cgpa', 'too_many_backlogs', or 'wrong_branch'
END;
```

**Purpose**: Check if a student is eligible for an offer.

**Returns**:
- `'eligible'` → Student can apply
- `'low_cgpa'` → CGPA below minimum requirement
- `'too_many_backlogs'` → Exceeds maximum allowed backlogs
- `'wrong_branch'` → Branch not eligible for this offer

**Usage**:
```sql
SELECT fn_student_eligibility(42, 15);  -- Returns 'eligible'
```

**Use Case**: Before applying, check if student meets company criteria.

---

#### 2. **fn_days_to_deadline**
```sql
CREATE FUNCTION fn_days_to_deadline(p_offer_id INT)
RETURNS INT
READS SQL DATA
BEGIN
  DECLARE v_deadline DATE;
  SELECT deadline INTO v_deadline
  FROM offers WHERE id = p_offer_id LIMIT 1;
  
  IF v_deadline IS NULL THEN RETURN NULL; END IF;
  RETURN DATEDIFF(v_deadline, CURDATE());
END;
```

**Purpose**: Calculate days remaining until application deadline.

**Returns**: Number of days (positive = future, negative = past)

**Usage**:
```sql
SELECT title, fn_days_to_deadline(id) AS days_left
FROM offers WHERE status = 'open';
```

**Use Case**: Show "3 days left to apply" on frontend.

---

#### 3. **fn_placement_rate**
```sql
CREATE FUNCTION fn_placement_rate(p_branch_code VARCHAR(10))
RETURNS DECIMAL(6,2)
READS SQL DATA
BEGIN
  -- Calculate placement percentage for a branch
  DECLARE v_total INT DEFAULT 0;
  DECLARE v_selected INT DEFAULT 0;
  
  -- Count total students
  SELECT COUNT(*) INTO v_total
  FROM students s
  LEFT JOIN departments d ON d.id = s.department_id
  WHERE d.code = p_branch_code OR s.branch = p_branch_code;
  
  -- Count placed students
  SELECT COUNT(DISTINCT s.id) INTO v_selected
  FROM students s
  JOIN applications a ON a.student_id = s.id
  WHERE a.status = 'selected';
  
  RETURN ROUND((v_selected * 100.0) / v_total, 2);
END;
```

**Purpose**: Calculate placement rate for any branch.

**Returns**: Percentage (e.g., 84.50)

**Usage**:
```sql
SELECT fn_placement_rate('CSE');  -- Returns 84.50
```

**Use Case**: Display "CSE: 84.5% placement rate" on analytics dashboard.

---

### Stored Procedures (Batch Operations)

#### 1. **sp_advance_to_next_round**
```sql
CREATE PROCEDURE sp_advance_to_next_round(IN p_offer_id INT, IN p_round_number INT)
BEGIN
  INSERT INTO round_results (application_id, round_id, result)
  SELECT rr.application_id, nxt.id, 'pending'
  FROM round_results rr
  JOIN placement_rounds cur ON cur.id = rr.round_id
  JOIN placement_rounds nxt
    ON nxt.offer_id = cur.offer_id
   AND nxt.round_number = cur.round_number + 1
  WHERE cur.offer_id = p_offer_id
    AND cur.round_number = p_round_number
    AND rr.result = 'pass'
    AND NOT EXISTS (
      SELECT 1 FROM round_results existing
      WHERE existing.application_id = rr.application_id
        AND existing.round_id = nxt.id
    );
END;
```

**Purpose**: Automatically move all students who passed current round to next round.

**Parameters**:
- `p_offer_id`: Offer ID
- `p_round_number`: Current round number

**Usage**:
```sql
CALL sp_advance_to_next_round(15, 1);  -- Move R1 pass → R2
```

**Use Case**: After Round 1 (Aptitude) results, automatically create Round 2 (Technical) entries for all who passed.

---

#### 2. **sp_bulk_reject**
```sql
CREATE PROCEDURE sp_bulk_reject(IN p_offer_id INT)
BEGIN
  START TRANSACTION;
  
  -- Send notifications to all pending applicants
  INSERT INTO notifications (user_id, message)
  SELECT s.user_id,
         CONCAT('Application for ', o.title, ' at ', c.name, ' has been rejected.')
  FROM applications a
  JOIN students s ON s.id = a.student_id
  JOIN offers o ON o.id = a.offer_id
  JOIN companies c ON c.id = o.company_id
  WHERE a.offer_id = p_offer_id AND a.status = 'pending';
  
  -- Bulk reject all pending applications
  UPDATE applications
  SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
  WHERE offer_id = p_offer_id AND status = 'pending';
  
  COMMIT;
END;
```

**Purpose**: Reject all pending applications for an offer in one operation.

**Parameters**: `p_offer_id`

**Usage**:
```sql
CALL sp_bulk_reject(20);  -- Reject all pending for offer #20
```

**Use Case**: Company cancelled recruitment → Reject all 200 pending applications at once with notifications.

---

#### 3. **sp_generate_report**
```sql
CREATE PROCEDURE sp_generate_report(IN p_branch_code VARCHAR(10), IN p_year INT)
BEGIN
  SELECT
    p_branch_code AS branch_code,
    p_year AS graduation_year,
    COUNT(DISTINCT s.id) AS total_students,
    COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN s.id END) AS applied_students,
    COUNT(DISTINCT CASE WHEN a.status = 'shortlisted' THEN s.id END) AS shortlisted_students,
    COUNT(DISTINCT CASE WHEN a.status = 'selected' THEN s.id END) AS selected_students,
    ROUND(AVG(CASE WHEN a.status = 'selected' THEN s.cgpa END), 2) AS avg_cgpa_of_placed
  FROM students s
  LEFT JOIN departments d ON d.id = s.department_id
  LEFT JOIN academic_batches b ON b.id = s.batch_id
  LEFT JOIN applications a ON a.student_id = s.id
  WHERE (d.code = p_branch_code OR s.branch = p_branch_code)
    AND b.graduation_year = p_year;
END;
```

**Purpose**: Generate comprehensive placement report for a branch and year.

**Parameters**:
- `p_branch_code`: Department code (e.g., 'CSE')
- `p_year`: Graduation year (e.g., 2026)

**Usage**:
```sql
CALL sp_generate_report('CSE', 2026);
```

**Returns**:
- Total students
- Applied students
- Shortlisted students
- Selected students
- Average CGPA of placed students

**Use Case**: Generate annual placement report for CSE 2026 batch.

---

### Views (Analytics Dashboards)

#### 1. **vw_placement_leaderboard**
```sql
CREATE VIEW vw_placement_leaderboard AS
SELECT
  s.id AS student_id,
  u.name,
  COALESCE(d.code, s.branch) AS branch_code,
  s.cgpa,
  RANK() OVER (PARTITION BY COALESCE(d.code, s.branch) ORDER BY s.cgpa DESC) AS branch_rank,
  RANK() OVER (ORDER BY s.cgpa DESC) AS overall_rank,
  COALESCE(ps.status, 'not_placed') AS placement_status
FROM students s
JOIN users u ON u.id = s.user_id
LEFT JOIN departments d ON d.id = s.department_id
LEFT JOIN placement_statuses ps ON ps.student_id = s.id;
```

**Purpose**: Rank students by CGPA within their branch and overall.

**Columns**:
- `branch_rank`: Rank within CSE, IT, etc.
- `overall_rank`: Rank across all students
- `placement_status`: Current placement status

**Usage**:
```sql
SELECT * FROM vw_placement_leaderboard
WHERE branch_code = 'CSE'
ORDER BY branch_rank ASC
LIMIT 10;  -- Top 10 CSE students
```

**Use Case**: Display "Top Performers" dashboard with rankings.

---

#### 2. **vw_offer_pipeline**
```sql
CREATE VIEW vw_offer_pipeline AS
SELECT
  o.id AS offer_id,
  o.title,
  c.name AS company_name,
  COUNT(a.id) AS total_applications,
  SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
  SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) AS shortlisted_count,
  SUM(CASE WHEN a.status = 'selected' THEN 1 ELSE 0 END) AS selected_count,
  SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count
FROM offers o
JOIN companies c ON c.id = o.company_id
LEFT JOIN applications a ON a.offer_id = o.id
GROUP BY o.id, o.title, c.name;
```

**Purpose**: Show application funnel for each offer.

**Columns**:
- Total applications
- Status breakdown (pending/shortlisted/selected/rejected)

**Usage**:
```sql
SELECT * FROM vw_offer_pipeline
WHERE company_name = 'TechNova Systems';
```

**Use Case**: Show "150 applied → 50 shortlisted → 20 selected" pipeline visualization.

---

#### 3. **vw_company_performance**
```sql
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
```

**Purpose**: Analyze company recruitment effectiveness.

**Columns**:
- Total offers posted
- Total applications received
- Conversion rate (selected / total applications)
- Average and highest stipends offered

**Usage**:
```sql
SELECT * FROM vw_company_performance
ORDER BY conversion_rate DESC;
```

**Use Case**: Identify best-performing companies: "TechNova: 25% conversion rate, avg ₹58K stipend".

---

## Backend API Endpoints

### Expansion Hub Endpoints

#### Overview & Metadata
```
GET /api/admin/expansion/overview
```
Returns count of all new entities (departments, batches, recruiters, etc.)

```
GET /api/admin/expansion/meta
```
Returns metadata for dropdowns (companies list, students list, offers list, recruiters list, rounds list)

---

#### Departments
```
GET /api/admin/departments
```
Fetch all departments

```
POST /api/admin/departments
Body: { code: "CSE", name: "Computer Science Engineering" }
```
Create new department

---

#### Academic Batches
```
GET /api/admin/batches
```
Fetch all batches

```
POST /api/admin/batches
Body: {
  batch_label: "2022-2026",
  start_year: 2022,
  end_year: 2026,
  graduation_year: 2026
}
```
Create new batch

---

#### Recruiters
```
GET /api/admin/recruiters
```
Fetch all recruiters with company names

```
POST /api/admin/recruiters
Body: {
  company_id: 5,
  name: "John Doe",
  email: "john@company.com",
  phone: "9876543210",
  designation: "HR Manager",
  is_primary: true
}
```
Add new recruiter

---

#### Placement Statuses
```
GET /api/admin/placement-statuses
```
Fetch all student placement statuses

```
PUT /api/admin/placement-statuses/:id
Body: { status: "placed" }
```
Update placement status (not_placed/placed/higher_studies/entrepreneurship/inactive)

---

#### Placement Rounds
```
GET /api/admin/placement-rounds
```
Fetch all rounds with offer and company details

```
POST /api/admin/placement-rounds
Body: {
  offer_id: 15,
  round_number: 2,
  type: "technical",
  scheduled_at: "2026-05-20T10:00:00",
  duration_minutes: 45,
  max_students: 150
}
```
Create new placement round

---

#### Round Results
```
GET /api/admin/round-results?round_id=42
```
Fetch results for a specific round (or all if no round_id)

```
POST /api/admin/round-results
Body: {
  application_id: 120,
  round_id: 42,
  result: "pass",
  score: 85.5,
  remarks: "Excellent problem-solving skills"
}
```
Save round result (upsert - updates if exists)

---

#### Feedback
```
GET /api/admin/feedback
```
Fetch all feedback with student and offer details

```
POST /api/admin/feedback
Body: {
  application_id: 120,
  recruiter_id: 8,
  rating: 4,
  comments: "Good communication skills",
  is_anonymous: false
}
```
Save recruiter feedback (upsert)

---

#### Documents
```
GET /api/admin/documents
```
Fetch all document records with student names and verification status

```
POST /api/admin/documents
Body: {
  student_id: 55,
  doc_type: "resume",
  version_no: 2,
  file_path: "uploads/resumes/john-v2.pdf",
  verified: true
}
```
Create document record

---

#### Blacklist
```
GET /api/admin/blacklist
```
Fetch all blacklist entries

```
POST /api/admin/blacklist
Body: {
  student_id: 55,
  reason: "Accepted offer but didn't join",
  expires_at: "2027-01-01"
}
```
Blacklist a student

```
PUT /api/admin/blacklist/:id/deactivate
```
Deactivate a blacklist entry

---

#### Analytics Views
```
GET /api/admin/analytics/leaderboard
```
Fetch vw_placement_leaderboard (top 200 students)

```
GET /api/admin/analytics/pipeline
```
Fetch vw_offer_pipeline (application funnels)

```
GET /api/admin/analytics/company-performance
```
Fetch vw_company_performance

```
GET /api/admin/placement-stats
```
Fetch placement_stats table with department and batch details

---

#### Procedures
```
POST /api/admin/procedures/advance-round
Body: { offer_id: 15, round_number: 1 }
```
Execute sp_advance_to_next_round

```
POST /api/admin/procedures/bulk-reject
Body: { offer_id: 15 }
```
Execute sp_bulk_reject

---

#### Reports
```
GET /api/admin/reports/branch?branch_code=CSE&year=2026
```
Execute sp_generate_report and return results

---

## Frontend Features

### Expansion Hub Page
**Route**: `/admin/expansion`

#### Metrics Dashboard
- **9 metric cards** showing live counts:
  - Departments, Batches, Recruiters
  - Placement Statuses, Rounds, Round Results
  - Feedback, Documents, Blacklist

#### Tab 1: Catalog
- **Add Department** form (code + name)
- **Add Academic Batch** form (label, start/end/grad year)
- **Add Recruiter** form (company, name, email, phone)
- **Tables** showing all departments and batches

#### Tab 2: Recruitment Flow
- **Add Placement Round** form (offer, round #, type, schedule)
- **Save Round Result** form (application, round, result, score)
- **Blacklist Student** form (student, reason, expiry)
- **Placement Statuses Table** with inline status update dropdown

#### Tab 3: Documents & Feedback
- **Add Feedback** form (application, recruiter, rating, comments)
- **Add Document Entry** form (student, doc type, version, path)
- **Blacklist Control Panel** with deactivate buttons
- **Feedback Table** (student, offer, rating)
- **Documents Table** (student, type, version, verified status)

#### Tab 4: Analytics & SQL Features
- **Procedures Panel**:
  - Advance Round (move passed students to next round)
  - Bulk Reject (reject all pending for an offer)
- **Branch Report Generator** (select branch + year)
- **Placement Stats Table** (dept, batch, placed count, rate)
- **Leaderboard View** (top 30 ranked students)
- **Offer Pipeline View** (application funnels)
- **Company Performance View** (conversion rates)

---

## SQL Commands Reference

### Schema Setup
```sql
-- Fresh setup
mysql -u root -p < setup_fresh.sql
mysql -u root -p placement_db < schema.sql

-- Migration (if upgrading)
mysql -u root -p placement_db < migrations/001_normalize_branches.sql
mysql -u root -p placement_db < migrations/002_expand_db_objects.sql
```

### Sample Queries

#### Check Eligibility
```sql
SELECT 
  s.name,
  o.title,
  fn_student_eligibility(s.id, o.id) AS eligibility
FROM students s
CROSS JOIN offers o
WHERE fn_student_eligibility(s.id, o.id) = 'eligible'
LIMIT 10;
```

#### Days to Deadline
```sql
SELECT 
  title,
  deadline,
  fn_days_to_deadline(id) AS days_left
FROM offers
WHERE status = 'open'
  AND fn_days_to_deadline(id) BETWEEN 0 AND 7
ORDER BY deadline ASC;
```

#### Placement Rate by Branch
```sql
SELECT 
  code,
  name,
  fn_placement_rate(code) AS placement_rate_pct
FROM departments
ORDER BY placement_rate_pct DESC;
```

#### Top Performers
```sql
SELECT name, branch_code, cgpa, overall_rank
FROM vw_placement_leaderboard
WHERE overall_rank <= 20
ORDER BY overall_rank ASC;
```

#### Company Performance
```sql
SELECT 
  company_name,
  total_offers,
  total_applications,
  conversion_rate,
  average_stipend
FROM vw_company_performance
WHERE total_applications > 0
ORDER BY conversion_rate DESC;
```

#### Offer Pipeline Analysis
```sql
SELECT 
  title,
  company_name,
  total_applications,
  pending_count,
  shortlisted_count,
  selected_count,
  ROUND((selected_count * 100.0) / NULLIF(total_applications, 0), 2) AS selection_rate
FROM vw_offer_pipeline
WHERE total_applications > 0
ORDER BY selection_rate DESC;
```

#### Advance Round
```sql
-- Move all R1 pass → R2 for offer #15
CALL sp_advance_to_next_round(15, 1);
```

#### Bulk Reject
```sql
-- Reject all pending for offer #20
CALL sp_bulk_reject(20);
```

#### Generate Report
```sql
-- CSE 2026 batch report
CALL sp_generate_report('CSE', 2026);
```

---

## Normalization & Data Integrity

### Third Normal Form (3NF) Compliance

#### Before Expansion
- **students.branch**: String value repeated (CSE, CSE, IT, CSE...)
- **No batch tracking**: Cannot group by graduation year
- **No recruiter management**: Only company contact email

#### After Expansion
✅ **departments**: Centralized reference table  
✅ **academic_batches**: Normalized batch tracking  
✅ **students.department_id**: Foreign key to departments  
✅ **students.batch_id**: Foreign key to academic_batches  
✅ **recruiters**: Separate entity with 1:N relationship to companies  

### Data Integrity Features

#### Referential Integrity
- **CASCADE DELETE**: Deleting company → deletes all recruiters
- **SET NULL**: Deleting recruiter → sets feedback.recruiter_id to NULL
- **RESTRICT** (default): Cannot delete department with students

#### Check Constraints
- `cgpa BETWEEN 0 AND 10`
- `backlogs >= 0`
- `round_number > 0`
- `score BETWEEN 0 AND 100`
- `rating BETWEEN 1 AND 5`
- `start_year <= end_year`

#### Unique Constraints
- `departments.code` UNIQUE
- `academic_batches.graduation_year` UNIQUE
- `(company_id, email)` UNIQUE for recruiters
- `(student_id, doc_type, version_no)` UNIQUE for documents

#### Automated Data Quality
- Triggers enforce business rules
- Functions validate eligibility before display
- Procedures ensure transactional consistency

---

## Summary

### Database Growth
- **Before**: 8 tables
- **After**: 20 tables (+150% growth)

### SQL Objects Added
- **Triggers**: 4
- **Functions**: 3
- **Procedures**: 3
- **Views**: 3

### Backend Endpoints Added
- **Expansion APIs**: 20+ new endpoints
- **Analytics APIs**: 3 view-based endpoints
- **Procedure APIs**: 3 batch operation endpoints

### Frontend Components
- **New Page**: Expansion Hub
- **Forms**: 10 interactive CRUD forms
- **Tables**: 12 data display tables
- **Analytics**: 6 real-time analytics panels

### Key Metrics Tracked
- Placement rates by department and batch
- Student rankings (branch-wise and overall)
- Offer application funnels
- Company conversion rates
- Round-wise student performance
- Document verification status
- Blacklist management

---

## Next Steps / Future Enhancements

1. **Email Integration**: Send automated emails on status changes
2. **File Upload**: Replace file_path with actual file upload API
3. **Advanced Reports**: Export to PDF/Excel
4. **Real-time Notifications**: WebSocket for live updates
5. **Student Dashboard**: Show personal analytics and recommendations
6. **Mobile App**: React Native version
7. **Machine Learning**: Predict placement probability based on CGPA/rounds
8. **Calendar Integration**: Sync interview schedules to Google Calendar

---

**Document Version**: 1.0  
**Last Updated**: April 2026  
**Prepared By**: Placement Portal Development Team
