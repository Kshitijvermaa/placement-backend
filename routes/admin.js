const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
  next();
};

// GET all offers (admin view — includes all statuses)
router.get('/offers', auth, isAdmin, (req, res) => {
  db.query(`
    SELECT offers.*, companies.name AS company_name,
           COUNT(applications.id) AS applicant_count
    FROM offers
    JOIN companies ON offers.company_id = companies.id
    LEFT JOIN applications ON applications.offer_id = offers.id
    GROUP BY offers.id
    ORDER BY offers.created_at DESC
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST create offer
router.post('/offers', auth, isAdmin, (req, res) => {
  const { company_id, title, description, type, stipend, location, min_cgpa, max_backlogs, deadline } = req.body;
  db.query(`
    INSERT INTO offers (company_id, posted_by, title, description, type, stipend, location, min_cgpa, max_backlogs, deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [company_id, req.user.id, title, description, type, stipend, location, min_cgpa, max_backlogs, deadline],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Offer posted successfully', offerId: result.insertId });
    }
  );
});

// GET applicants for a specific offer
router.get('/applicants/:offer_id', auth, isAdmin, (req, res) => {
  db.query(`
    SELECT applications.*, students.reg_number, students.branch, students.cgpa,
           users.name, users.email, offers.title
    FROM applications
    JOIN students ON applications.student_id = students.id
    JOIN users ON students.user_id = users.id
    JOIN offers ON applications.offer_id = offers.id
    WHERE applications.offer_id = ?
    ORDER BY students.cgpa DESC
  `, [req.params.offer_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// PUT update application status
router.put('/applications/:id/status', auth, isAdmin, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'shortlisted', 'selected', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  db.query(
    'UPDATE applications SET status = ?, updated_by = ? WHERE id = ?',
    [status, req.user.id, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Application not found' });

      db.query(`
        SELECT students.user_id, offers.title, companies.name AS company_name
        FROM applications
        JOIN students ON applications.student_id = students.id
        JOIN offers ON applications.offer_id = offers.id
        JOIN companies ON offers.company_id = companies.id
        WHERE applications.id = ?
      `, [req.params.id], (notifyErr, notifyRows) => {
        if (!notifyErr && notifyRows.length > 0) {
          const { user_id, title, company_name } = notifyRows[0];
          const message = `Your application for ${title} at ${company_name} was ${status}.`;
          db.query(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [user_id, message],
            () => {}
          );
        }
      });

      res.json({ message: 'Application status updated' });
    }
  );
});

// GET all students
router.get('/students', auth, isAdmin, (req, res) => {
  db.query(`
    SELECT users.name, users.email, students.*
    FROM students
    JOIN users ON students.user_id = users.id
    ORDER BY users.name
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
