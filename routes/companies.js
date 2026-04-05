const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
  next();
};

// Get all companies
router.get('/', (req, res) => {
  db.query('SELECT * FROM companies ORDER BY name', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get company by ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM companies WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json(results[0]);
  });
});

// Create company (admin only)
router.post('/', auth, isAdmin, (req, res) => {
  const { name, sector, location, contact_email, website } = req.body;

  db.query(
    'INSERT INTO companies (name, sector, location, contact_email, website) VALUES (?, ?, ?, ?, ?)',
    [name, sector, location, contact_email, website],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Company created successfully', companyId: result.insertId });
    }
  );
});

// Update company (admin only)
router.put('/:id', auth, isAdmin, (req, res) => {
  const { name, sector, location, contact_email, website } = req.body;

  db.query(
    'UPDATE companies SET name = ?, sector = ?, location = ?, contact_email = ?, website = ? WHERE id = ?',
    [name, sector, location, contact_email, website, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Company updated successfully' });
    }
  );
});

// Delete company (admin only)
router.delete('/:id', auth, isAdmin, (req, res) => {
  db.query('DELETE FROM companies WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Company deleted successfully' });
  });
});

module.exports = router;
