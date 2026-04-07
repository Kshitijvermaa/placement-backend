import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { studentService } from '../../services';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    reg_number: '',
    branch: '',
    cgpa: '',
    backlogs: '',
    phone: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await studentService.getProfile();
      console.log('Loaded profile:', data); // Debug log
      setProfile({
        name: data.name || '',
        email: data.email || '',
        reg_number: data.reg_number || '',
        branch: data.branch || '',
        cgpa: data.cgpa || '',
        backlogs: data.backlogs || 0,
        phone: data.phone || '',
      });
      setHasProfile(true);
    } catch (error) {
      console.error('Profile load error:', error);
      if (error.response?.status === 404) {
        setHasProfile(false);
        // If profile doesn't exist, at least load name and email from token/user
        setMessage({ 
          type: 'info', 
          text: 'Please complete your profile to access placement opportunities' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Failed to load profile. Please try again.' 
        });
      }
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await studentService.updateProfile({
        reg_number: profile.reg_number,
        branch: profile.branch,
        cgpa: parseFloat(profile.cgpa),
        backlogs: parseInt(profile.backlogs) || 0,
        phone: profile.phone,
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setHasProfile(true);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setLoading(true);
    try {
      await studentService.uploadResume(resumeFile);
      setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
      setResumeFile(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to upload resume',
      });
    } finally {
      setLoading(false);
    }
  };

  const branches = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'CHE', 'BT', 'AE'];

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={profile.name}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profile.email}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Registration Number"
                name="reg_number"
                value={profile.reg_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Branch</InputLabel>
                <Select
                  name="branch"
                  value={profile.branch}
                  label="Branch"
                  onChange={handleChange}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch} value={branch}>
                      {branch}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="CGPA"
                name="cgpa"
                type="number"
                inputProps={{ min: 0, max: 10, step: 0.01 }}
                value={profile.cgpa}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Backlogs"
                name="backlogs"
                type="number"
                inputProps={{ min: 0 }}
                value={profile.backlogs}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={loading}>
                {hasProfile ? 'Update Profile' : 'Create Profile'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resume
        </Typography>
        <Box>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 2 }}
          >
            Choose Resume
            <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          </Button>
          {resumeFile && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selected: {resumeFile.name}
            </Typography>
          )}
          <Button
            variant="contained"
            onClick={handleResumeUpload}
            disabled={!resumeFile || loading}
          >
            Upload Resume
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Accepted formats: PDF, DOC, DOCX (Max 5MB)
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
