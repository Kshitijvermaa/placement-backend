const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
  next();
};

router.get('/applicants/:offer_id', auth, isAdmin, (req, res) => {
  db.query(`
    SELECT applications.*, students.reg_number, students.branch, students.cgpa,
    users.name, users.email, offers.title
    FROM applications
    JOIN students ON applications.student_id = students.id
    JOIN users ON students.user_id = users.id
    JOIN offers ON applications.offer_id = offers.id
    WHERE applications.offer_id = ?
  `, [req.params.offer_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.put('/applications/:id/status', auth, isAdmin, (req, res) => {
  const { status } = req.body;
  db.query('UPDATE applications SET status = ? WHERE id = ?',
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Application status updated' });
    }
  );
});

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

router.get('/students', auth, isAdmin, (req, res) => {
  db.query(`
    SELECT users.name, users.email, students.*
    FROM students
    JOIN users ON students.user_id = users.id
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;