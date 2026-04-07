const express = require('express');
const { promisify } = require('util');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const query = promisify(db.query).bind(db);

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
  next();
};

const asyncHandler = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all offers (admin view — includes all statuses)
router.get('/offers', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT offers.*, companies.name AS company_name,
           COUNT(applications.id) AS applicant_count
    FROM offers
    JOIN companies ON offers.company_id = companies.id
    LEFT JOIN applications ON applications.offer_id = offers.id
    GROUP BY offers.id
    ORDER BY offers.created_at DESC
  `);
  res.json(rows);
}));

// POST create offer
router.post('/offers', auth, isAdmin, asyncHandler(async (req, res) => {
  const {
    company_id, title, description, type, stipend, location, min_cgpa, max_backlogs, deadline,
  } = req.body;
  const result = await query(`
    INSERT INTO offers (company_id, posted_by, title, description, type, stipend, location, min_cgpa, max_backlogs, deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [company_id, req.user.id, title, description, type, stipend, location, min_cgpa, max_backlogs, deadline]);
  res.json({ message: 'Offer posted successfully', offerId: result.insertId });
}));

// GET applicants for a specific offer
router.get('/applicants/:offer_id', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT applications.*, students.reg_number, students.branch, students.cgpa,
           users.name, users.email, offers.title
    FROM applications
    JOIN students ON applications.student_id = students.id
    JOIN users ON students.user_id = users.id
    JOIN offers ON applications.offer_id = offers.id
    WHERE applications.offer_id = ?
    ORDER BY students.cgpa DESC
  `, [req.params.offer_id]);
  res.json(rows);
}));

// PUT update application status
router.put('/applications/:id/status', auth, isAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'shortlisted', 'selected', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const result = await query(
    'UPDATE applications SET status = ?, updated_by = ? WHERE id = ?',
    [status, req.user.id, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Application not found' });

  const notifyRows = await query(`
    SELECT students.user_id, offers.title, companies.name AS company_name
    FROM applications
    JOIN students ON applications.student_id = students.id
    JOIN offers ON applications.offer_id = offers.id
    JOIN companies ON offers.company_id = companies.id
    WHERE applications.id = ?
  `, [req.params.id]);

  if (notifyRows.length > 0) {
    const { user_id, title, company_name } = notifyRows[0];
    const message = `Your application for ${title} at ${company_name} was ${status}.`;
    await query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [user_id, message]);
  }

  res.json({ message: 'Application status updated' });
}));

// GET all students
router.get('/students', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT users.name, users.email, students.*
    FROM students
    JOIN users ON students.user_id = users.id
    ORDER BY users.name
  `);
  res.json(rows);
}));

// ---- Expansion endpoints ----

router.get('/expansion/overview', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT 'departments' AS label, COUNT(*) AS total FROM departments
    UNION ALL SELECT 'batches', COUNT(*) FROM academic_batches
    UNION ALL SELECT 'recruiters', COUNT(*) FROM recruiters
    UNION ALL SELECT 'statuses', COUNT(*) FROM placement_statuses
    UNION ALL SELECT 'rounds', COUNT(*) FROM placement_rounds
    UNION ALL SELECT 'results', COUNT(*) FROM round_results
    UNION ALL SELECT 'feedback', COUNT(*) FROM feedback
    UNION ALL SELECT 'documents', COUNT(*) FROM documents
    UNION ALL SELECT 'blacklist', COUNT(*) FROM blacklist
  `);
  const map = rows.reduce((acc, item) => ({ ...acc, [item.label]: item.total }), {});
  res.json(map);
}));

router.get('/expansion/meta', auth, isAdmin, asyncHandler(async (req, res) => {
  const [companies, students, offers, recruiters, rounds] = await Promise.all([
    query('SELECT id, name FROM companies ORDER BY name'),
    query('SELECT s.id, u.name, s.reg_number FROM students s JOIN users u ON u.id = s.user_id ORDER BY u.name'),
    query('SELECT id, title FROM offers ORDER BY created_at DESC'),
    query(`
      SELECT r.id, r.name, c.name AS company_name
      FROM recruiters r
      JOIN companies c ON c.id = r.company_id
      ORDER BY r.created_at DESC
    `),
    query(`
      SELECT pr.id, pr.round_number, pr.type, o.title
      FROM placement_rounds pr
      JOIN offers o ON o.id = pr.offer_id
      ORDER BY pr.scheduled_at DESC, pr.id DESC
    `),
  ]);
  res.json({ companies, students, offers, recruiters, rounds });
}));

router.get('/departments', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM departments ORDER BY code');
  res.json(rows);
}));

router.post('/departments', auth, isAdmin, asyncHandler(async (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'code and name are required' });
  const result = await query('INSERT INTO departments (code, name) VALUES (?, ?)', [code.toUpperCase(), name]);
  res.json({ message: 'Department created', id: result.insertId });
}));

router.get('/batches', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM academic_batches ORDER BY graduation_year DESC');
  res.json(rows);
}));

router.post('/batches', auth, isAdmin, asyncHandler(async (req, res) => {
  const { batch_label, start_year, end_year, graduation_year } = req.body;
  if (!batch_label || !start_year || !end_year || !graduation_year) {
    return res.status(400).json({ error: 'batch_label, start_year, end_year, graduation_year are required' });
  }
  const result = await query(`
    INSERT INTO academic_batches (batch_label, start_year, end_year, graduation_year)
    VALUES (?, ?, ?, ?)
  `, [batch_label, start_year, end_year, graduation_year]);
  res.json({ message: 'Batch created', id: result.insertId });
}));

router.get('/recruiters', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT r.*, c.name AS company_name
    FROM recruiters r
    JOIN companies c ON c.id = r.company_id
    ORDER BY r.created_at DESC
  `);
  res.json(rows);
}));

router.post('/recruiters', auth, isAdmin, asyncHandler(async (req, res) => {
  const { company_id, name, email, phone, designation, is_primary } = req.body;
  if (!company_id || !name || !email) {
    return res.status(400).json({ error: 'company_id, name, email are required' });
  }
  const result = await query(`
    INSERT INTO recruiters (company_id, name, email, phone, designation, is_primary)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [company_id, name, email, phone || null, designation || null, !!is_primary]);
  res.json({ message: 'Recruiter created', id: result.insertId });
}));

router.get('/placement-statuses', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT ps.*, u.name, s.reg_number
    FROM placement_statuses ps
    JOIN students s ON s.id = ps.student_id
    JOIN users u ON u.id = s.user_id
    ORDER BY ps.updated_at DESC
  `);
  res.json(rows);
}));

router.put('/placement-statuses/:id', auth, isAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = ['not_placed', 'placed', 'higher_studies', 'entrepreneurship', 'inactive'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid placement status' });
  const result = await query(
    'UPDATE placement_statuses SET status = ?, updated_by = ? WHERE id = ?',
    [status, req.user.id, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Status row not found' });
  res.json({ message: 'Placement status updated' });
}));

router.get('/placement-rounds', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT pr.*, o.title AS offer_title, c.name AS company_name
    FROM placement_rounds pr
    JOIN offers o ON o.id = pr.offer_id
    JOIN companies c ON c.id = o.company_id
    ORDER BY pr.scheduled_at DESC, pr.id DESC
  `);
  res.json(rows);
}));

router.post('/placement-rounds', auth, isAdmin, asyncHandler(async (req, res) => {
  const { offer_id, round_number, type, scheduled_at, duration_minutes, max_students } = req.body;
  if (!offer_id || !round_number || !type) {
    return res.status(400).json({ error: 'offer_id, round_number, type are required' });
  }
  const result = await query(`
    INSERT INTO placement_rounds (offer_id, round_number, type, scheduled_at, duration_minutes, max_students)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [offer_id, round_number, type, scheduled_at || null, duration_minutes || null, max_students || null]);
  res.json({ message: 'Placement round created', id: result.insertId });
}));

router.get('/round-results', auth, isAdmin, asyncHandler(async (req, res) => {
  const { round_id } = req.query;
  const where = round_id ? 'WHERE rr.round_id = ?' : '';
  const params = round_id ? [round_id] : [];
  const rows = await query(`
    SELECT rr.*, pr.round_number, pr.type AS round_type, o.title AS offer_title,
           u.name AS student_name, s.reg_number
    FROM round_results rr
    JOIN placement_rounds pr ON pr.id = rr.round_id
    JOIN applications a ON a.id = rr.application_id
    JOIN offers o ON o.id = a.offer_id
    JOIN students s ON s.id = a.student_id
    JOIN users u ON u.id = s.user_id
    ${where}
    ORDER BY rr.evaluated_at DESC
  `, params);
  res.json(rows);
}));

router.post('/round-results', auth, isAdmin, asyncHandler(async (req, res) => {
  const { application_id, round_id, result, score, remarks } = req.body;
  if (!application_id || !round_id || !result) {
    return res.status(400).json({ error: 'application_id, round_id, result are required' });
  }
  await query(`
    INSERT INTO round_results (application_id, round_id, result, score, remarks, evaluated_by)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      result = VALUES(result),
      score = VALUES(score),
      remarks = VALUES(remarks),
      evaluated_by = VALUES(evaluated_by),
      evaluated_at = CURRENT_TIMESTAMP
  `, [application_id, round_id, result, score || null, remarks || null, req.user.id]);
  res.json({ message: 'Round result saved' });
}));

router.get('/feedback', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT f.*, u.name AS student_name, s.reg_number, o.title AS offer_title, r.name AS recruiter_name
    FROM feedback f
    JOIN applications a ON a.id = f.application_id
    JOIN students s ON s.id = a.student_id
    JOIN users u ON u.id = s.user_id
    JOIN offers o ON o.id = a.offer_id
    LEFT JOIN recruiters r ON r.id = f.recruiter_id
    ORDER BY f.created_at DESC
  `);
  res.json(rows);
}));

router.post('/feedback', auth, isAdmin, asyncHandler(async (req, res) => {
  const { application_id, recruiter_id, rating, comments, is_anonymous } = req.body;
  if (!application_id || !rating) return res.status(400).json({ error: 'application_id and rating are required' });
  await query(`
    INSERT INTO feedback (application_id, recruiter_id, rating, comments, is_anonymous)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      recruiter_id = VALUES(recruiter_id),
      rating = VALUES(rating),
      comments = VALUES(comments),
      is_anonymous = VALUES(is_anonymous)
  `, [application_id, recruiter_id || null, rating, comments || null, !!is_anonymous]);
  res.json({ message: 'Feedback saved' });
}));

router.get('/documents', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT d.*, u.name AS student_name, s.reg_number, v.name AS verified_by_name
    FROM documents d
    JOIN students s ON s.id = d.student_id
    JOIN users u ON u.id = s.user_id
    LEFT JOIN users v ON v.id = d.verified_by
    ORDER BY d.uploaded_at DESC
  `);
  res.json(rows);
}));

router.post('/documents', auth, isAdmin, asyncHandler(async (req, res) => {
  const { student_id, doc_type, version_no, file_path, verified } = req.body;
  if (!student_id || !doc_type || !file_path) {
    return res.status(400).json({ error: 'student_id, doc_type, file_path are required' });
  }
  await query(`
    INSERT INTO documents (student_id, doc_type, version_no, file_path, verified, verified_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [student_id, doc_type, version_no || 1, file_path, !!verified, verified ? req.user.id : null]);
  res.json({ message: 'Document entry created' });
}));

router.get('/blacklist', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT b.*, u.name AS student_name, s.reg_number, a.name AS blacklisted_by_name
    FROM blacklist b
    JOIN students s ON s.id = b.student_id
    JOIN users u ON u.id = s.user_id
    JOIN users a ON a.id = b.blacklisted_by
    ORDER BY b.created_at DESC
  `);
  res.json(rows);
}));

router.post('/blacklist', auth, isAdmin, asyncHandler(async (req, res) => {
  const { student_id, reason, expires_at } = req.body;
  if (!student_id || !reason) return res.status(400).json({ error: 'student_id and reason are required' });
  const result = await query(`
    INSERT INTO blacklist (student_id, reason, blacklisted_by, active, expires_at)
    VALUES (?, ?, ?, TRUE, ?)
  `, [student_id, reason, req.user.id, expires_at || null]);
  res.json({ message: 'Student blacklisted', id: result.insertId });
}));

router.put('/blacklist/:id/deactivate', auth, isAdmin, asyncHandler(async (req, res) => {
  const result = await query('UPDATE blacklist SET active = FALSE WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Blacklist row not found' });
  res.json({ message: 'Blacklist entry deactivated' });
}));

router.get('/placement-stats', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT ps.*, d.code AS department_code, d.name AS department_name,
           b.batch_label, b.graduation_year
    FROM placement_stats ps
    JOIN departments d ON d.id = ps.department_id
    JOIN academic_batches b ON b.id = ps.batch_id
    ORDER BY b.graduation_year DESC, d.code
  `);
  res.json(rows);
}));

router.get('/analytics/leaderboard', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM vw_placement_leaderboard ORDER BY overall_rank ASC LIMIT 200');
  res.json(rows);
}));

router.get('/analytics/pipeline', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM vw_offer_pipeline ORDER BY offer_id DESC');
  res.json(rows);
}));

router.get('/analytics/company-performance', auth, isAdmin, asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM vw_company_performance ORDER BY conversion_rate DESC');
  res.json(rows);
}));

router.post('/procedures/advance-round', auth, isAdmin, asyncHandler(async (req, res) => {
  const { offer_id, round_number } = req.body;
  if (!offer_id || !round_number) return res.status(400).json({ error: 'offer_id and round_number are required' });
  await query('CALL sp_advance_to_next_round(?, ?)', [offer_id, round_number]);
  res.json({ message: 'Advanced passed students to next round' });
}));

router.post('/procedures/bulk-reject', auth, isAdmin, asyncHandler(async (req, res) => {
  const { offer_id } = req.body;
  if (!offer_id) return res.status(400).json({ error: 'offer_id is required' });
  await query('CALL sp_bulk_reject(?)', [offer_id]);
  res.json({ message: 'Pending applications bulk rejected for offer' });
}));

router.get('/reports/branch', auth, isAdmin, asyncHandler(async (req, res) => {
  const { branch_code, year } = req.query;
  if (!branch_code || !year) return res.status(400).json({ error: 'branch_code and year are required' });
  const rows = await query('CALL sp_generate_report(?, ?)', [branch_code, year]);
  // mysql2 returns result sets for CALL
  res.json(Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows);
}));

// POST seed richer normalized dummy data for presentation/demo
router.post('/seed-dummy-data', auth, isAdmin, asyncHandler(async (req, res) => {
  await query('START TRANSACTION');
  try {
    await query(`
      INSERT IGNORE INTO departments (code, name) VALUES
      ('CSE', 'Computer Science Engineering'),
      ('IT', 'Information Technology'),
      ('ECE', 'Electronics and Communication Engineering'),
      ('EE', 'Electrical Engineering'),
      ('ME', 'Mechanical Engineering'),
      ('CE', 'Civil Engineering'),
      ('CHE', 'Chemical Engineering'),
      ('BT', 'Biotechnology'),
      ('AE', 'Aerospace Engineering')
    `);

    await query(`
      INSERT IGNORE INTO academic_batches (batch_label, start_year, end_year, graduation_year) VALUES
      ('2022-2026', 2022, 2026, 2026),
      ('2023-2027', 2023, 2027, 2027),
      ('2024-2028', 2024, 2028, 2028)
    `);

    await query(`
      INSERT IGNORE INTO companies (name, sector, location, contact_email, website) VALUES
      ('TechNova Systems', 'Software', 'Bengaluru', 'hr@technova.com', 'https://technova.example'),
      ('FinEdge Analytics', 'FinTech', 'Hyderabad', 'careers@finedge.com', 'https://finedge.example'),
      ('CloudOrbit Labs', 'Cloud', 'Pune', 'jobs@cloudorbit.com', 'https://cloudorbit.example')
    `);

    await query(`
      INSERT IGNORE INTO recruiters (company_id, name, email, phone, designation, is_primary) VALUES
      ((SELECT id FROM companies WHERE name = 'TechNova Systems' LIMIT 1), 'Aditi Rao', 'aditi.rao@technova.com', '9876500001', 'Talent Partner', TRUE),
      ((SELECT id FROM companies WHERE name = 'FinEdge Analytics' LIMIT 1), 'Nikhil Shah', 'nikhil.shah@finedge.com', '9876500002', 'Hiring Manager', TRUE),
      ((SELECT id FROM companies WHERE name = 'CloudOrbit Labs' LIMIT 1), 'Priya Menon', 'priya.menon@cloudorbit.com', '9876500003', 'Senior Recruiter', TRUE)
    `);

    await query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES
        ('Riya Sharma', 'riya.sharma@student.edu', '$2b$10$0lhxYLVIY9GcNInbXZ0D8.r5rup.K1GNHsBAzfVrsgzhFBopOJoBK', 'student'),
        ('Arjun Mehta', 'arjun.mehta@student.edu', '$2b$10$0lhxYLVIY9GcNInbXZ0D8.r5rup.K1GNHsBAzfVrsgzhFBopOJoBK', 'student'),
        ('Neha Iyer', 'neha.iyer@student.edu', '$2b$10$0lhxYLVIY9GcNInbXZ0D8.r5rup.K1GNHsBAzfVrsgzhFBopOJoBK', 'student'),
        ('Karan Patel', 'karan.patel@student.edu', '$2b$10$0lhxYLVIY9GcNInbXZ0D8.r5rup.K1GNHsBAzfVrsgzhFBopOJoBK', 'student'),
        ('Ishita Sen', 'ishita.sen@student.edu', '$2b$10$0lhxYLVIY9GcNInbXZ0D8.r5rup.K1GNHsBAzfVrsgzhFBopOJoBK', 'student')
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    await query(`
      INSERT INTO students (user_id, reg_number, branch, department_id, batch_id, cgpa, backlogs, phone, resume_path)
      VALUES
        ((SELECT id FROM users WHERE email = 'riya.sharma@student.edu' LIMIT 1), '220001', 'CSE',
          (SELECT id FROM departments WHERE code = 'CSE' LIMIT 1), (SELECT id FROM academic_batches WHERE graduation_year = 2026 LIMIT 1), 9.10, 0, '9999900001', 'uploads/resumes/demo-riya.pdf'),
        ((SELECT id FROM users WHERE email = 'arjun.mehta@student.edu' LIMIT 1), '220002', 'IT',
          (SELECT id FROM departments WHERE code = 'IT' LIMIT 1), (SELECT id FROM academic_batches WHERE graduation_year = 2026 LIMIT 1), 8.42, 0, '9999900002', 'uploads/resumes/demo-arjun.pdf'),
        ((SELECT id FROM users WHERE email = 'neha.iyer@student.edu' LIMIT 1), '220003', 'ECE',
          (SELECT id FROM departments WHERE code = 'ECE' LIMIT 1), (SELECT id FROM academic_batches WHERE graduation_year = 2027 LIMIT 1), 8.86, 1, '9999900003', 'uploads/resumes/demo-neha.pdf'),
        ((SELECT id FROM users WHERE email = 'karan.patel@student.edu' LIMIT 1), '220004', 'ME',
          (SELECT id FROM departments WHERE code = 'ME' LIMIT 1), (SELECT id FROM academic_batches WHERE graduation_year = 2027 LIMIT 1), 7.95, 1, '9999900004', 'uploads/resumes/demo-karan.pdf'),
        ((SELECT id FROM users WHERE email = 'ishita.sen@student.edu' LIMIT 1), '220005', 'CSE',
          (SELECT id FROM departments WHERE code = 'CSE' LIMIT 1), (SELECT id FROM academic_batches WHERE graduation_year = 2028 LIMIT 1), 9.32, 0, '9999900005', 'uploads/resumes/demo-ishita.pdf')
      ON DUPLICATE KEY UPDATE
        department_id = VALUES(department_id),
        batch_id = VALUES(batch_id),
        cgpa = VALUES(cgpa),
        backlogs = VALUES(backlogs),
        phone = VALUES(phone)
    `);

    await query(`
      INSERT IGNORE INTO placement_statuses (student_id, status, updated_by)
      SELECT s.id, CASE WHEN s.cgpa >= 8.8 THEN 'placed' ELSE 'not_placed' END, ?
      FROM students s
      WHERE s.reg_number IN ('220001', '220002', '220003', '220004', '220005')
    `, [req.user.id]);

    await query(`
      INSERT INTO offers (
        company_id, posted_by, title, description, type, stipend, location, min_cgpa, max_backlogs, deadline, status
      )
      SELECT c.id, ?, 'Software Engineer Intern', 'Backend and platform development internship', 'summer', 60000, 'Bengaluru', 7.50, 0, DATE_ADD(CURDATE(), INTERVAL 45 DAY), 'open'
      FROM companies c
      WHERE c.name = 'TechNova Systems'
      AND NOT EXISTS (SELECT 1 FROM offers o WHERE o.company_id = c.id AND o.title = 'Software Engineer Intern')
    `, [req.user.id]);

    await query(`
      INSERT INTO offers (
        company_id, posted_by, title, description, type, stipend, location, min_cgpa, max_backlogs, deadline, status
      )
      SELECT c.id, ?, 'Data Analyst Intern', 'Analytics and dashboarding internship', '6_month', 45000, 'Hyderabad', 7.00, 1, DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'open'
      FROM companies c
      WHERE c.name = 'FinEdge Analytics'
      AND NOT EXISTS (SELECT 1 FROM offers o WHERE o.company_id = c.id AND o.title = 'Data Analyst Intern')
    `, [req.user.id]);

    await query(`
      INSERT INTO offers (
        company_id, posted_by, title, description, type, stipend, location, min_cgpa, max_backlogs, deadline, status
      )
      SELECT c.id, ?, 'Cloud Associate Program', 'DevOps and cloud operations role', '6_plus_6_month', 50000, 'Pune', 7.20, 1, DATE_ADD(CURDATE(), INTERVAL 55 DAY), 'open'
      FROM companies c
      WHERE c.name = 'CloudOrbit Labs'
      AND NOT EXISTS (SELECT 1 FROM offers o WHERE o.company_id = c.id AND o.title = 'Cloud Associate Program')
    `, [req.user.id]);

    await query(`
      INSERT IGNORE INTO offer_branches (offer_id, branch_id)
      SELECT o.id, b.id
      FROM offers o
      JOIN branches b ON b.code IN ('CSE', 'IT')
      WHERE o.title = 'Software Engineer Intern'
    `);

    await query(`
      INSERT IGNORE INTO offer_branches (offer_id, branch_id)
      SELECT o.id, b.id
      FROM offers o
      JOIN branches b ON b.code IN ('CSE', 'IT', 'ECE')
      WHERE o.title = 'Data Analyst Intern'
    `);

    await query(`
      INSERT IGNORE INTO offer_branches (offer_id, branch_id)
      SELECT o.id, b.id
      FROM offers o
      JOIN branches b ON b.code IN ('ALL')
      WHERE o.title = 'Cloud Associate Program'
    `);

    await query(`
      INSERT IGNORE INTO applications (student_id, offer_id, status, resume_snapshot, updated_by)
      SELECT s.id, o.id, 'pending', s.resume_path, ?
      FROM students s
      JOIN offers o ON o.title IN ('Software Engineer Intern', 'Data Analyst Intern', 'Cloud Associate Program')
      WHERE s.reg_number IN ('220001', '220002', '220003', '220004', '220005')
    `, [req.user.id]);

    await query(`
      INSERT IGNORE INTO placement_rounds (offer_id, round_number, type, scheduled_at, duration_minutes, max_students)
      SELECT o.id, 1, 'aptitude', DATE_ADD(NOW(), INTERVAL 3 DAY), 60, 300
      FROM offers o
      WHERE o.title IN ('Software Engineer Intern', 'Data Analyst Intern', 'Cloud Associate Program')
    `);

    await query(`
      INSERT IGNORE INTO round_results (application_id, round_id, result, score, remarks, evaluated_by)
      SELECT a.id, pr.id, CASE WHEN MOD(a.id, 4) = 0 THEN 'pending' ELSE 'pass' END, 78.00, 'Demo evaluation result', ?
      FROM applications a
      JOIN offers o ON o.id = a.offer_id
      JOIN placement_rounds pr ON pr.offer_id = o.id AND pr.round_number = 1
      WHERE o.title IN ('Software Engineer Intern', 'Data Analyst Intern', 'Cloud Associate Program')
    `, [req.user.id]);

    await query(`
      UPDATE applications a
      JOIN students s ON s.id = a.student_id
      SET a.status = CASE
        WHEN s.reg_number IN ('220001', '220005') THEN 'selected'
        WHEN s.reg_number = '220003' THEN 'shortlisted'
        ELSE a.status
      END,
      a.updated_by = ?
      WHERE s.reg_number IN ('220001', '220003', '220005')
    `, [req.user.id]);

    await query(`
      INSERT IGNORE INTO feedback (application_id, recruiter_id, rating, comments, is_anonymous)
      SELECT a.id, r.id, 4, 'Good technical foundation and communication.', FALSE
      FROM applications a
      JOIN offers o ON o.id = a.offer_id
      JOIN companies c ON c.id = o.company_id
      JOIN recruiters r ON r.company_id = c.id
      WHERE a.status IN ('selected', 'rejected')
    `);

    await query(`
      INSERT IGNORE INTO documents (student_id, doc_type, version_no, file_path, verified, verified_by)
      SELECT s.id, 'resume', 1, CONCAT('uploads/resumes/', LOWER(REPLACE(u.name, ' ', '-')), '-v1.pdf'), TRUE, ?
      FROM students s
      JOIN users u ON u.id = s.user_id
      WHERE s.reg_number IN ('220001', '220002', '220003', '220004', '220005')
    `, [req.user.id]);

    await query(`
      INSERT INTO placement_stats (
        department_id, batch_id, total_students, total_placed,
        placement_rate, avg_stipend, max_stipend, last_refreshed
      )
      SELECT
        s.department_id,
        s.batch_id,
        COUNT(*) AS total_students,
        SUM(CASE WHEN EXISTS (
          SELECT 1 FROM applications a2 WHERE a2.student_id = s.id AND a2.status = 'selected'
        ) THEN 1 ELSE 0 END) AS total_placed,
        ROUND(
          SUM(CASE WHEN EXISTS (
            SELECT 1 FROM applications a2 WHERE a2.student_id = s.id AND a2.status = 'selected'
          ) THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2
        ) AS placement_rate,
        AVG(CASE WHEN a.status = 'selected' THEN o.stipend END) AS avg_stipend,
        MAX(CASE WHEN a.status = 'selected' THEN o.stipend END) AS max_stipend,
        NOW()
      FROM students s
      LEFT JOIN applications a ON a.student_id = s.id
      LEFT JOIN offers o ON o.id = a.offer_id
      WHERE s.department_id IS NOT NULL AND s.batch_id IS NOT NULL
      GROUP BY s.department_id, s.batch_id
      ON DUPLICATE KEY UPDATE
        total_students = VALUES(total_students),
        total_placed = VALUES(total_placed),
        placement_rate = VALUES(placement_rate),
        avg_stipend = VALUES(avg_stipend),
        max_stipend = VALUES(max_stipend),
        last_refreshed = VALUES(last_refreshed)
    `);

    await query('COMMIT');
    res.json({ message: 'Dummy data seeded successfully for expanded schema.' });
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}));

module.exports = router;
