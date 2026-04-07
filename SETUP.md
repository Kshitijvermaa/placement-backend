# 🚀 Quick Setup Guide

## ⚠️ Important Changes from Previous Version

### Database Schema Updates:
1. **Normalized Branches**: The `eligible_branches` field has been normalized into separate tables (`branches` and `offer_branches`)
2. **Enhanced Features**: 
   - Interview scheduling
   - Notifications system
   - Application status tracking with updater info
   - Performance indexes added

### Migration Required:
If you're upgrading from an old database, you MUST run the migration script. If setting up fresh, it's already included in the schema.

---

## 📋 Setup Steps

### Option 1: Fresh Setup (Recommended if starting new)

1. **Run the automated setup script:**
   ```cmd
   setup_database.bat
   ```
   - This will drop any existing database and create a fresh one
   - It will load the complete schema with all tables
   - Default admin account will be created

2. **Start the backend:**
   ```cmd
   start_backend.bat
   ```

3. **Start the frontend (in a new terminal):**
   ```cmd
   start_frontend.bat
   ```

### Option 2: Manual Setup

1. **Create the database:**
   ```cmd
   mysql -u root -p < setup_fresh.sql
   ```

2. **Load the schema:**
   ```cmd
   mysql -u root -p placement_db < schema.sql
   ```

3. **Start the backend:**
   ```cmd
   node server.js
   ```

4. **Start the frontend:**
   ```cmd
   cd client
   npm run dev
   ```

### Option 3: Upgrading Existing Database

If you have an existing database with data you want to keep:

1. **Backup your database first:**
   ```cmd
   mysqldump -u root -p placement_db > backup.sql
   ```

2. **Run the migration:**
   ```cmd
   mysql -u root -p placement_db < migrations\001_normalize_branches.sql
   mysql -u root -p placement_db < migrations\002_expand_db_objects.sql
   ```

---

## ✅ Verification Checklist

After setup, verify:

1. **Database Tables Exist:**
   ```sql
   USE placement_db;
   SHOW TABLES;
   ```
   
   You should see:
   - users
   - students
   - companies
   - offers
   - applications
   - interviews
   - notifications
   - **branches** (NEW)
   - **offer_branches** (NEW)

2. **Backend is Running:**
   - Open http://localhost:5000
   - Should see: `{"message":"Placement API is running!"}`

3. **Frontend is Running:**
   - Open http://localhost:5173
   - Should see the login page

---

## 🔑 Default Login Credentials

**Admin Account:**
- Email: `admin@college.edu`
- Password: `admin123`

⚠️ **Change this password after first login!**

---

## 📝 Current Configuration

Your `.env` file is already configured:
```env
DB_PASSWORD=Samsung4.
JWT_SECRET=placementsecretkey123
PORT=5000
```

---

## 🆕 New Features Available

1. **Interview Scheduling**
   - Admins can schedule interviews for shortlisted candidates
   - Students can view their interview schedule

2. **Notifications System**
   - Real-time notifications for application updates
   - Notification bell with unread count
   - Mark as read functionality

3. **Enhanced Application Tracking**
   - Track who updated application status
   - Better filtering and search

4. **Branch Normalization**
   - Better data integrity
   - Easier to manage eligible branches
   - Support for multiple branches per offer

---

## 🐛 Troubleshooting

### Backend won't start?
- Check if MySQL is running
- Verify port 5000 is available
- Check `.env` file exists with correct DB password

### Database connection error?
- Verify MySQL password in `.env` file
- Ensure `placement_db` database exists
- Check MySQL is running on default port 3306

### Migration errors?
- Make sure you're running migration on existing database, not fresh setup
- If fresh setup, just run `setup_database.bat` instead

---

## 📦 Dependencies Already Installed

Backend packages:
- express - Web framework
- mysql2 - Database driver
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- multer - File uploads
- cors - Cross-origin requests
- dotenv - Environment variables

Frontend packages:
- react - UI library
- vite - Build tool
- @mui/material - UI components
- react-router-dom - Routing
- axios - HTTP client

---

## 🎯 Next Steps After Setup

1. Login as admin (`admin@college.edu` / `admin123`)
2. Add some companies
3. Post some job offers
4. Register as a student (use different email)
5. Complete student profile
6. Apply to offers
7. As admin, review and update application statuses

---

**Need detailed documentation?** See `README.md` for complete API endpoints and features.
