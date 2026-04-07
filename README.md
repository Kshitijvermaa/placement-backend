# 🎓 Placement & Internship Portal

A full-stack web application for managing college placements and internships, built with **Node.js/Express** backend and **React** frontend.

## ✨ Features

### For Students
- 📝 **Profile Management** - Create and update academic profile (CGPA, branch, backlogs)
- 📄 **Resume Upload** - Upload and manage resume (PDF/DOC/DOCX)
- 🔍 **Browse Offers** - View and filter available internship/placement opportunities
- ✅ **Apply to Offers** - Apply to positions with eligibility checks
- 📊 **Track Applications** - Monitor application status (pending/shortlisted/selected/rejected)
- 📅 **Interview Schedule** - View scheduled interviews
- 🔔 **Notifications** - Receive updates on application status

### For Admins
- 🏢 **Company Management** - Add, edit, and manage companies
- 💼 **Post Offers** - Create internship and placement offers with eligibility criteria
- 👥 **Student Management** - View all registered students
- 📋 **Application Review** - View and update application statuses
- 🎯 **Interview Scheduling** - Schedule interviews for shortlisted candidates
- 📈 **Dashboard** - Overview of placements and statistics

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **MySQL** - Relational database (normalized to 3NF)
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form validation

## 📁 Project Structure

```
placement-backend/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StudentLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── context/            # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── student/        # Student pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── OffersList.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── Applications.jsx
│   │   │   └── admin/          # Admin pages
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Companies.jsx
│   │   │       ├── Offers.jsx
│   │   │       └── Students.jsx
│   │   ├── services/           # API services
│   │   │   ├── api.js
│   │   │   └── index.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── routes/                      # Backend API Routes
│   ├── auth.js                 # Authentication
│   ├── students.js             # Student profile & resume
│   ├── companies.js            # Company management
│   ├── offers.js               # Job offers
│   ├── applications.js         # Applications
│   ├── admin.js                # Admin functions
│   ├── notifications.js        # Notifications
│   └── interviews.js           # Interview scheduling
│
├── middleware/
│   └── auth.js                 # JWT authentication middleware
│
├── migrations/
│   ├── 001_normalize_branches.sql
│   └── 002_expand_db_objects.sql
│
├── uploads/
│   └── resumes/                # Uploaded resume files
│
├── schema.sql                  # Database schema
├── db.js                       # MySQL connection
├── server.js                   # Express server
└── package.json
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **MySQL** (v5.7 or higher)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
cd placement-backend
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Database Setup

#### Create Database
```bash
mysql -u root -p
```

```sql
CREATE DATABASE placement_db;
```

#### Run Schema
```bash
mysql -u root -p placement_db < schema.sql
```

#### Run Migration
```bash
mysql -u root -p placement_db < migrations/001_normalize_branches.sql
mysql -u root -p placement_db < migrations/002_expand_db_objects.sql
```

### 5. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_PASSWORD=your_mysql_password

# JWT Secret (use a strong random string)
JWT_SECRET=your_jwt_secret_key_here

# Server Port
PORT=5000
```

### 6. Create Uploads Directory
The uploads directory should already exist. If not:
```bash
mkdir -p uploads/resumes
```

## 🏃‍♂️ Running the Application

### Start Backend Server
```bash
# From project root
node server.js
```
Server will run on **http://localhost:5000**

### Start Frontend Development Server
```bash
# From project root
cd client
npm run dev
```
Frontend will run on **http://localhost:5173**

## 🔑 Default Admin Account

After running the schema, a default admin account is created:

- **Email:** `admin@college.edu`
- **Password:** `admin123`

⚠️ **Important:** Change this password in production!

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Students
- `GET /api/students/profile` - Get student profile
- `POST /api/students/profile` - Create/update profile
- `POST /api/students/resume` - Upload resume
- `GET /api/students/resume` - Download resume

### Offers
- `GET /api/offers` - Get all open offers
- `GET /api/offers/:id` - Get offer details

### Applications
- `POST /api/applications` - Apply to an offer
- `GET /api/applications/me` - Get user's applications

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company (admin)
- `PUT /api/companies/:id` - Update company (admin)
- `DELETE /api/companies/:id` - Delete company (admin)

### Admin
- `GET /api/admin/students` - Get all students
- `GET /api/admin/applicants/:offer_id` - Get applicants for offer
- `PUT /api/admin/applications/:id/status` - Update application status
- `POST /api/admin/offers` - Post new offer

### Interviews
- `GET /api/interviews/student` - Get student's interviews
- `GET /api/interviews/offer/:offer_id` - Get interviews for offer (admin)
- `POST /api/interviews` - Schedule interview (admin)
- `PUT /api/interviews/:id` - Update interview (admin)
- `DELETE /api/interviews/:id` - Delete interview (admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (student/admin)
- ✅ Protected routes on frontend
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ File upload validation

## 📊 Database Schema

### Key Tables
- **users** - Authentication and user roles
- **students** - Student academic profiles
- **companies** - Company information
- **offers** - Internship/placement offers
- **applications** - Student applications
- **interviews** - Interview schedules
- **notifications** - User notifications
- **branches** - Branch reference data (normalized)
- **offer_branches** - Offer-branch relationship (many-to-many)

**Normalization:** The schema follows **Third Normal Form (3NF)** to eliminate data redundancy.

## 🎨 UI Features

- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Material-UI Components** - Professional, modern UI
- 🌓 **Clean Interface** - Intuitive navigation and layouts
- 📊 **Dashboard Statistics** - Visual overview of key metrics
- 🔔 **Notification Bell** - Real-time notification indicator
- 🔍 **Search & Filter** - Easy data browsing
- 📝 **Form Validation** - Client-side and server-side validation

## 🧪 Testing

### Manual Testing Checklist

#### Student Flow
1. ✅ Register as student
2. ✅ Login with credentials
3. ✅ Complete profile setup
4. ✅ Upload resume
5. ✅ Browse available offers
6. ✅ Apply to offers
7. ✅ Track application status

#### Admin Flow
1. ✅ Login as admin
2. ✅ Add companies
3. ✅ Post job offers
4. ✅ View student list
5. ✅ Review applications
6. ✅ Update application status
7. ✅ Schedule interviews

## 📝 Development Notes

### Database Migration
The project includes migration scripts for branch normalization and advanced database expansion. Run these if upgrading from an older schema:

```bash
mysql -u root -p placement_db < migrations/001_normalize_branches.sql
mysql -u root -p placement_db < migrations/002_expand_db_objects.sql
```

### Adding New Features
- Backend routes go in `routes/` directory
- Frontend pages go in `client/src/pages/`
- Shared components go in `client/src/components/`
- API services go in `client/src/services/`

## 🐛 Troubleshooting

### Backend Won't Start
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure port 5000 is available

### Frontend Won't Start
- Check all dependencies installed: `cd client && npm install`
- Ensure port 5173 is available

### Database Errors
- Verify database exists: `SHOW DATABASES;`
- Check schema is loaded: `USE placement_db; SHOW TABLES;`
- Run migration if needed

### File Upload Issues
- Ensure `uploads/resumes/` directory exists
- Check file permissions
- Verify file size limits

## 📄 License

This project is part of a college placement management system.

## 👥 Contributors

Built with ❤️ for efficient placement management

---

**Last Updated:** 2026-04-03
**Version:** 1.0.0
