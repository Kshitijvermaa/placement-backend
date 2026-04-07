import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
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
import ExpansionHub from './pages/admin/ExpansionHub';

const theme = createTheme({
  palette: {
    primary: { main: '#0f4c81' },
    secondary: { main: '#e8621a' },
    success: { main: '#2d8c5e' },
    background: { default: '#f5f7fa', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"DM Sans", "Inter", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0f4c81 0%, #1565c0 100%)',
          boxShadow: '0 4px 14px rgba(15,76,129,0.3)',
          '&:hover': { boxShadow: '0 6px 20px rgba(15,76,129,0.4)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.06)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: { '& .MuiTableCell-head': { fontWeight: 700, background: '#f0f4f8', color: '#0f4c81' } },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
              <Route path="expansion" element={<ExpansionHub />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
