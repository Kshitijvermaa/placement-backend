import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, Paper,
  InputAdornment, IconButton, CircularProgress, Divider,
} from '@mui/material';
import {
  Email as EmailIcon, Lock as LockIcon,
  Visibility, VisibilityOff, School as SchoolIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(data.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0f4c81 0%, #1565c0 50%, #0d47a1 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: -100, right: -100 }} />
      <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -50, left: -80 }} />
      <Box sx={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: '40%', left: '10%' }} />

      {/* Left branding panel (hidden on mobile) */}
      <Box sx={{
        flex: 1, display: { xs: 'none', md: 'flex' },
        flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start',
        pl: 10, pr: 6,
      }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={4}>
          <SchoolIcon sx={{ color: 'white', fontSize: 40 }} />
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 800 }}>
            Placement Portal
          </Typography>
        </Box>
        <Typography variant="h2" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.2, mb: 2 }}>
          Your Career<br />Starts Here.
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, maxWidth: 380 }}>
          Connect with top companies, track your applications, and land your dream internship — all in one place.
        </Typography>

        <Box mt={6} display="flex" gap={4}>
          {[['500+', 'Students'], ['50+', 'Companies'], ['200+', 'Offers']].map(([num, label]) => (
            <Box key={label} textAlign="center">
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 800 }}>{num}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right form panel */}
      <Box sx={{
        width: { xs: '100%', md: 480 },
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: { xs: 3, md: 6 },
      }}>
        <Paper elevation={0} sx={{
          width: '100%', p: { xs: 3, md: 4.5 },
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 3 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6" fontWeight={700} color="primary">Placement Portal</Typography>
          </Box>

          <Typography variant="h5" fontWeight={800} gutterBottom>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign in to access your dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth required name="email" label="Email address" type="email"
              value={form.email} onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth required name="password" label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password} onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading}
              sx={{ py: 1.5, fontSize: 15, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">OR</Typography>
          </Divider>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              New student?{' '}
              <Link to="/register" style={{ color: '#0f4c81', fontWeight: 700, textDecoration: 'none' }}>
                Create an account
              </Link>
            </Typography>
          </Box>

          <Box mt={2} p={1.5} sx={{ bgcolor: 'rgba(15,76,129,0.06)', borderRadius: 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
              Admin: admin@college.edu / admin123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
