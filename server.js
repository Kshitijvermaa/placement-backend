const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const offerRoutes = require('./routes/offers');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/students');
const companyRoutes = require('./routes/companies');
const notificationRoutes = require('./routes/notifications');
const interviewRoutes = require('./routes/interviews');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/interviews', interviewRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Placement API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});