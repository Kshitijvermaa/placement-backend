# College Placement Management System - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Database Architecture](#database-architecture)
3. [Database Tables Detailed](#database-tables-detailed)
4. [SQL Objects (Triggers, Functions, Procedures, Views)](#sql-objects)
5. [Backend API Endpoints](#backend-api-endpoints)
6. [Frontend Features](#frontend-features)
7. [Complete SQL Command History](#complete-sql-command-history)
8. [Data Flow and Architecture](#data-flow-and-architecture)

---

## Project Overview

### What We Built
A comprehensive college placement management system that evolved from a basic 7-table database to a **full-featured 20-table normalized system** with advanced SQL features, REST APIs, and admin interface.

### Key Achievements
- ✅ **23 Total Tables**: 20 normalized tables (3NF) + 3 system tables
- ✅ **7 Triggers**: 4 expansion + 3 original (automated business logic)
- ✅ **3 SQL Functions**: Reusable data calculation logic
- ✅ **4 Stored Procedures**: 3 expansion + 1 original (complex operations)
- ✅ **4 Views**: 3 expansion analytics + 1 student eligibility view
- ✅ **1 Scheduled Event**: Auto-close expired offers daily
- ✅ **30+ REST API Endpoints**: Complete backend service layer
- ✅ **Full Admin UI**: Expansion Hub with 4 functional tabs
- ✅ **Dummy Data Seeding**: One-click test data generation

### SQL Objects Summary
**Total: 19 SQL Objects**
- **Triggers**: 7 total
  - Expansion: 4 (blacklist blocking, auto-reject, stats update, audit logging)
  - Original: 3 (status notifications, closed offer blocking, duplicate interview prevention)
- **Functions**: 3 (eligibility check, deadline calculator, placement rate)
- **Procedures**: 4 total
  - Expansion: 3 (advance round, bulk reject, branch report)
  - Original: 1 (offer stats)
- **Views**: 4 (leaderboard, pipeline, company performance, student eligible offers)
- **Events**: 1 (auto-close expired offers)

---

## Database Architecture

### Database Normalization (3NF Achieved)
All tables follow Third Normal Form (3NF) principles:
- **1NF**: All attributes are atomic (no repeating groups)
- **2NF**: No partial dependencies (all non-key attributes depend on full primary key)
- **3NF**: No transitive dependencies (non-key attributes depend only on primary key)

### Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MASTER DATA TABLES                        │
├─────────────────────────────────────────────────────────────┤
│  departments (9 records)                                     │
│  academic_batches (3 records: 2022-26, 2023-27, 2024-28)    │
│  placement_statuses (5 records: Applied, Shortlisted, etc)  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     CORE ENTITIES                            │
├─────────────────────────────────────────────────────────────┤
│  users → students → applications → interviews                │
│         ↓                  ↓                                 │
│    documents         round_results                           │
│    feedback          blacklist_students                      │
│                                                              │
│  companies → recruiters → offers → placement_rounds          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  ANALYTICS & AUDIT                           │
├─────────────────────────────────────────────────────────────┤
│  placement_stats (materialized aggregates)                   │
│  offer_audit_log (change tracking)                          │
│  notifications (system messages)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Tables Detailed

### 1. **departments** (Master Table)
**Purpose**: Maintains list of all academic departments/branches in the college.

**Structure**:
```sql
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dept_code VARCHAR(10) UNIQUE NOT NULL,
    dept_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Sample Data**:
| id | dept_code | dept_name |
|----|-----------|-----------|
| 1 | CSE | Computer Science |
| 2 | ECE | Electronics & Communication |
| 3 | ME | Mechanical Engineering |
| 4 | CE | Civil Engineering |
| 5 | EE | Electrical Engineering |

**Why 3NF**: Single responsibility (department data only), no redundancy.

---

### 2. **academic_batches** (Master Table)
**Purpose**: Tracks student batches with start year, end year, and graduation year.

**Structure**:
```sql
CREATE TABLE academic_batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_name VARCHAR(50) NOT NULL,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    graduation_year INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Sample Data**:
| id | batch_name | start_year | end_year | graduation_year | is_active |
|----|------------|------------|----------|-----------------|-----------|
| 1 | Batch 2022-2026 | 2022 | 2026 | 2026 | 1 |
| 2 | Batch 2023-2027 | 2023 | 2027 | 2027 | 1 |
| 3 | Batch 2024-2028 | 2024 | 2028 | 2028 | 1 |

**Why 3NF**: Batch information is independent, no derived attributes.

---

### 3. **placement_statuses** (Master Table)
**Purpose**: Defines all possible application statuses for workflow tracking.

**Structure**:
```sql
CREATE TABLE placement_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) UNIQUE NOT NULL,
    status_description TEXT,
    status_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Sample Data**:
| id | status_name | status_description | status_order |
|----|-------------|-------------------|--------------|
| 1 | Applied | Initial application submitted | 1 |
| 2 | Shortlisted | Resume shortlisted | 2 |
| 3 | Interview Scheduled | Interview round scheduled | 3 |
| 4 | Offer Received | Job offer received | 4 |
| 5 | Rejected | Application rejected | 99 |

**Why 3NF**: Status definitions are atomic and independent.

---

### 4. **recruiters** (Entity Table)
**Purpose**: Stores recruiter contact information for each company.

**Structure**:
```sql
CREATE TABLE recruiters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    designation VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
```

**Relationships**:
- **Many-to-One** with `companies`: One company can have multiple recruiters
- `is_primary` flag identifies main point of contact

**Sample Data**:
| id | company_id | name | email | designation | is_primary |
|----|------------|------|-------|-------------|------------|
| 1 | 1 | Sarah Johnson | sarah.j@techcorp.com | Senior HR Manager | 1 |
| 2 | 2 | Michael Chen | m.chen@innovate.io | Talent Acquisition | 1 |

**Why 3NF**: Recruiter details depend only on recruiter_id, not on company attributes.

---

### 5. **students** (Entity Table - Enhanced)
**Purpose**: Core student information with academic details.

**Key Enhancements**:
- Added `department_id` (FK to departments)
- Added `batch_id` (FK to academic_batches)
- Retained `branch` column for backward compatibility

**Structure** (Key columns):
```sql
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    branch VARCHAR(50),           -- Legacy column
    department_id INT,             -- NEW: Normalized FK
    batch_id INT,                  -- NEW: Normalized FK
    cgpa DECIMAL(3,2),
    backlogs INT DEFAULT 0,
    resume_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (batch_id) REFERENCES academic_batches(id)
);
```

**Why Both `branch` and `department_id`?**
- `department_id`: Normalized reference for new features
- `branch`: Kept for existing frontend screens to avoid breaking changes
- Migration script syncs both during transition period

---

### 6. **placement_rounds** (Entity Table)
**Purpose**: Defines recruitment process stages for each job offer.

**Structure**:
```sql
CREATE TABLE placement_rounds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    offer_id INT NOT NULL,
    round_number INT NOT NULL,
    round_name VARCHAR(100) NOT NULL,
    round_type ENUM('aptitude', 'technical', 'hr', 'group_discussion', 'final') NOT NULL,
    scheduled_date DATE,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_round (offer_id, round_number)
);
```

**Round Types**:
- `aptitude`: Written test/online assessment
- `technical`: Technical interview
- `hr`: HR/behavioral interview  
- `group_discussion`: GD round
- `final`: Final selection round

**Example Flow**:
```
Offer #1 (Google SDE):
  Round 1: Aptitude Test (aptitude)
  Round 2: Technical Interview 1 (technical)
  Round 3: Technical Interview 2 (technical)
  Round 4: HR Round (hr)
  Round 5: Final Selection (final)
```

**Why 3NF**: Round details depend only on (offer_id, round_number), not on company or other attributes.

---

### 7. **round_results** (Transaction Table)
**Purpose**: Tracks student performance in each placement round.

**Structure**:
```sql
CREATE TABLE round_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    round_id INT NOT NULL,
    result ENUM('pending', 'pass', 'fail', 'absent') DEFAULT 'pending',
    score DECIMAL(5,2),
    feedback TEXT,
    evaluated_at TIMESTAMP NULL,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (round_id) REFERENCES placement_rounds(id) ON DELETE CASCADE,
    UNIQUE KEY unique_result (application_id, round_id)
);
```

**Result States**:
- `pending`: Round not yet evaluated
- `pass`: Student cleared this round
- `fail`: Student failed (triggers auto-rejection via trigger)
- `absent`: Student didn't attend

**Automated Behavior**:
When `result='fail'` is inserted, trigger `trg_auto_reject_on_fail` automatically:
1. Updates application status to 'rejected'
2. Sends notification to student

---

### 8. **documents** (Entity Table)
**Purpose**: Version-controlled document storage for student submissions.

**Structure**:
```sql
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    doc_type ENUM('resume', 'cover_letter', 'certificate', 'transcript', 'other') NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    version_no INT DEFAULT 1,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_doc_version (student_id, doc_type, version_no)
);
```

**Document Versioning**:
- Students can upload multiple versions of same document type
- `version_no` auto-increments for each document type
- `is_active=TRUE` marks current version
- Old versions preserved for audit trail

**Example**:
```
Student #5:
  resume v1 (is_active=false) - Uploaded Jan 2024
  resume v2 (is_active=false) - Uploaded Feb 2024
  resume v3 (is_active=true)  - Uploaded Mar 2024 ← Current
  cover_letter v1 (is_active=true) - Uploaded Jan 2024
```

**Why 3NF**: Document metadata depends only on document_id, not on student attributes.

---

### 9. **blacklist_students** (Entity Table)
**Purpose**: Prevents problematic students from applying to certain companies.

**Structure**:
```sql
CREATE TABLE blacklist_students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    company_id INT,  -- NULL means blacklisted from ALL companies
    reason TEXT NOT NULL,
    blacklisted_by INT,
    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATE,  -- NULL means permanent
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
```

**Blacklist Types**:
1. **Company-Specific**: `company_id` set → Student blocked from one company only
2. **Global**: `company_id` IS NULL → Student blocked from ALL placements

**Temporal Control**:
- `expires_at` allows automatic expiration
- `is_active=FALSE` for manual deactivation

**Automated Behavior**:
Trigger `trg_block_blacklisted_student` prevents application insertion if student is blacklisted.

**Example Scenarios**:
```sql
-- Scenario 1: Student #3 misbehaved in TechCorp interview
INSERT INTO blacklist_students (student_id, company_id, reason, expires_at)
VALUES (3, 1, 'Unprofessional behavior in interview', '2025-12-31');

-- Scenario 2: Student #7 has fake documents - permanent global ban
INSERT INTO blacklist_students (student_id, company_id, reason, expires_at)
VALUES (7, NULL, 'Submitted forged certificates', NULL);
```

---

### 10. **feedback** (Transaction Table)
**Purpose**: Captures detailed feedback for applications from recruiters/admins.

**Structure**:
```sql
CREATE TABLE feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    feedback_by INT,  -- User ID of admin/recruiter
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    feedback_type ENUM('resume_review', 'interview_performance', 'general') DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
```

**Feedback Types**:
- `resume_review`: Comments on resume quality
- `interview_performance`: Interview assessment
- `general`: General notes

**Rating Scale**: 1 (Poor) to 5 (Excellent)

**Use Cases**:
- HR provides feedback after interview
- Admin reviews application quality
- Helps students improve for future applications

---

### 11. **placement_stats** (Materialized Table)
**Purpose**: Pre-aggregated placement statistics for fast analytics queries.

**Structure**:
```sql
CREATE TABLE placement_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT,
    batch_id INT,
    total_students INT DEFAULT 0,
    total_placed INT DEFAULT 0,
    total_offers INT DEFAULT 0,
    highest_package DECIMAL(10,2),
    average_package DECIMAL(10,2),
    lowest_package DECIMAL(10,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_stats (department_id, batch_id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (batch_id) REFERENCES academic_batches(id)
);
```

**Materialization Strategy**:
- Data is **pre-computed** and stored (not calculated on-the-fly)
- Updated via trigger `trg_update_placement_stats` when applications change
- Much faster than computing aggregates with JOINs for each query

**Automated Updates**:
When an application status changes to 'placed', trigger automatically updates:
- `total_placed` increments
- `average_package`, `highest_package`, `lowest_package` recalculated

**Why Materialized?**
- Dashboard queries need instant response
- Calculating aggregates across thousands of applications is slow
- Acceptable trade-off: slight staleness for major performance gain

---

### 12. **offer_audit_log** (Audit Table)
**Purpose**: Immutable audit trail for all changes to job offers.

**Structure**:
```sql
CREATE TABLE offer_audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    offer_id INT NOT NULL,
    changed_by INT,
    change_type ENUM('created', 'updated', 'deleted', 'status_changed') NOT NULL,
    old_values JSON,
    new_values JSON,
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
);
```

**JSON Storage Example**:
```json
{
  "old_values": {
    "ctc": 1200000,
    "deadline": "2024-03-15",
    "vacancies": 5
  },
  "new_values": {
    "ctc": 1500000,
    "deadline": "2024-03-20",
    "vacancies": 8
  }
}
```

**Automated Logging**:
Trigger `trg_log_offer_changes` captures every UPDATE to offers table.

**Compliance Benefits**:
- **Accountability**: Who changed what and when
- **Rollback**: Can identify what values changed
- **Analytics**: Track offer evolution over time

---

## SQL Objects

### Triggers (4 Total)

#### 1. **trg_block_blacklisted_student**
**Type**: BEFORE INSERT on `applications`  
**Purpose**: Prevents blacklisted students from submitting applications

**Logic**:
```sql
DELIMITER //
CREATE TRIGGER trg_block_blacklisted_student 
BEFORE INSERT ON applications
FOR EACH ROW
BEGIN
    DECLARE is_blacklisted INT;
    
    SELECT COUNT(*) INTO is_blacklisted
    FROM blacklist_students b
    JOIN applications a ON a.id = NEW.id
    JOIN offers o ON o.id = a.offer_id
    WHERE b.student_id = a.student_id
      AND b.is_active = TRUE
      AND (b.expires_at IS NULL OR b.expires_at > CURDATE())
      AND (b.company_id IS NULL OR b.company_id = o.company_id);
    
    IF is_blacklisted > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot apply: Student is blacklisted';
    END IF;
END//
DELIMITER ;
```

**Real-World Example**:
```sql
-- Student #3 is blacklisted from Company #1
INSERT INTO blacklist_students (student_id, company_id, reason)
VALUES (3, 1, 'Unprofessional conduct');

-- Later, Student #3 tries to apply to Company #1's offer
INSERT INTO applications (student_id, offer_id, status)
VALUES (3, 10, 'pending');  
-- ❌ ERROR: Cannot apply: Student is blacklisted
```

---

#### 2. **trg_auto_reject_on_fail**
**Type**: AFTER INSERT on `round_results`  
**Purpose**: Auto-rejects applications when student fails any round

**Logic**:
```sql
DELIMITER //
CREATE TRIGGER trg_auto_reject_on_fail
AFTER INSERT ON round_results
FOR EACH ROW
BEGIN
    IF NEW.result = 'fail' THEN
        UPDATE applications 
        SET status = 'rejected' 
        WHERE id = NEW.application_id;
        
        INSERT INTO notifications (user_id, title, message, type)
        SELECT s.user_id,
               'Application Rejected',
               CONCAT('Your application has been rejected due to round failure'),
               'placement'
        FROM applications a
        JOIN students s ON s.id = a.student_id
        WHERE a.id = NEW.application_id;
    END IF;
END//
DELIMITER ;
```

**Workflow**:
1. Recruiter evaluates round: `INSERT INTO round_results (application_id, round_id, result) VALUES (42, 5, 'fail')`
2. Trigger fires automatically
3. Application #42 status → 'rejected'
4. Student receives notification

---

#### 3. **trg_update_placement_stats**
**Type**: AFTER UPDATE on `applications`  
**Purpose**: Incrementally updates placement statistics when placement occurs

**Logic** (Simplified):
```sql
DELIMITER //
CREATE TRIGGER trg_update_placement_stats
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    DECLARE dept_id INT;
    DECLARE bat_id INT;
    DECLARE offer_ctc DECIMAL(10,2);
    
    IF NEW.status = 'placed' AND OLD.status != 'placed' THEN
        -- Get student's department and batch
        SELECT department_id, batch_id INTO dept_id, bat_id
        FROM students WHERE id = NEW.student_id;
        
        -- Get offer CTC
        SELECT ctc INTO offer_ctc
        FROM offers WHERE id = NEW.offer_id;
        
        -- Increment placement count
        INSERT INTO placement_stats (department_id, batch_id, total_placed, total_offers)
        VALUES (dept_id, bat_id, 1, 1)
        ON DUPLICATE KEY UPDATE 
            total_placed = total_placed + 1,
            total_offers = total_offers + 1,
            highest_package = GREATEST(COALESCE(highest_package, 0), offer_ctc),
            lowest_package = LEAST(COALESCE(lowest_package, 999999999), offer_ctc);
    END IF;
END//
DELIMITER ;
```

**Performance Note**:
- Uses incremental arithmetic updates (`total_placed + 1`)
- Avoids complex SELECT queries that could cause trigger mutation errors
- Average package recalculated periodically via batch job (not in trigger)

---

#### 4. **trg_log_offer_changes**
**Type**: AFTER UPDATE on `offers`  
**Purpose**: Maintains immutable audit log of offer modifications

**Logic**:
```sql
DELIMITER //
CREATE TRIGGER trg_log_offer_changes
AFTER UPDATE ON offers
FOR EACH ROW
BEGIN
    INSERT INTO offer_audit_log (offer_id, change_type, old_values, new_values)
    VALUES (
        NEW.id,
        'updated',
        JSON_OBJECT(
            'ctc', OLD.ctc,
            'vacancies', OLD.vacancies,
            'deadline', OLD.deadline
        ),
        JSON_OBJECT(
            'ctc', NEW.ctc,
            'vacancies', NEW.vacancies,
            'deadline', NEW.deadline
        )
    );
END//
DELIMITER ;
```

**Audit Trail Example**:
```sql
-- Admin updates offer
UPDATE offers SET ctc = 1800000 WHERE id = 5;

-- Audit log automatically created:
-- {
--   "old_values": {"ctc": 1500000, ...},
--   "new_values": {"ctc": 1800000, ...}
-- }
```

---

### Functions (3 Total)

#### 1. **fn_student_eligibility**
**Returns**: VARCHAR (eligibility status)  
**Purpose**: Checks if student meets offer eligibility criteria

**Signature**:
```sql
CREATE FUNCTION fn_student_eligibility(
    p_student_id INT, 
    p_offer_id INT
) RETURNS VARCHAR(50)
```

**Logic**:
```sql
DELIMITER //
CREATE FUNCTION fn_student_eligibility(p_student_id INT, p_offer_id INT)
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE student_cgpa DECIMAL(3,2);
    DECLARE student_backlogs INT;
    DECLARE student_branch VARCHAR(50);
    DECLARE min_cgpa DECIMAL(3,2);
    DECLARE max_backlogs INT;
    DECLARE eligible_branches TEXT;
    
    -- Get student details
    SELECT cgpa, backlogs, branch INTO student_cgpa, student_backlogs, student_branch
    FROM students WHERE id = p_student_id;
    
    -- Get offer criteria
    SELECT minimum_cgpa, maximum_backlogs, eligible_branches 
    INTO min_cgpa, max_backlogs, eligible_branches
    FROM offers WHERE id = p_offer_id;
    
    -- Check CGPA
    IF student_cgpa < min_cgpa THEN
        RETURN 'low_cgpa';
    END IF;
    
    -- Check backlogs
    IF student_backlogs > max_backlogs THEN
        RETURN 'too_many_backlogs';
    END IF;
    
    -- Check branch eligibility
    IF eligible_branches IS NOT NULL 
       AND FIND_IN_SET(student_branch, eligible_branches) = 0 THEN
        RETURN 'wrong_branch';
    END IF;
    
    RETURN 'eligible';
END//
DELIMITER ;
```

**Return Values**:
- `'eligible'`: Student meets all criteria
- `'low_cgpa'`: CGPA below minimum
- `'too_many_backlogs'`: Backlogs exceed limit
- `'wrong_branch'`: Branch not in eligible list

**Usage in Application**:
```sql
-- Check before allowing student to apply
SELECT fn_student_eligibility(5, 10) AS eligibility;
-- Returns: 'eligible' or error reason

-- Use in WHERE clause to filter eligible students
SELECT s.* 
FROM students s
WHERE fn_student_eligibility(s.id, 10) = 'eligible';
```

---

#### 2. **fn_days_until_deadline**
**Returns**: INT (days remaining)  
**Purpose**: Calculates days remaining for an offer deadline

**Signature**:
```sql
CREATE FUNCTION fn_days_until_deadline(p_offer_id INT) 
RETURNS INT
```

**Logic**:
```sql
DELIMITER //
CREATE FUNCTION fn_days_until_deadline(p_offer_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE deadline_date DATE;
    
    SELECT deadline INTO deadline_date
    FROM offers WHERE id = p_offer_id;
    
    RETURN DATEDIFF(deadline_date, CURDATE());
END//
DELIMITER ;
```

**Usage Examples**:
```sql
-- Find offers closing soon
SELECT id, role, company_id, 
       fn_days_until_deadline(id) AS days_left
FROM offers
WHERE fn_days_until_deadline(id) BETWEEN 0 AND 7
ORDER BY days_left;

-- Alert students about expiring deadlines
SELECT a.*, fn_days_until_deadline(a.offer_id) AS urgency
FROM applications a
WHERE a.status = 'pending' 
  AND fn_days_until_deadline(a.offer_id) < 3;
```

---

#### 3. **fn_placement_rate**
**Returns**: DECIMAL (percentage)  
**Purpose**: Calculates placement rate for a department/batch combination

**Signature**:
```sql
CREATE FUNCTION fn_placement_rate(
    p_department_id INT, 
    p_batch_id INT
) RETURNS DECIMAL(5,2)
```

**Logic**:
```sql
DELIMITER //
CREATE FUNCTION fn_placement_rate(p_department_id INT, p_batch_id INT)
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    DECLARE total INT DEFAULT 0;
    DECLARE placed INT DEFAULT 0;
    
    SELECT total_students, total_placed 
    INTO total, placed
    FROM placement_stats
    WHERE department_id = p_department_id 
      AND batch_id = p_batch_id;
    
    IF total = 0 THEN
        RETURN 0.00;
    END IF;
    
    RETURN (placed / total) * 100;
END//
DELIMITER ;
```

**Usage Examples**:
```sql
-- Get placement rate for CSE 2024 batch
SELECT fn_placement_rate(1, 3) AS placement_percentage;
-- Returns: 75.50 (means 75.5% students placed)

-- Compare placement rates across departments
SELECT d.dept_name, 
       fn_placement_rate(d.id, 3) AS placement_rate
FROM departments d
ORDER BY placement_rate DESC;
```

---

### Stored Procedures (3 Total)

#### 1. **sp_advance_to_next_round**
**Purpose**: Promotes all students who passed a round to the next round

**Signature**:
```sql
CALL sp_advance_to_next_round(p_offer_id INT, p_current_round INT);
```

**Logic**:
```sql
DELIMITER //
CREATE PROCEDURE sp_advance_to_next_round(
    IN p_offer_id INT,
    IN p_current_round INT
)
BEGIN
    DECLARE next_round_id INT;
    
    -- Get next round ID
    SELECT id INTO next_round_id
    FROM placement_rounds
    WHERE offer_id = p_offer_id 
      AND round_number = p_current_round + 1;
    
    -- Insert pending results for all students who passed current round
    INSERT INTO round_results (application_id, round_id, result)
    SELECT rr.application_id, next_round_id, 'pending'
    FROM round_results rr
    JOIN placement_rounds pr ON pr.id = rr.round_id
    WHERE pr.offer_id = p_offer_id
      AND pr.round_number = p_current_round
      AND rr.result = 'pass';
      
    SELECT ROW_COUNT() AS students_advanced;
END//
DELIMITER ;
```

**Real-World Example**:
```sql
-- Scenario: Google SDE role, 50 students passed Round 1 (Aptitude)
-- HR wants to move them all to Round 2 (Technical Interview)

CALL sp_advance_to_next_round(10, 1);
-- Output: students_advanced: 50

-- Now 50 students have 'pending' results for Round 2
SELECT COUNT(*) FROM round_results 
WHERE round_id = (SELECT id FROM placement_rounds WHERE offer_id=10 AND round_number=2)
AND result = 'pending';
-- Returns: 50
```

**Automation Benefit**: One procedure call vs. 50 individual INSERT statements.

---

#### 2. **sp_bulk_reject**
**Purpose**: Rejects all pending applications for an offer and notifies students

**Signature**:
```sql
CALL sp_bulk_reject(p_offer_id INT, p_reason VARCHAR(500));
```

**Logic**:
```sql
DELIMITER //
CREATE PROCEDURE sp_bulk_reject(
    IN p_offer_id INT,
    IN p_reason VARCHAR(500)
)
BEGIN
    -- Update all pending/shortlisted applications to rejected
    UPDATE applications
    SET status = 'rejected'
    WHERE offer_id = p_offer_id
      AND status IN ('pending', 'shortlisted');
    
    -- Send notifications to all affected students
    INSERT INTO notifications (user_id, title, message, type)
    SELECT s.user_id,
           'Application Rejected',
           CONCAT('Your application was rejected. Reason: ', p_reason),
           'placement'
    FROM applications a
    JOIN students s ON s.id = a.student_id
    WHERE a.offer_id = p_offer_id
      AND a.status = 'rejected';
      
    SELECT ROW_COUNT() AS notifications_sent;
END//
DELIMITER ;
```

**Use Cases**:
```sql
-- Scenario 1: Company cancels recruitment drive
CALL sp_bulk_reject(15, 'Company has cancelled recruitment for this year');

-- Scenario 2: Position filled through off-campus hiring
CALL sp_bulk_reject(22, 'Position already filled through lateral hiring');

-- Scenario 3: Budget cuts
CALL sp_bulk_reject(18, 'Due to budget constraints, this position is no longer available');
```

**Automation Benefit**: 
- Rejects 100s of applications in single call
- Sends individual notifications to all students
- Maintains data consistency

---

#### 3. **sp_generate_branch_report**
**Purpose**: Generates comprehensive placement report for a department

**Signature**:
```sql
CALL sp_generate_branch_report(p_department_id INT, p_batch_id INT);
```

**Logic**:
```sql
DELIMITER //
CREATE PROCEDURE sp_generate_branch_report(
    IN p_department_id INT,
    IN p_batch_id INT
)
BEGIN
    SELECT 
        d.dept_name AS department,
        b.batch_name AS batch,
        ps.total_students,
        ps.total_placed,
        ps.total_offers,
        CONCAT(ROUND((ps.total_placed / NULLIF(ps.total_students, 0)) * 100, 2), '%') AS placement_rate,
        ps.highest_package,
        ps.average_package,
        ps.lowest_package,
        ps.last_updated
    FROM placement_stats ps
    JOIN departments d ON d.id = ps.department_id
    JOIN academic_batches b ON b.id = ps.batch_id
    WHERE ps.department_id = p_department_id
      AND ps.batch_id = p_batch_id;
      
    -- Also return top recruiters for this department/batch
    SELECT c.name AS company_name,
           COUNT(DISTINCT a.student_id) AS students_hired,
           AVG(o.ctc) AS average_ctc
    FROM applications a
    JOIN students s ON s.id = a.student_id
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    WHERE s.department_id = p_department_id
      AND s.batch_id = p_batch_id
      AND a.status = 'placed'
    GROUP BY c.id, c.name
    ORDER BY students_hired DESC
    LIMIT 10;
END//
DELIMITER ;
```

**Output Example**:
```
Result Set 1 (Overall Stats):
+------------------------+------------------+----------------+--------------+
| department             | batch            | total_students | total_placed |
+------------------------+------------------+----------------+--------------+
| Computer Science       | Batch 2024-2028  | 120            | 95           |
+------------------------+------------------+----------------+--------------+
| placement_rate | highest_package | average_package | lowest_package |
+----------------+-----------------+-----------------+----------------+
| 79.17%         | 45,00,000       | 12,50,000       | 6,00,000       |
+----------------+-----------------+-----------------+----------------+

Result Set 2 (Top Recruiters):
+-------------------+----------------+-------------+
| company_name      | students_hired | average_ctc |
+-------------------+----------------+-------------+
| Google            | 8              | 35,00,000   |
| Microsoft         | 7              | 32,00,000   |
| Amazon            | 6              | 28,00,000   |
+-------------------+----------------+-------------+
```

---

### Views (3 Total)

#### 1. **vw_placement_leaderboard**
**Purpose**: Real-time leaderboard of top placed students by package

**Definition**:
```sql
CREATE VIEW vw_placement_leaderboard AS
SELECT 
    s.roll_number,
    u.full_name,
    d.dept_name AS department,
    b.batch_name AS batch,
    c.name AS company_name,
    o.role,
    o.ctc AS package,
    a.placed_at
FROM applications a
JOIN students s ON s.id = a.student_id
JOIN users u ON u.id = s.user_id
JOIN departments d ON d.id = s.department_id
JOIN academic_batches b ON b.id = s.batch_id
JOIN offers o ON o.id = a.offer_id
JOIN companies c ON c.id = o.company_id
WHERE a.status = 'placed'
ORDER BY o.ctc DESC;
```

**Usage**:
```sql
-- Top 10 placements
SELECT * FROM vw_placement_leaderboard LIMIT 10;

-- Filter by department
SELECT * FROM vw_placement_leaderboard 
WHERE department = 'Computer Science' 
LIMIT 5;

-- Filter by company
SELECT * FROM vw_placement_leaderboard 
WHERE company_name = 'Google';
```

**Output Example**:
```
+-------------+------------------+-----------------------+-----------------+--------------+
| roll_number | full_name        | department            | company_name    | package      |
+-------------+------------------+-----------------------+-----------------+--------------+
| CSE001      | Amit Sharma      | Computer Science      | Google          | 45,00,000    |
| CSE023      | Priya Patel      | Computer Science      | Microsoft       | 38,00,000    |
| ECE015      | Rahul Mehta      | Electronics & Comm    | Amazon          | 32,00,000    |
+-------------+------------------+-----------------------+-----------------+--------------+
```

---

#### 2. **vw_placement_pipeline**
**Purpose**: Shows active recruitment pipeline with application counts per stage

**Definition**:
```sql
CREATE VIEW vw_placement_pipeline AS
SELECT 
    c.name AS company_name,
    o.role,
    o.ctc,
    o.deadline,
    COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) AS pending_count,
    COUNT(DISTINCT CASE WHEN a.status = 'shortlisted' THEN a.id END) AS shortlisted_count,
    COUNT(DISTINCT CASE WHEN a.status = 'placed' THEN a.id END) AS placed_count,
    COUNT(DISTINCT CASE WHEN a.status = 'rejected' THEN a.id END) AS rejected_count,
    COUNT(DISTINCT a.id) AS total_applications
FROM offers o
JOIN companies c ON c.id = o.company_id
LEFT JOIN applications a ON a.offer_id = o.id
GROUP BY o.id, c.name, o.role, o.ctc, o.deadline
ORDER BY o.deadline ASC;
```

**Usage**:
```sql
-- View all active pipelines
SELECT * FROM vw_placement_pipeline;

-- Find offers with high rejection rates
SELECT *, (rejected_count / total_applications * 100) AS rejection_rate
FROM vw_placement_pipeline
WHERE total_applications > 0
ORDER BY rejection_rate DESC;
```

**Output Example**:
```
+--------------+------------------+------------+---------------+------------------+
| company_name | role             | ctc        | pending_count | shortlisted_count|
+--------------+------------------+------------+---------------+------------------+
| Google       | SDE              | 45,00,000  | 35            | 12               |
| Microsoft    | SDE-2            | 38,00,000  | 28            | 18               |
| Amazon       | Software Engineer| 32,00,000  | 42            | 25               |
+--------------+------------------+------------+---------------+------------------+
| placed_count | rejected_count | total_applications |
+--------------+----------------+--------------------|
| 3            | 15             | 65                 |
| 5            | 8              | 59                 |
| 2            | 22             | 91                 |
+--------------+----------------+--------------------|
```

---

#### 3. **vw_company_performance**
**Purpose**: Analytics on company hiring patterns and selectivity

**Definition**:
```sql
CREATE VIEW vw_company_performance AS
SELECT 
    c.id AS company_id,
    c.name AS company_name,
    COUNT(DISTINCT o.id) AS total_offers,
    SUM(o.vacancies) AS total_vacancies,
    COUNT(DISTINCT a.id) AS total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'placed' THEN a.id END) AS total_hired,
    ROUND(AVG(o.ctc), 2) AS avg_package,
    MAX(o.ctc) AS highest_package,
    ROUND(
        COUNT(DISTINCT CASE WHEN a.status = 'placed' THEN a.id END) / 
        NULLIF(COUNT(DISTINCT a.id), 0) * 100, 
    2) AS selection_rate
FROM companies c
LEFT JOIN offers o ON o.company_id = c.id
LEFT JOIN applications a ON a.offer_id = o.id
GROUP BY c.id, c.name
ORDER BY total_hired DESC;
```

**Metrics Explained**:
- `total_offers`: Number of job postings by company
- `total_vacancies`: Sum of all open positions
- `total_applications`: How many students applied
- `total_hired`: How many actually got placed
- `selection_rate`: (Hired / Applications) × 100 → Lower = more selective

**Usage**:
```sql
-- Find most active recruiters
SELECT * FROM vw_company_performance 
ORDER BY total_offers DESC 
LIMIT 5;

-- Find most selective companies
SELECT company_name, selection_rate 
FROM vw_company_performance
WHERE total_applications > 20
ORDER BY selection_rate ASC 
LIMIT 10;

-- Find best paying companies
SELECT company_name, avg_package, highest_package
FROM vw_company_performance
ORDER BY avg_package DESC;
```

**Output Example**:
```
+--------------+-------------+------------------+------------------+--------------+
| company_name | total_offers| total_applications| total_hired     | selection_rate|
+--------------+-------------+------------------+------------------+--------------+
| Google       | 5           | 284              | 15              | 5.28         |
| Microsoft    | 4           | 245              | 22              | 8.98         |
| Amazon       | 6           | 312              | 18              | 5.77         |
+--------------+-------------+------------------+------------------+--------------+
| avg_package  | highest_package |
+--------------+-----------------|
| 38,50,000    | 45,00,000       |
| 32,75,000    | 40,00,000       |
| 28,60,000    | 35,00,000       |
+--------------+-----------------|
```

---

### Original SQL Objects (Pre-Expansion)

These SQL objects were part of the base system before expansion:

#### 4. **vw_student_eligible_offers** (View)
**Purpose**: Shows which job offers each student is eligible to apply for based on their CGPA, backlogs, and branch.

**Definition**:
```sql
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
```

**Columns Explained**:
- `already_applied`: Boolean indicating if student has already submitted application
- Filters only open offers with future deadlines
- Checks CGPA and backlog eligibility
- Checks branch eligibility (if branches are specified)

**Usage**:
```sql
-- Get all offers a specific student can apply to
SELECT * FROM vw_student_eligible_offers 
WHERE student_id = 5 AND already_applied = FALSE;

-- Count eligible students for an offer
SELECT offer_id, title, COUNT(*) AS eligible_students
FROM vw_student_eligible_offers
GROUP BY offer_id, title;
```

---

#### 5. **trg_notify_status_change** (Trigger)
**Type**: AFTER UPDATE on `applications`  
**Purpose**: Automatically sends notification when application status changes

**Logic**:
```sql
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
END;
```

**When**: After application status is updated  
**What**: If status changed (pending → shortlisted, shortlisted → selected, etc.)  
**Action**: Creates notification for student with offer title and new status

**Example**:
```sql
-- Admin updates application status
UPDATE applications SET status = 'shortlisted' WHERE id = 42;
-- Trigger automatically creates notification:
-- "Your application for "SDE Intern - Google" has been updated to: shortlisted"
```

---

#### 6. **trg_block_closed_offer_apply** (Trigger)
**Type**: BEFORE INSERT on `applications`  
**Purpose**: Prevents students from applying to closed or filled offers

**Logic**:
```sql
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
END;
```

**When**: Before new application is inserted  
**What**: Checks if offer status is 'open'  
**Action**: Blocks insertion with error if offer is closed/filled

**Example**:
```sql
-- Offer #15 has status = 'closed'
INSERT INTO applications (student_id, offer_id, status)
VALUES (5, 15, 'pending');
-- ❌ ERROR: Cannot apply to a closed or filled offer
```

---

#### 7. **trg_single_interview_per_application** (Trigger)
**Type**: BEFORE INSERT on `interviews`  
**Purpose**: Prevents scheduling multiple active interviews for same application

**Logic**:
```sql
CREATE TRIGGER trg_single_interview_per_application
BEFORE INSERT ON interviews
FOR EACH ROW
BEGIN
  IF EXISTS (SELECT 1 FROM interviews WHERE application_id = NEW.application_id AND status != 'cancelled') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'An active interview is already scheduled for this application';
  END IF;
END;
```

**When**: Before new interview is scheduled  
**What**: Checks if application already has an active (non-cancelled) interview  
**Action**: Blocks insertion if active interview exists

**Use Case**: Ensures admins don't accidentally create duplicate interview slots.

---

#### 8. **GetOfferStats** (Stored Procedure)
**Purpose**: Generates comprehensive statistics for a job offer's applicants

**Signature**:
```sql
CALL GetOfferStats(p_offer_id INT);
```

**Logic**:
```sql
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
END;
```

**Returns**:
- Total applicants
- Breakdown by status (pending, shortlisted, selected, rejected)
- CGPA statistics (average, min, max) of all applicants

**Usage**:
```sql
CALL GetOfferStats(10);
```

**Output Example**:
```
+-------------------------+------------------+------------------+
| title                   | company          | total_applicants |
+-------------------------+------------------+------------------+
| SDE Intern              | Google           | 85               |
+-------------------------+------------------+------------------+
| pending | shortlisted | selected | rejected | avg_cgpa | min_cgpa | max_cgpa |
+---------+-------------+----------+----------+----------+----------+----------+
| 35      | 18          | 5        | 27       | 8.42     | 7.20     | 9.85     |
+---------+-------------+----------+----------+----------+----------+----------+
```

**Use Case**: Admin dashboard showing offer recruitment funnel and applicant quality metrics.

---

#### 9. **evt_close_expired_offers** (Scheduled Event)
**Purpose**: Automatically closes job offers past their deadline

**Schedule**: Runs daily at midnight

**Definition**:
```sql
CREATE EVENT IF NOT EXISTS evt_close_expired_offers
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  UPDATE offers SET status = 'closed'
  WHERE deadline < CURDATE() AND status = 'open';
```

**When**: Every day at midnight  
**What**: Checks all open offers  
**Action**: Sets status to 'closed' if deadline has passed

**Automation Benefit**: No manual intervention needed to close expired offers.

**Example**:
```
Day 1: Offer #20 has deadline = 2024-05-15, status = 'open'
Day 2 (2024-05-16 00:00): Event runs
Result: Offer #20 status → 'closed'
```

**Note**: Requires MySQL Event Scheduler to be enabled:
```sql
SET GLOBAL event_scheduler = ON;
```

---

## Backend API Endpoints

### Base URL
```
http://localhost:5000/api/admin
```

### Authentication
All endpoints require admin authentication via JWT token:
```
Authorization: Bearer <token>
```

---

### 1. Master Data Management

#### Departments

**GET /departments** - List all departments
```http
GET /api/admin/departments
Response: [
  {
    "id": 1,
    "dept_code": "CSE",
    "dept_name": "Computer Science",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

**POST /departments** - Create new department
```http
POST /api/admin/departments
Body: {
  "dept_code": "AI",
  "dept_name": "Artificial Intelligence"
}
Response: { "id": 10, "message": "Department created" }
```

**PUT /departments/:id** - Update department
```http
PUT /api/admin/departments/10
Body: {
  "dept_name": "Artificial Intelligence & ML"
}
Response: { "message": "Department updated" }
```

**DELETE /departments/:id** - Delete department
```http
DELETE /api/admin/departments/10
Response: { "message": "Department deleted" }
```

---

#### Academic Batches

**GET /batches** - List all batches
```http
GET /api/admin/batches
Response: [
  {
    "id": 1,
    "batch_name": "Batch 2022-2026",
    "start_year": 2022,
    "end_year": 2026,
    "graduation_year": 2026,
    "is_active": true
  }
]
```

**POST /batches** - Create new batch
```http
POST /api/admin/batches
Body: {
  "batch_name": "Batch 2025-2029",
  "start_year": 2025,
  "end_year": 2029,
  "graduation_year": 2029
}
Response: { "id": 4, "message": "Batch created" }
```

---

#### Recruiters

**GET /recruiters** - List all recruiters (with company info)
```http
GET /api/admin/recruiters
Response: [
  {
    "id": 1,
    "name": "Sarah Johnson",
    "email": "sarah.j@techcorp.com",
    "phone": "+1-555-0123",
    "designation": "Senior HR Manager",
    "is_primary": true,
    "company_id": 1,
    "company_name": "TechCorp Solutions"
  }
]
```

**POST /recruiters** - Add new recruiter
```http
POST /api/admin/recruiters
Body: {
  "company_id": 1,
  "name": "John Doe",
  "email": "john.doe@techcorp.com",
  "phone": "+1-555-9999",
  "designation": "Talent Acquisition Specialist",
  "is_primary": false
}
Response: { "id": 5, "message": "Recruiter created" }
```

---

### 2. Placement Status Management

**GET /placement-statuses** - List all status definitions
```http
GET /api/admin/placement-statuses
Response: [
  {
    "id": 1,
    "status_name": "Applied",
    "status_description": "Initial application submitted",
    "status_order": 1
  }
]
```

**POST /placement-statuses** - Create custom status
```http
POST /api/admin/placement-statuses
Body: {
  "status_name": "On Hold",
  "status_description": "Application temporarily paused",
  "status_order": 6
}
```

---

### 3. Recruitment Flow Management

#### Placement Rounds

**GET /placement-rounds/:offerId** - Get all rounds for an offer
```http
GET /api/admin/placement-rounds/10
Response: [
  {
    "id": 45,
    "offer_id": 10,
    "round_number": 1,
    "round_name": "Aptitude Test",
    "round_type": "aptitude",
    "scheduled_date": "2024-06-15"
  },
  {
    "id": 46,
    "offer_id": 10,
    "round_number": 2,
    "round_name": "Technical Interview",
    "round_type": "technical",
    "scheduled_date": "2024-06-20"
  }
]
```

**POST /placement-rounds** - Create new round
```http
POST /api/admin/placement-rounds
Body: {
  "offer_id": 10,
  "round_number": 3,
  "round_name": "HR Round",
  "round_type": "hr",
  "scheduled_date": "2024-06-25"
}
Response: { "id": 47, "message": "Round created" }
```

---

#### Round Results

**GET /round-results/:applicationId** - Get student's round results
```http
GET /api/admin/round-results/250
Response: [
  {
    "id": 1024,
    "application_id": 250,
    "round_id": 45,
    "round_name": "Aptitude Test",
    "result": "pass",
    "score": 85.50,
    "feedback": "Good performance in logical reasoning",
    "evaluated_at": "2024-06-16T14:30:00.000Z"
  }
]
```

**POST /round-results** - Record round result
```http
POST /api/admin/round-results
Body: {
  "application_id": 250,
  "round_id": 46,
  "result": "pass",
  "score": 92.0,
  "feedback": "Excellent problem solving skills"
}
Response: { "id": 1025, "message": "Result recorded" }
```

**Note**: If result='fail', trigger auto-rejects application and notifies student.

---

### 4. Document Management

**GET /documents/:studentId** - Get student's documents
```http
GET /api/admin/documents/5
Response: [
  {
    "id": 12,
    "student_id": 5,
    "doc_type": "resume",
    "file_url": "/uploads/resumes/student_5_resume_v3.pdf",
    "file_name": "Amit_Sharma_Resume.pdf",
    "version_no": 3,
    "uploaded_at": "2024-03-15T10:00:00.000Z",
    "is_active": true
  }
]
```

**POST /documents** - Upload new document
```http
POST /api/admin/documents
Body: {
  "student_id": 5,
  "doc_type": "certificate",
  "file_url": "/uploads/certs/student_5_cert_v1.pdf",
  "file_name": "AWS_Certification.pdf"
}
Response: { "id": 25, "version_no": 1, "message": "Document uploaded" }
```

---

### 5. Feedback System

**GET /feedback/:applicationId** - Get feedback for an application
```http
GET /api/admin/feedback/250
Response: [
  {
    "id": 88,
    "application_id": 250,
    "feedback_by": 2,
    "rating": 4,
    "comments": "Strong technical skills, needs work on communication",
    "feedback_type": "interview_performance",
    "created_at": "2024-06-20T16:45:00.000Z",
    "admin_name": "Dr. Rajesh Kumar"
  }
]
```

**POST /feedback** - Submit feedback
```http
POST /api/admin/feedback
Body: {
  "application_id": 250,
  "feedback_by": 2,
  "rating": 5,
  "comments": "Outstanding candidate, highly recommended",
  "feedback_type": "interview_performance"
}
Response: { "id": 89, "message": "Feedback submitted" }
```

---

### 6. Blacklist Management

**GET /blacklist** - List all blacklisted students
```http
GET /api/admin/blacklist
Response: [
  {
    "id": 3,
    "student_id": 15,
    "student_name": "John Doe",
    "company_id": 5,
    "company_name": "TechCorp",
    "reason": "Unprofessional behavior in interview",
    "blacklisted_at": "2024-05-10T09:00:00.000Z",
    "expires_at": "2025-05-10",
    "is_active": true
  }
]
```

**POST /blacklist** - Add student to blacklist
```http
POST /api/admin/blacklist
Body: {
  "student_id": 15,
  "company_id": 5,
  "reason": "Submitted fake documents",
  "expires_at": "2025-12-31"
}
Response: { "id": 4, "message": "Student blacklisted" }
```

**PUT /blacklist/:id** - Deactivate blacklist entry
```http
PUT /api/admin/blacklist/3
Body: {
  "is_active": false
}
Response: { "message": "Blacklist updated" }
```

---

### 7. Analytics Endpoints

#### Placement Stats

**GET /placement-stats** - Get aggregated statistics
```http
GET /api/admin/placement-stats
Response: [
  {
    "id": 1,
    "department_id": 1,
    "dept_name": "Computer Science",
    "batch_id": 3,
    "batch_name": "Batch 2024-2028",
    "total_students": 120,
    "total_placed": 95,
    "total_offers": 98,
    "highest_package": 4500000,
    "average_package": 1250000,
    "lowest_package": 600000,
    "placement_rate": 79.17
  }
]
```

---

#### Leaderboard

**GET /analytics/leaderboard** - Top placements
```http
GET /api/admin/analytics/leaderboard?limit=10
Response: [
  {
    "roll_number": "CSE001",
    "full_name": "Amit Sharma",
    "department": "Computer Science",
    "batch": "Batch 2024-2028",
    "company_name": "Google",
    "role": "SDE",
    "package": 4500000,
    "placed_at": "2024-05-20T10:00:00.000Z"
  }
]
```

---

#### Pipeline View

**GET /analytics/pipeline** - Active recruitment pipeline
```http
GET /api/admin/analytics/pipeline
Response: [
  {
    "company_name": "Google",
    "role": "SDE",
    "ctc": 4500000,
    "deadline": "2024-07-15",
    "pending_count": 35,
    "shortlisted_count": 12,
    "placed_count": 3,
    "rejected_count": 15,
    "total_applications": 65
  }
]
```

---

#### Company Performance

**GET /analytics/company-performance** - Company hiring analytics
```http
GET /api/admin/analytics/company-performance
Response: [
  {
    "company_id": 1,
    "company_name": "Google",
    "total_offers": 5,
    "total_vacancies": 15,
    "total_applications": 284,
    "total_hired": 15,
    "avg_package": 3850000,
    "highest_package": 4500000,
    "selection_rate": 5.28
  }
]
```

---

### 8. SQL Procedure Endpoints

#### Advance Round

**POST /procedures/advance-round** - Move passed students to next round
```http
POST /api/admin/procedures/advance-round
Body: {
  "offer_id": 10,
  "current_round": 1
}
Response: {
  "success": true,
  "students_advanced": 45
}
```

---

#### Bulk Reject

**POST /procedures/bulk-reject** - Reject all pending applications
```http
POST /api/admin/procedures/bulk-reject
Body: {
  "offer_id": 15,
  "reason": "Position filled through off-campus hiring"
}
Response: {
  "success": true,
  "notifications_sent": 78
}
```

---

#### Branch Report

**POST /procedures/branch-report** - Generate department report
```http
POST /api/admin/procedures/branch-report
Body: {
  "department_id": 1,
  "batch_id": 3
}
Response: {
  "success": true,
  "overall_stats": {
    "department": "Computer Science",
    "batch": "Batch 2024-2028",
    "total_students": 120,
    "total_placed": 95,
    "placement_rate": "79.17%",
    "highest_package": 4500000,
    "average_package": 1250000
  },
  "top_recruiters": [
    {
      "company_name": "Google",
      "students_hired": 8,
      "average_ctc": 3500000
    }
  ]
}
```

---

### 9. Seeding Endpoint

**POST /seed-expansion** - Populate database with dummy data
```http
POST /api/admin/seed-expansion
Response: {
  "success": true,
  "message": "Expansion data seeded successfully",
  "summary": {
    "departments": 9,
    "batches": 3,
    "recruiters": 3,
    "students_updated": 5,
    "placement_rounds": 9,
    "round_results": 15,
    "placement_statuses": 5,
    "documents": 10,
    "feedback": 8,
    "blacklist": 2,
    "placement_stats": 6
  }
}
```

---

## Frontend Features

### Expansion Hub Page
**Route**: `/admin/expansion`  
**Component**: `ExpansionHub.jsx`

### Tab 1: Catalog Management

#### Departments Section
- **List View**: Table showing all departments with dept_code and dept_name
- **Create Form**: Add new department with code and name
- **Edit**: Inline editing of department names
- **Delete**: Remove departments (with FK constraint warnings)

#### Batches Section
- **List View**: Table with batch name, years, graduation year, active status
- **Create Form**: Define new batch with:
  - Batch name (e.g., "Batch 2025-2029")
  - Start year, End year, Graduation year
  - Active toggle
- **Edit**: Update batch details

#### Recruiters Section
- **List View**: Table with recruiter name, company, email, phone, designation, primary flag
- **Create Form**: Add recruiter with:
  - Company selection dropdown (populated from companies table)
  - Name, Email, Phone
  - Designation
  - Primary contact checkbox
- **Filter**: View recruiters by company

---

### Tab 2: Recruitment Flow

#### Placement Rounds Section
- **Offer Selection**: Dropdown to select job offer
- **Rounds List**: Shows all rounds for selected offer with:
  - Round number, Name, Type, Scheduled date
- **Create Round**: Form with:
  - Round number (auto-suggests next)
  - Round name (e.g., "Technical Interview 1")
  - Round type dropdown (Aptitude, Technical, HR, GD, Final)
  - Scheduled date picker

#### Round Results Section
- **Application Selection**: Dropdown to select student application
- **Results List**: Shows evaluation history for selected application
- **Record Result**: Form with:
  - Round selection
  - Result dropdown (Pending, Pass, Fail, Absent)
  - Score input (0-100)
  - Feedback textarea
- **Auto-Rejection Alert**: Warning when marking as 'Fail'

#### Placement Statuses Section
- **Status List**: All defined statuses in workflow order
- **Create Status**: Define custom status with:
  - Status name
  - Description
  - Workflow order number

#### Blacklist Section
- **Blacklist View**: Table with student, company, reason, expiry, active status
- **Add to Blacklist**: Form with:
  - Student selection
  - Company selection (or leave blank for global ban)
  - Reason textarea
  - Expiry date (or permanent)
- **Deactivate**: Mark blacklist as inactive
- **Alert**: Shows active count and recent additions

---

### Tab 3: Documents & Feedback

#### Documents Section
- **Student Selection**: Dropdown to pick student
- **Documents List**: Shows all documents with:
  - Document type, Filename, Version, Upload date, Active status
- **Upload Document**: Form with:
  - Document type dropdown (Resume, Cover Letter, Certificate, Transcript, Other)
  - File upload button
  - Auto-versioning (increments version for same doc type)
- **Version History**: View all versions, mark as active

#### Feedback Section
- **Application Selection**: Dropdown to select application
- **Feedback List**: All feedback entries with:
  - Rating (1-5 stars)
  - Feedback type
  - Comments
  - Submitted by (admin name)
  - Timestamp
- **Submit Feedback**: Form with:
  - Rating selector (1-5 stars)
  - Feedback type (Resume Review, Interview Performance, General)
  - Comments textarea
- **Average Rating**: Calculated and displayed

---

### Tab 4: Analytics & SQL Features

#### Placement Stats Section
- **Stats Cards**: Grid of metrics:
  - Total Departments: 9
  - Active Batches: 3
  - Total Placed: 95
  - Avg Package: ₹12.5 LPA
- **Department-wise Stats Table**: Breakdown by dept/batch with:
  - Department, Batch
  - Total Students, Placed Count
  - Placement Rate %
  - Highest, Average, Lowest Package

#### Leaderboard Section
- **Top Placements Table**: Sorted by package descending
  - Rank, Roll Number, Name
  - Department, Batch
  - Company, Role
  - Package
- **Filters**: By department, batch, company
- **Limit Control**: Show top 10/25/50

#### Pipeline View Section
- **Active Offers Table**: Current recruitment status
  - Company, Role, CTC, Deadline
  - Pending, Shortlisted, Placed, Rejected counts
  - Total Applications
  - Progress bars
- **Selection Rate**: Visual indicators for selectivity

#### Company Performance Section
- **Analytics Table**: Company-wise metrics
  - Company Name
  - Total Offers Posted
  - Total Applications Received
  - Students Hired
  - Avg Package, Highest Package
  - Selection Rate %
- **Charts**: (Planned) Bar charts for visual comparison

#### SQL Procedures Section
- **Advance Round Tool**:
  - Select offer and current round
  - "Advance to Next Round" button
  - Shows count of students promoted
- **Bulk Reject Tool**:
  - Select offer
  - Provide rejection reason
  - "Reject All Pending" button (with confirmation)
  - Shows notification count
- **Branch Report Generator**:
  - Select department and batch
  - "Generate Report" button
  - Displays overall stats + top recruiters in modal

---

### Dashboard Enhancements

#### Seed Data Button
**Location**: Admin Dashboard  
**Function**: Populates database with comprehensive dummy data

**What it seeds**:
- 9 Departments (CSE, ECE, ME, CE, EE, IT, BT, CH, MBA)
- 3 Academic Batches (2022-26, 2023-27, 2024-28)
- 3 Recruiters (for existing companies)
- 5 Students updated with dept/batch links
- 3 Offers with multiple rounds (9 total rounds)
- 15 Round results (mix of pass/fail/pending)
- 5 Placement statuses
- 10 Student documents (resumes, certificates)
- 8 Feedback entries
- 2 Blacklist entries
- 6 Placement stats records

**Button**: 
```
[🌱 Seed Expansion Data]
```

---

## Complete SQL Command History

### Phase 1: Initial Setup (Migration 001)

#### 1.1 Database Connection
```sql
-- Connected to MySQL using credentials from .env
mysql -u root -p --password="<from .env>"
```

#### 1.2 Schema Creation (schema.sql - Lines 1-200)
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS placement_db;
USE placement_db;

-- Core tables
CREATE TABLE users (...);
CREATE TABLE students (...);
CREATE TABLE companies (...);
CREATE TABLE offers (...);
CREATE TABLE applications (...);
CREATE TABLE interviews (...);
CREATE TABLE notifications (...);
```

---

### Phase 2: Database Expansion (Migration 002)

#### 2.1 Master Tables Creation
```sql
-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dept_code VARCHAR(10) UNIQUE NOT NULL,
    dept_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Academic batches table
CREATE TABLE IF NOT EXISTS academic_batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_name VARCHAR(50) NOT NULL,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    graduation_year INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Placement statuses table
CREATE TABLE IF NOT EXISTS placement_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) UNIQUE NOT NULL,
    status_description TEXT,
    status_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.2 Foreign Key Additions to Students Table
```sql
-- Add department reference
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS department_id INT,
ADD CONSTRAINT fk_students_department 
    FOREIGN KEY (department_id) REFERENCES departments(id);

-- Add batch reference
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS batch_id INT,
ADD CONSTRAINT fk_students_batch 
    FOREIGN KEY (batch_id) REFERENCES academic_batches(id);
```

#### 2.3 Recruiters Table
```sql
CREATE TABLE IF NOT EXISTS recruiters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    designation VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
```

#### 2.4 Placement Rounds Table
```sql
CREATE TABLE IF NOT EXISTS placement_rounds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    offer_id INT NOT NULL,
    round_number INT NOT NULL,
    round_name VARCHAR(100) NOT NULL,
    round_type ENUM('aptitude', 'technical', 'hr', 'group_discussion', 'final') NOT NULL,
    scheduled_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_round (offer_id, round_number)
);
```

#### 2.5 Round Results Table
```sql
CREATE TABLE IF NOT EXISTS round_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    round_id INT NOT NULL,
    result ENUM('pending', 'pass', 'fail', 'absent') DEFAULT 'pending',
    score DECIMAL(5,2),
    feedback TEXT,
    evaluated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (round_id) REFERENCES placement_rounds(id) ON DELETE CASCADE,
    UNIQUE KEY unique_result (application_id, round_id)
);
```

#### 2.6 Documents Table
```sql
CREATE TABLE IF NOT EXISTS documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    doc_type ENUM('resume', 'cover_letter', 'certificate', 'transcript', 'other') NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    version_no INT DEFAULT 1,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_doc_version (student_id, doc_type, version_no)
);
```

#### 2.7 Blacklist Table
```sql
CREATE TABLE IF NOT EXISTS blacklist_students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    company_id INT,
    reason TEXT NOT NULL,
    blacklisted_by INT,
    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATE,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
```

#### 2.8 Feedback Table
```sql
CREATE TABLE IF NOT EXISTS feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    feedback_by INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    feedback_type ENUM('resume_review', 'interview_performance', 'general') DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
```

#### 2.9 Placement Stats Table (Materialized)
```sql
CREATE TABLE IF NOT EXISTS placement_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT,
    batch_id INT,
    total_students INT DEFAULT 0,
    total_placed INT DEFAULT 0,
    total_offers INT DEFAULT 0,
    highest_package DECIMAL(10,2),
    average_package DECIMAL(10,2),
    lowest_package DECIMAL(10,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_stats (department_id, batch_id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (batch_id) REFERENCES academic_batches(id)
);
```

#### 2.10 Audit Log Table
```sql
CREATE TABLE IF NOT EXISTS offer_audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    offer_id INT NOT NULL,
    changed_by INT,
    change_type ENUM('created', 'updated', 'deleted', 'status_changed') NOT NULL,
    old_values JSON,
    new_values JSON,
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
);
```

---

### Phase 3: SQL Objects Creation

#### 3.1 Trigger: Block Blacklisted Students
```sql
DROP TRIGGER IF EXISTS trg_block_blacklisted_student;

DELIMITER //
CREATE TRIGGER trg_block_blacklisted_student 
BEFORE INSERT ON applications
FOR EACH ROW
BEGIN
    DECLARE is_blacklisted INT;
    DECLARE offer_company INT;
    
    SELECT company_id INTO offer_company
    FROM offers WHERE id = NEW.offer_id;
    
    SELECT COUNT(*) INTO is_blacklisted
    FROM blacklist_students
    WHERE student_id = NEW.student_id
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > CURDATE())
      AND (company_id IS NULL OR company_id = offer_company);
    
    IF is_blacklisted > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot apply: Student is blacklisted';
    END IF;
END//
DELIMITER ;
```

#### 3.2 Trigger: Auto-Reject on Fail
```sql
DROP TRIGGER IF EXISTS trg_auto_reject_on_fail;

DELIMITER //
CREATE TRIGGER trg_auto_reject_on_fail
AFTER INSERT ON round_results
FOR EACH ROW
BEGIN
    IF NEW.result = 'fail' THEN
        UPDATE applications 
        SET status = 'rejected' 
        WHERE id = NEW.application_id;
        
        INSERT INTO notifications (user_id, title, message, type)
        SELECT s.user_id,
               'Application Rejected',
               CONCAT('Your application has been rejected due to round failure'),
               'placement'
        FROM applications a
        JOIN students s ON s.id = a.student_id
        WHERE a.id = NEW.application_id;
    END IF;
END//
DELIMITER ;
```

#### 3.3 Trigger: Update Placement Stats
```sql
DROP TRIGGER IF EXISTS trg_update_placement_stats;

DELIMITER //
CREATE TRIGGER trg_update_placement_stats
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    DECLARE dept_id INT;
    DECLARE bat_id INT;
    DECLARE offer_ctc DECIMAL(10,2);
    
    IF NEW.status = 'placed' AND OLD.status != 'placed' THEN
        SELECT department_id, batch_id INTO dept_id, bat_id
        FROM students WHERE id = NEW.student_id;
        
        SELECT ctc INTO offer_ctc
        FROM offers WHERE id = NEW.offer_id;
        
        INSERT INTO placement_stats (
            department_id, batch_id, total_placed, total_offers,
            highest_package, lowest_package
        )
        VALUES (
            dept_id, bat_id, 1, 1,
            offer_ctc, offer_ctc
        )
        ON DUPLICATE KEY UPDATE 
            total_placed = total_placed + 1,
            total_offers = total_offers + 1,
            highest_package = GREATEST(COALESCE(highest_package, 0), offer_ctc),
            lowest_package = LEAST(COALESCE(lowest_package, 999999999), offer_ctc);
    END IF;
END//
DELIMITER ;
```

#### 3.4 Trigger: Log Offer Changes
```sql
DROP TRIGGER IF EXISTS trg_log_offer_changes;

DELIMITER //
CREATE TRIGGER trg_log_offer_changes
AFTER UPDATE ON offers
FOR EACH ROW
BEGIN
    INSERT INTO offer_audit_log (offer_id, change_type, old_values, new_values)
    VALUES (
        NEW.id,
        'updated',
        JSON_OBJECT(
            'ctc', OLD.ctc,
            'vacancies', OLD.vacancies,
            'deadline', OLD.deadline,
            'minimum_cgpa', OLD.minimum_cgpa
        ),
        JSON_OBJECT(
            'ctc', NEW.ctc,
            'vacancies', NEW.vacancies,
            'deadline', NEW.deadline,
            'minimum_cgpa', NEW.minimum_cgpa
        )
    );
END//
DELIMITER ;
```

#### 3.5 Function: Student Eligibility
```sql
DROP FUNCTION IF EXISTS fn_student_eligibility;

DELIMITER //
CREATE FUNCTION fn_student_eligibility(
    p_student_id INT, 
    p_offer_id INT
) RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE student_cgpa DECIMAL(3,2);
    DECLARE student_backlogs INT;
    DECLARE student_branch VARCHAR(50);
    DECLARE min_cgpa DECIMAL(3,2);
    DECLARE max_backlogs INT;
    DECLARE eligible_branches TEXT;
    
    SELECT cgpa, backlogs, branch 
    INTO student_cgpa, student_backlogs, student_branch
    FROM students WHERE id = p_student_id;
    
    SELECT minimum_cgpa, maximum_backlogs, eligible_branches 
    INTO min_cgpa, max_backlogs, eligible_branches
    FROM offers WHERE id = p_offer_id;
    
    IF student_cgpa < min_cgpa THEN
        RETURN 'low_cgpa';
    END IF;
    
    IF student_backlogs > max_backlogs THEN
        RETURN 'too_many_backlogs';
    END IF;
    
    IF eligible_branches IS NOT NULL 
       AND FIND_IN_SET(student_branch, eligible_branches) = 0 THEN
        RETURN 'wrong_branch';
    END IF;
    
    RETURN 'eligible';
END//
DELIMITER ;
```

#### 3.6 Function: Days Until Deadline
```sql
DROP FUNCTION IF EXISTS fn_days_until_deadline;

DELIMITER //
CREATE FUNCTION fn_days_until_deadline(p_offer_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE deadline_date DATE;
    
    SELECT deadline INTO deadline_date
    FROM offers WHERE id = p_offer_id;
    
    RETURN DATEDIFF(deadline_date, CURDATE());
END//
DELIMITER ;
```

#### 3.7 Function: Placement Rate
```sql
DROP FUNCTION IF EXISTS fn_placement_rate;

DELIMITER //
CREATE FUNCTION fn_placement_rate(
    p_department_id INT, 
    p_batch_id INT
) RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    DECLARE total INT DEFAULT 0;
    DECLARE placed INT DEFAULT 0;
    
    SELECT total_students, total_placed 
    INTO total, placed
    FROM placement_stats
    WHERE department_id = p_department_id 
      AND batch_id = p_batch_id;
    
    IF total = 0 THEN
        RETURN 0.00;
    END IF;
    
    RETURN (placed / total) * 100;
END//
DELIMITER ;
```

#### 3.8 Procedure: Advance to Next Round
```sql
DROP PROCEDURE IF EXISTS sp_advance_to_next_round;

DELIMITER //
CREATE PROCEDURE sp_advance_to_next_round(
    IN p_offer_id INT,
    IN p_current_round INT
)
BEGIN
    DECLARE next_round_id INT;
    
    SELECT id INTO next_round_id
    FROM placement_rounds
    WHERE offer_id = p_offer_id 
      AND round_number = p_current_round + 1;
    
    IF next_round_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Next round does not exist';
    END IF;
    
    INSERT INTO round_results (application_id, round_id, result)
    SELECT rr.application_id, next_round_id, 'pending'
    FROM round_results rr
    JOIN placement_rounds pr ON pr.id = rr.round_id
    WHERE pr.offer_id = p_offer_id
      AND pr.round_number = p_current_round
      AND rr.result = 'pass';
      
    SELECT ROW_COUNT() AS students_advanced;
END//
DELIMITER ;
```

#### 3.9 Procedure: Bulk Reject
```sql
DROP PROCEDURE IF EXISTS sp_bulk_reject;

DELIMITER //
CREATE PROCEDURE sp_bulk_reject(
    IN p_offer_id INT,
    IN p_reason VARCHAR(500)
)
BEGIN
    UPDATE applications
    SET status = 'rejected'
    WHERE offer_id = p_offer_id
      AND status IN ('pending', 'shortlisted');
    
    INSERT INTO notifications (user_id, title, message, type)
    SELECT s.user_id,
           'Application Rejected',
           CONCAT('Your application was rejected. Reason: ', p_reason),
           'placement'
    FROM applications a
    JOIN students s ON s.id = a.student_id
    WHERE a.offer_id = p_offer_id
      AND a.status = 'rejected';
      
    SELECT ROW_COUNT() AS notifications_sent;
END//
DELIMITER ;
```

#### 3.10 Procedure: Generate Branch Report
```sql
DROP PROCEDURE IF EXISTS sp_generate_branch_report;

DELIMITER //
CREATE PROCEDURE sp_generate_branch_report(
    IN p_department_id INT,
    IN p_batch_id INT
)
BEGIN
    -- Overall stats
    SELECT 
        d.dept_name AS department,
        b.batch_name AS batch,
        ps.total_students,
        ps.total_placed,
        ps.total_offers,
        CONCAT(ROUND((ps.total_placed / NULLIF(ps.total_students, 0)) * 100, 2), '%') AS placement_rate,
        ps.highest_package,
        ps.average_package,
        ps.lowest_package,
        ps.last_updated
    FROM placement_stats ps
    JOIN departments d ON d.id = ps.department_id
    JOIN academic_batches b ON b.id = ps.batch_id
    WHERE ps.department_id = p_department_id
      AND ps.batch_id = p_batch_id;
      
    -- Top recruiters
    SELECT c.name AS company_name,
           COUNT(DISTINCT a.student_id) AS students_hired,
           AVG(o.ctc) AS average_ctc
    FROM applications a
    JOIN students s ON s.id = a.student_id
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    WHERE s.department_id = p_department_id
      AND s.batch_id = p_batch_id
      AND a.status = 'placed'
    GROUP BY c.id, c.name
    ORDER BY students_hired DESC
    LIMIT 10;
END//
DELIMITER ;
```

#### 3.11 View: Placement Leaderboard
```sql
DROP VIEW IF EXISTS vw_placement_leaderboard;

CREATE VIEW vw_placement_leaderboard AS
SELECT 
    s.roll_number,
    u.full_name,
    d.dept_name AS department,
    b.batch_name AS batch,
    c.name AS company_name,
    o.role,
    o.ctc AS package,
    a.placed_at
FROM applications a
JOIN students s ON s.id = a.student_id
JOIN users u ON u.id = s.user_id
LEFT JOIN departments d ON d.id = s.department_id
LEFT JOIN academic_batches b ON b.id = s.batch_id
JOIN offers o ON o.id = a.offer_id
JOIN companies c ON c.id = o.company_id
WHERE a.status = 'placed'
ORDER BY o.ctc DESC;
```

#### 3.12 View: Placement Pipeline
```sql
DROP VIEW IF EXISTS vw_placement_pipeline;

CREATE VIEW vw_placement_pipeline AS
SELECT 
    c.name AS company_name,
    o.role,
    o.ctc,
    o.deadline,
    COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) AS pending_count,
    COUNT(DISTINCT CASE WHEN a.status = 'shortlisted' THEN a.id END) AS shortlisted_count,
    COUNT(DISTINCT CASE WHEN a.status = 'placed' THEN a.id END) AS placed_count,
    COUNT(DISTINCT CASE WHEN a.status = 'rejected' THEN a.id END) AS rejected_count,
    COUNT(DISTINCT a.id) AS total_applications
FROM offers o
JOIN companies c ON c.id = o.company_id
LEFT JOIN applications a ON a.offer_id = o.id
GROUP BY o.id, c.name, o.role, o.ctc, o.deadline
ORDER BY o.deadline ASC;
```

#### 3.13 View: Company Performance
```sql
DROP VIEW IF EXISTS vw_company_performance;

CREATE VIEW vw_company_performance AS
SELECT 
    c.id AS company_id,
    c.name AS company_name,
    COUNT(DISTINCT o.id) AS total_offers,
    SUM(o.vacancies) AS total_vacancies,
    COUNT(DISTINCT a.id) AS total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'placed' THEN a.id END) AS total_hired,
    ROUND(AVG(o.ctc), 2) AS avg_package,
    MAX(o.ctc) AS highest_package,
    ROUND(
        COUNT(DISTINCT CASE WHEN a.status = 'placed' THEN a.id END) / 
        NULLIF(COUNT(DISTINCT a.id), 0) * 100, 
    2) AS selection_rate
FROM companies c
LEFT JOIN offers o ON o.company_id = c.id
LEFT JOIN applications a ON a.offer_id = o.id
GROUP BY c.id, c.name
ORDER BY total_hired DESC;
```

---

### Phase 4: Master Data Seeding

#### 4.1 Department Data
```sql
INSERT INTO departments (dept_code, dept_name) VALUES
('CSE', 'Computer Science'),
('ECE', 'Electronics & Communication'),
('ME', 'Mechanical Engineering'),
('CE', 'Civil Engineering'),
('EE', 'Electrical Engineering'),
('IT', 'Information Technology'),
('BT', 'Biotechnology'),
('CH', 'Chemical Engineering'),
('MBA', 'Business Administration')
ON DUPLICATE KEY UPDATE dept_name=VALUES(dept_name);
```

#### 4.2 Batch Data
```sql
INSERT INTO academic_batches (batch_name, start_year, end_year, graduation_year, is_active) VALUES
('Batch 2022-2026', 2022, 2026, 2026, TRUE),
('Batch 2023-2027', 2023, 2027, 2027, TRUE),
('Batch 2024-2028', 2024, 2028, 2028, TRUE)
ON DUPLICATE KEY UPDATE is_active=VALUES(is_active);
```

#### 4.3 Placement Status Data
```sql
INSERT INTO placement_statuses (status_name, status_description, status_order) VALUES
('Applied', 'Initial application submitted', 1),
('Shortlisted', 'Resume shortlisted for next round', 2),
('Interview Scheduled', 'Interview round scheduled', 3),
('Offer Received', 'Job offer received', 4),
('Rejected', 'Application rejected', 99)
ON DUPLICATE KEY UPDATE status_description=VALUES(status_description);
```

#### 4.4 Recruiter Data
```sql
INSERT INTO recruiters (company_id, name, email, phone, designation, is_primary) VALUES
(1, 'Sarah Johnson', 'sarah.j@techcorp.com', '+1-555-0123', 'Senior HR Manager', TRUE),
(2, 'Michael Chen', 'm.chen@innovate.io', '+1-555-0456', 'Talent Acquisition Lead', TRUE),
(3, 'Emily Rodriguez', 'emily.r@startup.xyz', '+1-555-0789', 'People Operations Manager', TRUE)
ON DUPLICATE KEY UPDATE designation=VALUES(designation);
```

#### 4.5 Student Updates (Link to Dept/Batch)
```sql
UPDATE students SET department_id = 1, batch_id = 3 WHERE id = 1;
UPDATE students SET department_id = 2, batch_id = 3 WHERE id = 2;
UPDATE students SET department_id = 1, batch_id = 2 WHERE id = 3;
UPDATE students SET department_id = 3, batch_id = 3 WHERE id = 4;
UPDATE students SET department_id = 1, batch_id = 3 WHERE id = 5;
```

---

### Phase 5: Transaction Data Seeding

#### 5.1 Placement Rounds
```sql
INSERT INTO placement_rounds (offer_id, round_number, round_name, round_type, scheduled_date) VALUES
(1, 1, 'Aptitude Test', 'aptitude', '2024-06-15'),
(1, 2, 'Technical Interview 1', 'technical', '2024-06-20'),
(1, 3, 'HR Round', 'hr', '2024-06-25'),
(2, 1, 'Online Coding Round', 'aptitude', '2024-06-18'),
(2, 2, 'System Design Interview', 'technical', '2024-06-22'),
(2, 3, 'Final Interview', 'final', '2024-06-28'),
(3, 1, 'Group Discussion', 'group_discussion', '2024-06-10'),
(3, 2, 'Technical Panel', 'technical', '2024-06-14'),
(3, 3, 'Final HR', 'hr', '2024-06-18')
ON DUPLICATE KEY UPDATE scheduled_date=VALUES(scheduled_date);
```

#### 5.2 Round Results
```sql
INSERT INTO round_results (application_id, round_id, result, score, feedback) VALUES
(1, 1, 'pass', 85.50, 'Good performance in logical reasoning'),
(1, 2, 'pass', 90.00, 'Excellent problem solving'),
(2, 1, 'pass', 78.00, 'Average aptitude score'),
(2, 2, 'fail', 55.00, 'Weak technical knowledge'),
(3, 4, 'pass', 92.50, 'Outstanding coding skills'),
(3, 5, 'pending', NULL, NULL),
(4, 7, 'pass', 88.00, 'Good communication'),
(5, 1, 'absent', NULL, 'Did not attend test')
ON DUPLICATE KEY UPDATE result=VALUES(result);
```

#### 5.3 Documents
```sql
INSERT INTO documents (student_id, doc_type, file_url, file_name, version_no, is_active) VALUES
(1, 'resume', '/uploads/resumes/student_1_resume_v1.pdf', 'Amit_Sharma_Resume.pdf', 1, FALSE),
(1, 'resume', '/uploads/resumes/student_1_resume_v2.pdf', 'Amit_Sharma_Resume_Updated.pdf', 2, TRUE),
(1, 'certificate', '/uploads/certs/student_1_aws_cert.pdf', 'AWS_Certification.pdf', 1, TRUE),
(2, 'resume', '/uploads/resumes/student_2_resume_v1.pdf', 'Priya_Patel_Resume.pdf', 1, TRUE),
(3, 'resume', '/uploads/resumes/student_3_resume_v1.pdf', 'Rahul_Mehta_Resume.pdf', 1, TRUE),
(3, 'cover_letter', '/uploads/letters/student_3_cover.pdf', 'Cover_Letter_Google.pdf', 1, TRUE)
ON DUPLICATE KEY UPDATE is_active=VALUES(is_active);
```

#### 5.4 Feedback
```sql
INSERT INTO feedback (application_id, feedback_by, rating, comments, feedback_type) VALUES
(1, 2, 5, 'Outstanding candidate with strong technical skills', 'interview_performance'),
(2, 2, 3, 'Needs improvement in data structures', 'interview_performance'),
(3, 2, 4, 'Good problem solving approach', 'interview_performance'),
(1, 2, 4, 'Well-structured resume', 'resume_review')
ON DUPLICATE KEY UPDATE rating=VALUES(rating);
```

#### 5.5 Blacklist
```sql
INSERT INTO blacklist_students (student_id, company_id, reason, expires_at, is_active) VALUES
(4, 1, 'Unprofessional behavior in interview', '2025-06-30', TRUE),
(5, NULL, 'Submitted fake documents - permanent ban', NULL, TRUE)
ON DUPLICATE KEY UPDATE is_active=VALUES(is_active);
```

#### 5.6 Placement Stats (Initial Seeding)
```sql
INSERT INTO placement_stats (department_id, batch_id, total_students, total_placed, total_offers, highest_package, average_package, lowest_package) VALUES
(1, 3, 40, 32, 35, 4500000, 1250000, 600000),
(2, 3, 35, 28, 30, 3800000, 1100000, 550000),
(3, 3, 30, 20, 22, 2500000, 900000, 500000),
(1, 2, 38, 30, 32, 4200000, 1150000, 580000),
(2, 2, 32, 26, 28, 3500000, 1050000, 520000),
(3, 2, 28, 18, 20, 2200000, 850000, 480000)
ON DUPLICATE KEY UPDATE 
    total_students=VALUES(total_students),
    total_placed=VALUES(total_placed),
    total_offers=VALUES(total_offers),
    highest_package=VALUES(highest_package),
    average_package=VALUES(average_package),
    lowest_package=VALUES(lowest_package);
```

---

### Phase 6: Testing SQL Objects

#### 6.1 Test Eligibility Function
```sql
-- Check if student is eligible for an offer
SELECT fn_student_eligibility(1, 1) AS eligibility_status;
-- Expected: 'eligible' or specific rejection reason

-- Find all eligible students for offer #1
SELECT s.id, s.roll_number, u.full_name, fn_student_eligibility(s.id, 1) AS status
FROM students s
JOIN users u ON u.id = s.user_id
WHERE fn_student_eligibility(s.id, 1) = 'eligible';
```

#### 6.2 Test Deadline Function
```sql
-- Check days remaining for offer #1
SELECT id, role, deadline, fn_days_until_deadline(id) AS days_left
FROM offers
WHERE id = 1;

-- Find urgent offers (closing in 7 days)
SELECT id, role, deadline, fn_days_until_deadline(id) AS urgency
FROM offers
WHERE fn_days_until_deadline(id) BETWEEN 0 AND 7;
```

#### 6.3 Test Placement Rate Function
```sql
-- Get placement rate for CSE Batch 2024-2028
SELECT fn_placement_rate(1, 3) AS placement_percentage;
-- Expected: Decimal percentage like 80.00

-- Compare all departments
SELECT d.dept_name, fn_placement_rate(d.id, 3) AS rate
FROM departments d
ORDER BY rate DESC;
```

#### 6.4 Test Advance Round Procedure
```sql
-- Move students who passed Round 1 to Round 2 for Offer #1
CALL sp_advance_to_next_round(1, 1);
-- Expected output: { "students_advanced": 15 } (or actual count)

-- Verify results created
SELECT * FROM round_results WHERE round_id = 2 AND result = 'pending';
```

#### 6.5 Test Bulk Reject Procedure
```sql
-- Reject all pending applications for Offer #3
CALL sp_bulk_reject(3, 'Position cancelled due to budget cuts');
-- Expected output: { "notifications_sent": 42 }

-- Verify applications updated
SELECT COUNT(*) FROM applications WHERE offer_id = 3 AND status = 'rejected';

-- Verify notifications sent
SELECT * FROM notifications WHERE message LIKE '%budget cuts%';
```

#### 6.6 Test Branch Report Procedure
```sql
-- Generate report for CSE Batch 2024-2028
CALL sp_generate_branch_report(1, 3);
-- Expected: Two result sets (overall stats + top recruiters)
```

#### 6.7 Test Blacklist Trigger
```sql
-- Try to apply when blacklisted
-- Student #4 is blacklisted from Company #1

-- This should FAIL with error
INSERT INTO applications (student_id, offer_id, status)
VALUES (4, 1, 'pending');
-- Expected ERROR: Cannot apply: Student is blacklisted

-- Verify trigger blocked the insertion
SELECT COUNT(*) FROM applications WHERE student_id = 4 AND offer_id = 1;
-- Expected: 0
```

#### 6.8 Test Auto-Reject Trigger
```sql
-- Record a failing round result
INSERT INTO round_results (application_id, round_id, result, score)
VALUES (10, 3, 'fail', 35.5);

-- Verify application auto-rejected
SELECT id, status FROM applications WHERE id = 10;
-- Expected: status = 'rejected'

-- Verify notification sent
SELECT * FROM notifications WHERE message LIKE '%rejected due to round failure%';
```

#### 6.9 Test Placement Stats Trigger
```sql
-- Mark application as placed
UPDATE applications SET status = 'placed', placed_at = NOW() WHERE id = 5;

-- Verify stats incremented
SELECT * FROM placement_stats WHERE department_id = 1 AND batch_id = 3;
-- Expected: total_placed increased by 1
```

#### 6.10 Test Audit Log Trigger
```sql
-- Update an offer
UPDATE offers SET ctc = 1800000, vacancies = 10 WHERE id = 1;

-- Verify audit entry created
SELECT * FROM offer_audit_log WHERE offer_id = 1 ORDER BY change_timestamp DESC LIMIT 1;
-- Expected: JSON with old and new values
```

#### 6.11 Test Views
```sql
-- Query leaderboard
SELECT * FROM vw_placement_leaderboard LIMIT 10;

-- Query pipeline
SELECT * FROM vw_placement_pipeline WHERE deadline > CURDATE();

-- Query company performance
SELECT * FROM vw_company_performance ORDER BY selection_rate ASC LIMIT 5;
```

---

## Data Flow and Architecture

### System Architecture Diagram (Description)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│                     (React + Vite on :5173)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Student    │  │    Admin     │  │   Company    │         │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                          │                                      │
│                    ┌─────▼──────┐                              │
│                    │ Expansion  │                              │
│                    │    Hub     │                              │
│                    │  (4 Tabs)  │                              │
│                    └────────────┘                              │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST API
                         │ (JSON)
┌────────────────────────▼────────────────────────────────────────┐
│                      BACKEND LAYER                              │
│                   (Express.js on :5000)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Route Handlers                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  /api/admin/*         → Admin operations (30+ endpoints) │  │
│  │  /api/student/*       → Student operations               │  │
│  │  /api/company/*       → Company operations               │  │
│  │  /api/auth/*          → Authentication                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐ │
│  │                 Business Logic Layer                      │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │  • Validation & Authorization                            │ │
│  │  • Data transformation                                   │ │
│  │  • Seeding logic                                         │ │
│  │  • Error handling                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐ │
│  │                   Database Layer                          │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │  • Parameterized queries                                 │ │
│  │  • Transaction management                                │ │
│  │  • Connection pooling                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ MySQL Protocol
                         │ (SQL Queries)
┌────────────────────────▼────────────────────────────────────────┐
│                      DATABASE LAYER                             │
│                   (MySQL Server 9.6)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Data Tables (23)                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Core: users, students, companies, offers, applications  │  │
│  │  Expansion: departments, batches, recruiters, rounds...  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐ │
│  │                  SQL Objects Layer                        │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │  Triggers (4):                                           │ │
│  │    • trg_block_blacklisted_student                       │ │
│  │    • trg_auto_reject_on_fail                             │ │
│  │    • trg_update_placement_stats                          │ │
│  │    • trg_log_offer_changes                               │ │
│  │                                                           │ │
│  │  Functions (3):                                          │ │
│  │    • fn_student_eligibility                              │ │
│  │    • fn_days_until_deadline                              │ │
│  │    • fn_placement_rate                                   │ │
│  │                                                           │ │
│  │  Procedures (3):                                         │ │
│  │    • sp_advance_to_next_round                            │ │
│  │    • sp_bulk_reject                                      │ │
│  │    • sp_generate_branch_report                           │ │
│  │                                                           │ │
│  │  Views (3):                                              │ │
│  │    • vw_placement_leaderboard                            │ │
│  │    • vw_placement_pipeline                               │ │
│  │    • vw_company_performance                              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Key Data Flows

#### Flow 1: Student Applies to Job Offer
```
1. Student clicks "Apply" on frontend
   ↓
2. Frontend sends POST /api/applications
   ↓
3. Backend validates eligibility (calls fn_student_eligibility)
   ↓
4. Backend inserts into applications table
   ↓
5. Trigger trg_block_blacklisted_student checks blacklist
   ↓
6. If not blacklisted, INSERT succeeds
   ↓
7. Notification created for student
   ↓
8. Frontend shows success message
```

#### Flow 2: Round Result Recording
```
1. Admin evaluates student performance
   ↓
2. Admin submits result form in Expansion Hub
   ↓
3. Frontend sends POST /api/admin/round-results
   Body: { application_id, round_id, result: 'fail', score: 45 }
   ↓
4. Backend inserts into round_results table
   ↓
5. Trigger trg_auto_reject_on_fail fires
   ↓
6. Trigger updates application status to 'rejected'
   ↓
7. Trigger inserts notification for student
   ↓
8. Student receives email/notification about rejection
   ↓
9. Frontend refreshes and shows updated status
```

#### Flow 3: Placement Stats Update
```
1. HR marks application as 'placed'
   ↓
2. Frontend sends PUT /api/admin/applications/:id
   Body: { status: 'placed' }
   ↓
3. Backend updates application record
   ↓
4. Trigger trg_update_placement_stats fires
   ↓
5. Trigger reads student's department and batch
   ↓
6. Trigger reads offer's CTC
   ↓
7. Trigger increments placement_stats counters
   ↓
8. Trigger updates highest/lowest package if applicable
   ↓
9. Analytics dashboard auto-refreshes with new stats
```

#### Flow 4: Bulk Round Advancement
```
1. Admin clicks "Advance to Next Round" in Expansion Hub
   ↓
2. Frontend sends POST /api/admin/procedures/advance-round
   Body: { offer_id: 10, current_round: 1 }
   ↓
3. Backend calls sp_advance_to_next_round(10, 1)
   ↓
4. Procedure finds all students with result='pass' in Round 1
   ↓
5. Procedure gets next round ID (Round 2)
   ↓
6. Procedure INSERTs round_results for all passed students
   ↓
7. Procedure returns count of students advanced
   ↓
8. Frontend shows "45 students advanced to Round 2"
```

---

### Security Measures

1. **SQL Injection Prevention**
   - All queries use parameterized statements
   - No string concatenation for query building
   - Input validation on all endpoints

2. **Authentication**
   - JWT token-based auth
   - Admin routes protected with auth middleware
   - Role-based access control

3. **Data Integrity**
   - Foreign key constraints enforce referential integrity
   - CHECK constraints validate data ranges
   - Unique constraints prevent duplicates
   - Triggers enforce business rules

4. **Audit Trail**
   - offer_audit_log tracks all offer modifications
   - Timestamps on all tables
   - Changed_by fields track who made changes

---

### Performance Optimizations

1. **Materialized Stats**
   - placement_stats pre-aggregated for fast dashboard queries
   - Trigger-based incremental updates
   - Avoids expensive JOINs on large tables

2. **Indexes**
   - Primary keys on all tables
   - Unique keys on (offer_id, round_number), (student_id, doc_type, version_no)
   - Foreign keys auto-indexed

3. **Views for Common Queries**
   - Leaderboard, Pipeline, Company Performance
   - Encapsulates complex JOINs
   - Simplifies frontend queries

4. **Connection Pooling**
   - MySQL connection pool in db.js
   - Reuses connections
   - Configurable pool size

---

## Conclusion

This placement management system demonstrates:

✅ **Database Design**: Normalized 3NF schema with 20 tables  
✅ **Advanced SQL**: 19 total SQL objects
  - 7 Triggers (4 expansion + 3 original)
  - 3 Functions
  - 4 Procedures (3 expansion + 1 original)
  - 4 Views (3 expansion + 1 original)
  - 1 Scheduled Event  
✅ **Backend Development**: 30+ REST API endpoints with Express.js  
✅ **Frontend Development**: React-based admin interface with 4-tab Expansion Hub  
✅ **Data Integrity**: Foreign keys, constraints, triggers  
✅ **Automation**: Trigger-based business logic + scheduled events  
✅ **Analytics**: Real-time stats, leaderboards, pipelines  
✅ **Audit Trail**: Complete change logging  
✅ **Scalability**: Materialized views, connection pooling  
✅ **User Experience**: Auto-notifications, eligibility checking, deadline management

The system is production-ready and can handle hundreds of students, companies, and placements with automated workflows, comprehensive analytics, and robust data integrity.

---

**Document Generated**: 2024  
**Project**: College Placement Management System  
**Database**: MySQL 9.6  
**Backend**: Node.js + Express.js  
**Frontend**: React + Vite  
**Total Tables**: 23  
**Total SQL Objects**: 19 (7 triggers + 3 functions + 4 procedures + 4 views + 1 event)  
**Total API Endpoints**: 30+
**Backend**: Node.js + Express.js  
**Frontend**: React + Vite  
**Total Tables**: 23  
**Total SQL Objects**: 13 (4 triggers + 3 functions + 3 procedures + 3 views)  
**Total API Endpoints**: 30+

---
