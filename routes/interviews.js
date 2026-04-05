const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
  next();
};

// Get all interviews for an offer
router.get('/offer/:offer_id', auth, isAdmin, (req, res) => {
  db.query(`
    SELECT interviews.*, applications.student_id, students.reg_number, 
           users.name, users.email, offers.title
    FROM interviews
    JOIN applications ON interviews.application_id = applications.id
    JOIN students ON applications.student_id = students.id
    JOIN users ON students.user_id = users.id
    JOIN offers ON applications.offer_id = offers.id
    WHERE applications.offer_id = ?
    ORDER BY interviews.scheduled_at
  `, [req.params.offer_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get interviews for a student
router.get('/student', auth, (req, res) => {
  const user_id = req.user.id;

  db.query(`
    SELECT interviews.*, offers.title, offers.type, companies.name AS company_name,
           applications.status
    FROM interviews
    JOIN applications ON interviews.application_id = applications.id
    JOIN students ON applications.student_id = students.id
    JOIN offers ON applications.offer_id = offers.id
    JOIN companies ON offers.company_id = companies.id
    WHERE students.user_id = ?
    ORDER BY interviews.scheduled_at
  `, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Schedule interview (admin only)
router.post('/', auth, isAdmin, (req, res) => {
  const { application_id, scheduled_at, mode, link_or_venue, notes } = req.body;

  db.query(
    'INSERT INTO interviews (application_id, scheduled_at, mode, link_or_venue, notes) VALUES (?, ?, ?, ?, ?)',
    [application_id, scheduled_at, mode, link_or_venue, notes],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // Get student user_id for notification
      db.query(`
        SELECT students.user_id, offers.title 
        FROM applications 
        JOIN students ON applications.student_id = students.id
        JOIN offers ON applications.offer_id = offers.id
        WHERE applications.id = ?
      `, [application_id], (err, appResults) => {
        if (!err && appResults.length > 0) {
          const message = `Interview scheduled for ${appResults[0].title} on ${scheduled_at}`;
          db.query(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [appResults[0].user_id, message],
            () => {}
          );
        }
      });

      res.json({ message: 'Interview scheduled successfully', interviewId: result.insertId });
    }
  );
});

// Update interview (admin only)
router.put('/:id', auth, isAdmin, (req, res) => {
  const { scheduled_at, mode, link_or_venue, notes } = req.body;

  db.query(
    'UPDATE interviews SET scheduled_at = ?, mode = ?, link_or_venue = ?, notes = ? WHERE id = ?',
    [scheduled_at, mode, link_or_venue, notes, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Interview updated successfully' });
    }
  );
});

// Delete interview (admin only)
router.delete('/:id', auth, isAdmin, (req, res) => {
  db.query('DELETE FROM interviews WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Interview deleted successfully' });
  });
});

module.exports = router;
