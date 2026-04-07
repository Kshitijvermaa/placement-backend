import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import OffersList from './pages/student/OffersList';
import Profile from './pages/student/Profile';
import Applications from './pages/student/Applications';
import Interviews from './pages/student/Interviews';
import Notifications from './pages/student/Notifications';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCompanies from './pages/admin/Companies';
import AdminOffers from './pages/admin/Offers';
import AdminStudents from './pages/admin/Students';
import CatalogManagement from './pages/admin/CatalogManagement';
import RecruitmentPipeline from './pages/admin/RecruitmentPipeline';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="offers" element={<OffersList />} />
            <Route path="applications" element={<Applications />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="catalog" element={<CatalogManagement />} />
            <Route path="recruitment" element={<RecruitmentPipeline />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;