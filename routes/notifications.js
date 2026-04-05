const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get user notifications
router.get('/', auth, (req, res) => {
  const user_id = req.user.id;

  db.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Get unread notifications count
router.get('/unread/count', auth, (req, res) => {
  const user_id = req.user.id;

  db.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ count: results[0].count });
    }
  );
});

// Mark notification as read
router.put('/:id/read', auth, (req, res) => {
  const user_id = req.user.id;
  const notification_id = req.params.id;

  db.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [notification_id, user_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Notification marked as read' });
    }
  );
});

// Mark all notifications as read
router.put('/read-all', auth, (req, res) => {
  const user_id = req.user.id;

  db.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
    [user_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'All notifications marked as read' });
    }
  );
});

// Create notification (internal use)
router.post('/', auth, (req, res) => {
  const { user_id, message } = req.body;

  db.query(
    'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
    [user_id, message],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Notification created', notificationId: result.insertId });
    }
  );
});

module.exports = router;
