const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', (req, res) => {
  db.query(
    'SELECT offers.*, companies.name AS company_name FROM offers JOIN companies ON offers.company_id = companies.id WHERE offers.status = "open"',
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.get('/:id', (req, res) => {
  db.query(
    'SELECT offers.*, companies.name AS company_name FROM offers JOIN companies ON offers.company_id = companies.id WHERE offers.id = ?',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Offer not found' });
      res.json(results[0]);
    }
  );
});

module.exports = router;