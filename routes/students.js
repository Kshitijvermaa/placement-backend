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

// Get eligible offers for logged-in student
router.get('/eligible-offers', auth, (req, res) => {
  const user_id = req.user.id;

  // First get the student_id from user_id
  db.query('SELECT id FROM students WHERE user_id = ?', [user_id], (err, studentResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (studentResults.length === 0) {
      return res.status(404).json({ error: 'Student profile not found. Please complete your profile first.' });
    }

    const student_id = studentResults[0].id;

    // Use the view to get eligible offers
    db.query(
      `SELECT 
        offer_id, 
        offer_title, 
        company_name, 
        stipend, 
        deadline, 
        offer_type,
        already_applied,
        application_status
      FROM vw_student_eligible_offers 
      WHERE student_id = ?
      ORDER BY deadline ASC`,
      [student_id],
      (err, offers) => {
        if (err) {
          console.error('Error fetching eligible offers:', err);
          return res.status(500).json({ error: err.message });
        }
        
        // Transform to match the format expected by frontend
        const transformedOffers = offers.map(offer => ({
          id: offer.offer_id,
          title: offer.offer_title,
          company_name: offer.company_name,
          stipend: offer.stipend,
          deadline: offer.deadline,
          type: offer.offer_type,
          status: 'open' // All offers in the view are open
        }));
        
        res.json(transformedOffers);
      }
    );
  });
});

module.exports = router;
