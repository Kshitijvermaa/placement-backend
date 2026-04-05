import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { companyService, adminService } from '../../services';

const Offers = () => {
  const [companies, setCompanies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [offerData, setOfferData] = useState({
    company_id: '',
    title: '',
    description: '',
    type: 'summer',
    stipend: '',
    location: '',
    min_cgpa: '0',
    max_backlogs: '0',
    deadline: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await companyService.getAll();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOfferData({
      company_id: '',
      title: '',
      description: '',
      type: 'summer',
      stipend: '',
      location: '',
      min_cgpa: '0',
      max_backlogs: '0',
      deadline: '',
    });
  };

  const handleChange = (e) => {
    setOfferData({
      ...offerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      await adminService.createOffer({
        ...offerData,
        stipend: parseFloat(offerData.stipend) || null,
        min_cgpa: parseFloat(offerData.min_cgpa),
        max_backlogs: parseInt(offerData.max_backlogs),
      });
      setMessage({ type: 'success', text: 'Offer posted successfully!' });
      handleCloseDialog();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to post offer',
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Manage Offers</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
          Post New Offer
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Offer management interface - List of offers would be displayed here
        </Typography>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Post New Offer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Company</InputLabel>
                <Select
                  name="company_id"
                  value={offerData.company_id}
                  label="Company"
                  onChange={handleChange}
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="title"
                label="Job Title"
                value={offerData.title}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="description"
                label="Description"
                value={offerData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={offerData.type}
                  label="Type"
                  onChange={handleChange}
                >
                  <MenuItem value="summer">Summer Internship</MenuItem>
                  <MenuItem value="6_month">6 Month Internship</MenuItem>
                  <MenuItem value="6_plus_6_month">6+6 Month Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="stipend"
                label="Stipend"
                type="number"
                value={offerData.stipend}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="location"
                label="Location"
                value={offerData.location}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                name="deadline"
                label="Deadline"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={offerData.deadline}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="min_cgpa"
                label="Minimum CGPA"
                type="number"
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                value={offerData.min_cgpa}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="max_backlogs"
                label="Maximum Backlogs"
                type="number"
                inputProps={{ min: 0 }}
                value={offerData.max_backlogs}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Post Offer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Offers;
