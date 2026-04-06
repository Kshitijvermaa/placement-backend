import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, Paper,
  InputAdornment, IconButton, CircularProgress, Divider, Stepper, Step, StepLabel,
} from '@mui/material';
import {
  Email as EmailIcon, Lock as LockIcon, Person as PersonIcon,
  Visibility, VisibilityOff, School as SchoolIcon, CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { authService } from '../services';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.includes('@')) return 'Enter a valid email address';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      await authService.register(form.name, form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
      <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: -100, left: -100 }} />
      <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -50, right: -80 }} />

      {/* Left Branding */}
      <Box sx={{
        flex: 1, display: { xs: 'none', md: 'flex' },
        flexDirection: 'column', justifyContent: 'center',
        pl: 10, pr: 6,
      }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={4}>
          <SchoolIcon sx={{ color: 'white', fontSize: 40 }} />
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 800 }}>
            Placement Portal
          </Typography>
        </Box>
        <Typography variant="h2" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.2, mb: 2 }}>
          Join the<br />Community.
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, maxWidth: 380 }}>
          Create your profile, upload your resume, and apply to internships from the best companies in the industry.
        </Typography>

        <Box mt={5} display="flex" flexDirection="column" gap={2}>
          {[
            'Complete your academic profile',
            'Browse eligible offers instantly',
            'Track all applications in one place',
            'Get notified of interview schedules',
          ].map((step, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1.5}>
              <CheckIcon sx={{ color: '#4caf50', fontSize: 20 }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 15 }}>{step}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Form Panel */}
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
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 3 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6" fontWeight={700} color="primary">Placement Portal</Typography>
          </Box>

          {success ? (
            <Box textAlign="center" py={4}>
              <CheckIcon sx={{ fontSize: 64, color: '#2d8c5e', mb: 2 }} />
              <Typography variant="h5" fontWeight={800} gutterBottom>Account Created!</Typography>
              <Typography color="text.secondary">Redirecting you to login...</Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h5" fontWeight={800} gutterBottom>Create account</Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Register as a student to get started
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth required name="name" label="Full Name"
                  value={form.name} onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth required name="email" label="College Email" type="email"
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
                  helperText="At least 6 characters"
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
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth required name="confirmPassword" label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword} onChange={handleChange}
                  error={form.confirmPassword !== '' && form.password !== form.confirmPassword}
                  helperText={form.confirmPassword !== '' && form.password !== form.confirmPassword ? 'Passwords do not match' : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" color="text.secondary">OR</Typography>
              </Divider>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Already registered?{' '}
                  <Link to="/login" style={{ color: '#0f4c81', fontWeight: 700, textDecoration: 'none' }}>
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
