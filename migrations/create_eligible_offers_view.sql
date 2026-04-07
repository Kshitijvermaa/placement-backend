-- Migration: Create vw_student_eligible_offers view
-- Date: 2026-04-07
-- Purpose: Filter offers based on student eligibility (CGPA, backlogs, branch)

CREATE VIEW IF NOT EXISTS vw_student_eligible_offers AS
SELECT 
  s.id AS student_id,
  u.name AS student_name,
  s.branch,
  s.cgpa,
  s.backlogs,
  o.id AS offer_id,
  o.title AS offer_title,
  c.name AS company_name,
  o.stipend,
  o.deadline,
  o.type AS offer_type,
  CASE WHEN a.id IS NOT NULL THEN TRUE ELSE FALSE END AS already_applied,
  a.status AS application_status
FROM students s
JOIN users u ON s.user_id = u.id
CROSS JOIN offers o
JOIN companies c ON o.company_id = c.id
JOIN offer_branches ob ON ob.offer_id = o.id
JOIN branches b ON b.id = ob.branch_id
LEFT JOIN applications a ON a.student_id = s.id AND a.offer_id = o.id
WHERE o.status = 'open' 
  AND o.deadline >= CURDATE()
  AND s.cgpa >= o.min_cgpa
  AND s.backlogs <= o.max_backlogs
  AND (b.code = s.branch OR b.code = 'ALL');
