const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const hash = bcrypt.hashSync(password, 10);
    db.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, role || 'student'],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User registered successfully', userId: result.insertId });
      }
    );
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = results[0];
    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Wrong password' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful', token, role: user.role });
  });
});

module.exports = router;
