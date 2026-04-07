-- Update placement_statuses with final_application_id for selected students
-- This links the placement status to the actual job offer they got selected for

-- Student 1 (Riya Sharma) - placed with Software Engineer Intern
UPDATE placement_statuses 
SET final_application_id = 3, 
    status = 'placed',
    updated_at = NOW()
WHERE student_id = 1;

-- Student 3 (Neha Iyer) - not placed yet, keep as is
-- No update needed

-- Student 5 (Ishita Sen) - placed with Cloud Associate Program  
UPDATE placement_statuses 
SET final_application_id = 13,
    status = 'placed',
    updated_at = NOW()
WHERE student_id = 5;

-- Add placement statuses for students 2 and 4 if they don't exist
INSERT IGNORE INTO placement_statuses (student_id, status, updated_by, updated_at)
VALUES 
  (2, 'not_placed', 1, NOW()),
  (4, 'not_placed', 1, NOW());

-- Verify the updates
SELECT 
  ps.id,
  u.name AS student_name,
  s.reg_number,
  ps.status,
  o.title AS placed_company,
  o.stipend AS package_amount
FROM placement_statuses ps
JOIN students s ON s.id = ps.student_id
JOIN users u ON u.id = s.user_id
LEFT JOIN applications a ON a.id = ps.final_application_id
LEFT JOIN offers o ON o.id = a.offer_id
ORDER BY ps.updated_at DESC;
