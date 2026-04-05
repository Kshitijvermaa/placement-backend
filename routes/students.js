const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for resume upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Get student profile
router.get('/profile', auth, (req, res) => {
  const user_id = req.user.id;
  
  db.query(`
    SELECT students.*, users.name, users.email
    FROM students
    JOIN users ON students.user_id = users.id
    WHERE students.user_id = ?
  `, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Student profile not found' });
    res.json(results[0]);
  });
});

// Create or update student profile
router.post('/profile', auth, (req, res) => {
  const { reg_number, branch, cgpa, backlogs, phone } = req.body;
  const user_id = req.user.id;

  // Check if profile exists
  db.query('SELECT * FROM students WHERE user_id = ?', [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      // Create new profile
      db.query(
        'INSERT INTO students (user_id, reg_number, branch, cgpa, backlogs, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, reg_number, branch, cgpa, backlogs || 0, phone],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Profile created successfully', studentId: result.insertId });
        }
      );
    } else {
      // Update existing profile
      db.query(
        'UPDATE students SET reg_number = ?, branch = ?, cgpa = ?, backlogs = ?, phone = ? WHERE user_id = ?',
        [reg_number, branch, cgpa, backlogs || 0, phone, user_id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Profile updated successfully' });
        }
      );
    }
  });
});

// Upload resume
router.post('/resume', auth, upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const user_id = req.user.id;
  const resume_path = req.file.path;

  db.query('UPDATE students SET resume_path = ? WHERE user_id = ?',
    [resume_path, user_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Resume uploaded successfully', path: resume_path });
    }
  );
});

// Get resume
router.get('/resume', auth, (req, res) => {
  const user_id = req.user.id;

  db.query('SELECT resume_path FROM students WHERE user_id = ?', [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0 || !results[0].resume_path) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const filePath = path.join(__dirname, '..', results[0].resume_path);
    res.download(filePath);
  });
});

module.exports = router;
