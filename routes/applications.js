const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth, (req, res) => {
  const { offer_id } = req.body;
  const user_id = req.user.id;

  db.query('SELECT * FROM students WHERE user_id = ?', [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Student profile not found' });

    const student = results[0];

    db.query('SELECT * FROM applications WHERE student_id = ? AND offer_id = ?',
      [student.id, offer_id],
      (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existing.length > 0) return res.status(400).json({ error: 'Already applied' });

        db.query('INSERT INTO applications (student_id, offer_id, resume_snapshot) VALUES (?, ?, ?)',
          [student.id, offer_id, student.resume_path],
          (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Applied successfully', applicationId: result.insertId });
          }
        );
      }
    );
  });
});

router.get('/me', auth, (req, res) => {
  const user_id = req.user.id;

  db.query(`
    SELECT applications.*, offers.title, offers.type, offers.stipend, companies.name AS company_name
    FROM applications
    JOIN students ON applications.student_id = students.id
    JOIN offers ON applications.offer_id = offers.id
    JOIN companies ON offers.company_id = companies.id
    WHERE students.user_id = ?
  `, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;