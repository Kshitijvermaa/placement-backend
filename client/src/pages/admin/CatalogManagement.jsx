import { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Button,
  TextField, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Alert, Stack, Select, MenuItem,
  FormControl, InputLabel,
} from '@mui/material';
import {
  Apartment as ApartmentIcon, Layers, Badge as BadgeIcon,
} from '@mui/icons-material';
import { adminService } from '../../services';

export default function CatalogManagement() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [departmentForm, setDepartmentForm] = useState({ code: '', name: '' });
  const [batchForm, setBatchForm] = useState({ batch_label: '', start_year: '', end_year: '', graduation_year: '' });
  const [recruiterForm, setRecruiterForm] = useState({ company_id: '', name: '', email: '', phone: '', designation: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [deps, bts, recs, meta] = await Promise.all([
        adminService.getDepartments(),
        adminService.getBatches(),
        adminService.getRecruiters(),
        adminService.getExpansionMeta(),
      ]);
      setDepartments(deps);
      setBatches(bts);
      setRecruiters(recs);
      setCompanies(meta.companies || []);
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const submit = async (fn, successMessage) => {
    try {
      await fn();
      showMessage('success', successMessage);
      await loadAll();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Operation failed');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          📚 Catalog Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage departments, batches, and recruiters
        </Typography>
      </Box>

      {message.text && <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>{message.text}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 2, p: 1.5 }}>
                  <ApartmentIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={800}>{departments.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Departments</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 2, p: 1.5 }}>
                  <Layers sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={800}>{batches.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Batches</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 2, p: 1.5 }}>
                  <BadgeIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={800}>{recruiters.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Recruiters</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Loading...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Departments */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 1.5, p: 1, display: 'flex' }}>
                  <ApartmentIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Departments</Typography>
              </Stack>
              
              <Stack spacing={2} sx={{ mb: 3 }}>
                <TextField
                  label="Code"
                  size="small"
                  fullWidth
                  value={departmentForm.code}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, code: e.target.value.toUpperCase() })}
                  placeholder="CSE, ECE, etc."
                />
                <TextField
                  label="Name"
                  size="small"
                  fullWidth
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                  placeholder="Computer Science"
                />
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textTransform: 'none', fontWeight: 600, py: 1 }}
                  disabled={!departmentForm.code || !departmentForm.name}
                  onClick={() => {
                    submit(() => adminService.createDepartment(departmentForm), 'Department added');
                    setDepartmentForm({ code: '', name: '' });
                  }}
                >
                  Add Department
                </Button>
              </Stack>

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                All Departments ({departments.length})
              </Typography>
              <TableContainer sx={{ maxHeight: 400, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departments.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell><Chip label={d.code} size="small" color="primary" /></TableCell>
                        <TableCell>{d.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Batches */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: 1.5, p: 1, display: 'flex' }}>
                  <Layers sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Batches</Typography>
              </Stack>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <TextField
                  label="Batch Label"
                  size="small"
                  fullWidth
                  value={batchForm.batch_label}
                  onChange={(e) => setBatchForm({ ...batchForm, batch_label: e.target.value })}
                  placeholder="2020-2024"
                />
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <TextField
                      label="Start Year"
                      size="small"
                      type="number"
                      fullWidth
                      value={batchForm.start_year}
                      onChange={(e) => setBatchForm({ ...batchForm, start_year: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="End Year"
                      size="small"
                      type="number"
                      fullWidth
                      value={batchForm.end_year}
                      onChange={(e) => setBatchForm({ ...batchForm, end_year: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Grad Year"
                      size="small"
                      type="number"
                      fullWidth
                      value={batchForm.graduation_year}
                      onChange={(e) => setBatchForm({ ...batchForm, graduation_year: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', textTransform: 'none', fontWeight: 600, py: 1 }}
                  disabled={!batchForm.batch_label || !batchForm.graduation_year}
                  onClick={() => {
                    submit(() => adminService.createBatch(batchForm), 'Batch added');
                    setBatchForm({ batch_label: '', start_year: '', end_year: '', graduation_year: '' });
                  }}
                >
                  Add Batch
                </Button>
              </Stack>

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                All Batches ({batches.length})
              </Typography>
              <TableContainer sx={{ maxHeight: 400, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Batch</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Grad</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {batches.map((b) => (
                      <TableRow key={b.id} hover>
                        <TableCell><Chip label={b.batch_label} size="small" color="secondary" /></TableCell>
                        <TableCell><strong>{b.graduation_year}</strong></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Recruiters */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: 1.5, p: 1, display: 'flex' }}>
                  <BadgeIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Recruiters</Typography>
              </Stack>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Company</InputLabel>
                  <Select
                    value={recruiterForm.company_id}
                    label="Company"
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, company_id: e.target.value })}
                  >
                    {companies.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      label="Name"
                      size="small"
                      fullWidth
                      value={recruiterForm.name}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Designation"
                      size="small"
                      fullWidth
                      value={recruiterForm.designation}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, designation: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      label="Email"
                      size="small"
                      type="email"
                      fullWidth
                      value={recruiterForm.email}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, email: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Phone"
                      size="small"
                      fullWidth
                      value={recruiterForm.phone}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, phone: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', textTransform: 'none', fontWeight: 600, py: 1 }}
                  disabled={!recruiterForm.company_id || !recruiterForm.name}
                  onClick={() => {
                    submit(() => adminService.createRecruiter(recruiterForm), 'Recruiter added');
                    setRecruiterForm({ company_id: '', name: '', email: '', phone: '', designation: '' });
                  }}
                >
                  Add Recruiter
                </Button>
              </Stack>

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                All Recruiters ({recruiters.length})
              </Typography>
              <TableContainer sx={{ maxHeight: 400, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Company</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recruiters.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>{r.name}</TableCell>
                        <TableCell><Chip label={r.company_name} size="small" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
