import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { applicationService } from '../../services';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, statusFilter]);

  const loadApplications = async () => {
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!statusFilter) {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter(app => app.status === statusFilter)
      );
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      shortlisted: 'info',
      selected: 'success',
      rejected: 'error',
      withdrawn: 'default',
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        My Applications
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="shortlisted">Shortlisted</MenuItem>
            <MenuItem value="selected">Selected</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="withdrawn">Withdrawn</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography>Loading applications...</Typography>
      ) : filteredApplications.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>No applications found</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Company</strong></TableCell>
                <TableCell><strong>Position</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Stipend</strong></TableCell>
                <TableCell><strong>Applied On</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell>{app.company_name}</TableCell>
                  <TableCell>{app.title}</TableCell>
                  <TableCell>{app.type.replace(/_/g, ' ')}</TableCell>
                  <TableCell>
                    {app.stipend ? `₹${app.stipend.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {new Date(app.applied_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={app.status.toUpperCase()}
                      color={getStatusColor(app.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Applications;
