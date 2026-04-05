import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Box,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { companyService } from '../../services';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCompany, setCurrentCompany] = useState({
    id: null,
    name: '',
    sector: '',
    location: '',
    contact_email: '',
    website: '',
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

  const handleOpenDialog = (company = null) => {
    if (company) {
      setCurrentCompany(company);
      setEditMode(true);
    } else {
      setCurrentCompany({
        id: null,
        name: '',
        sector: '',
        location: '',
        contact_email: '',
        website: '',
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCompany({
      id: null,
      name: '',
      sector: '',
      location: '',
      contact_email: '',
      website: '',
    });
    setEditMode(false);
  };

  const handleChange = (e) => {
    setCurrentCompany({
      ...currentCompany,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await companyService.update(currentCompany.id, currentCompany);
        setMessage({ type: 'success', text: 'Company updated successfully!' });
      } else {
        await companyService.create(currentCompany);
        setMessage({ type: 'success', text: 'Company added successfully!' });
      }
      loadCompanies();
      handleCloseDialog();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Operation failed',
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await companyService.delete(id);
        setMessage({ type: 'success', text: 'Company deleted successfully!' });
        loadCompanies();
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.response?.data?.error || 'Delete failed',
        });
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Companies</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Company
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Sector</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Contact Email</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id} hover>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.sector || 'N/A'}</TableCell>
                <TableCell>{company.location || 'N/A'}</TableCell>
                <TableCell>{company.contact_email || 'N/A'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(company)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(company.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Company' : 'Add Company'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            name="name"
            label="Company Name"
            fullWidth
            required
            value={currentCompany.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            name="sector"
            label="Sector"
            fullWidth
            value={currentCompany.sector}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            name="location"
            label="Location"
            fullWidth
            value={currentCompany.location}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            name="contact_email"
            label="Contact Email"
            fullWidth
            type="email"
            value={currentCompany.contact_email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            name="website"
            label="Website"
            fullWidth
            value={currentCompany.website}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Companies;
