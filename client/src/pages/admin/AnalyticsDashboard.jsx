import { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Button,
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Alert, Stack, Select, MenuItem,
  FormControl, InputLabel, TextField, Skeleton, IconButton, Tooltip
} from '@mui/material';
import {
  TrendingUp, ShowChart, Business,
  Refresh, Search
} from '@mui/icons-material';
import { adminService } from '../../services';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [pipeline, setPipeline] = useState([]);
  const [companyPerf, setCompanyPerf] = useState([]);
  const [stats, setStats] = useState([]);
  const [meta, setMeta] = useState({ offers: [] });

  const [search, setSearch] = useState('');
  const [procedureForm, setProcedureForm] = useState({ offer_id: '', round_number: '' });
  const [bulkRejectOfferId, setBulkRejectOfferId] = useState('');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pl, cp, ps, mt] = await Promise.all([
        adminService.getPipeline(),
        adminService.getCompanyPerformance(),
        adminService.getPlacementStats(),
        adminService.getExpansionMeta(),
      ]);
      setPipeline(pl);
      setCompanyPerf(cp);
      setStats(ps);
      setMeta(mt);
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

  const StatCard = ({ icon, title, value, gradient }) => (
    <Card
      sx={{
        height: 120,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 3,
        background: gradient,
        color: 'white',
        transition: '0.3s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
      }}
    >
      <CardContent sx={{ width: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.25)', p: 1.5, borderRadius: 2 }}>
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={800} noWrap>{value}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }} noWrap>
              {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const filteredCompanies = companyPerf.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            📊 Analytics Dashboard
          </Typography>
          <Typography color="text.secondary">
            Insights, reports & automated actions
          </Typography>
        </Box>

        <Tooltip title="Refresh">
          <IconButton
            onClick={loadAll}
            sx={{
              border: '1px solid #e0e3eb',
              borderRadius: 2
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Stack>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard icon={<TrendingUp />} title="Stats" value={stats.length} gradient="linear-gradient(135deg,#667eea,#764ba2)" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard icon={<ShowChart />} title="Pipelines" value={pipeline.length} gradient="linear-gradient(135deg,#4facfe,#00f2fe)" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard icon={<Business />} title="Companies" value={companyPerf.length} gradient="linear-gradient(135deg,#43e97b,#38f9d7)" />
        </Grid>
      </Grid>

      {loading ? (
        <Grid container spacing={2}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rounded" height={250} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>

          {/* Actions */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700} mb={2}>⚡ Actions</Typography>

              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Offer</InputLabel>
                  <Select
                    value={procedureForm.offer_id}
                    label="Offer"
                    onChange={(e) => setProcedureForm({ ...procedureForm, offer_id: e.target.value })}
                  >
                    {meta.offers.map(o => (
                      <MenuItem key={o.id} value={o.id}>{o.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  type="number"
                  label="Round"
                  value={procedureForm.round_number}
                  onChange={(e) => setProcedureForm({ ...procedureForm, round_number: e.target.value })}
                />

                <Button
                  variant="contained"
                  disabled={!procedureForm.offer_id || !procedureForm.round_number}
                  onClick={() =>
                    submit(() =>
                      adminService.autoAdvanceStudents(
                        procedureForm.offer_id,
                        procedureForm.round_number
                      ),
                      'Advanced successfully'
                    )
                  }
                >
                  Auto Advance
                </Button>

                <FormControl fullWidth size="small">
                  <InputLabel>Offer</InputLabel>
                  <Select
                    value={bulkRejectOfferId}
                    label="Offer"
                    onChange={(e) => setBulkRejectOfferId(e.target.value)}
                  >
                    {meta.offers.map(o => (
                      <MenuItem key={o.id} value={o.id}>{o.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  color="error"
                  variant="contained"
                  disabled={!bulkRejectOfferId}
                  onClick={() =>
                    submit(
                      () => adminService.bulkRejectPendingApplications(bulkRejectOfferId),
                      'Rejected successfully'
                    )
                  }
                >
                  Bulk Reject
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Pipeline */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700} mb={2}>📊 Pipeline</Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Offer</TableCell>
                    <TableCell align="center">Applications</TableCell>
                    <TableCell align="center">Selected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pipeline.map(p => (
                    <TableRow key={p.offer_id}>
                      <TableCell>{p.title}</TableCell>
                      <TableCell align="center">
                        <Chip label={p.total_applications} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={p.selected_count} size="small" color="success" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Company Performance (FIXED + COHESIVE) */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
                spacing={2}
                mb={2}
              >
                <Typography fontWeight={700}>
                  🏢 Company Performance ({filteredCompanies.length})
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 0.5,
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    width: { xs: '100%', sm: 250 },
                    '&:focus-within': {
                      borderColor: '#667eea',
                      boxShadow: '0 0 0 2px rgba(102,126,234,0.15)',
                      bgcolor: 'white'
                    }
                  }}
                >
                  <Search sx={{ color: 'text.secondary', mr: 1 }} />
                  <input
                    placeholder="Search company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  />
                </Box>
              </Stack>

              {filteredCompanies.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography fontWeight={600}>No results found</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f9fafb' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Applications
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Conversion Rate
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filteredCompanies.map(c => (
                        <TableRow key={c.company_id} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {c.company_name}
                          </TableCell>

                          <TableCell align="center">
                            {c.total_applications}
                          </TableCell>

                          <TableCell align="center">
                            <Chip
                              label={`${c.conversion_rate ?? 0}%`}
                              size="small"
                              color={
                                (c.conversion_rate ?? 0) > 60
                                  ? 'success'
                                  : (c.conversion_rate ?? 0) > 30
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>

                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>

        </Grid>
      )}
    </Container>
  );
}