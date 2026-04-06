import { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Paper, Box, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel, Select,
  MenuItem, Grid, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, Tabs, Tab, CircularProgress, Divider,
} from '@mui/material';
import {
  Add as AddIcon, People as PeopleIcon, Event as EventIcon,
  Close as CloseIcon, Work as WorkIcon, CalendarToday as CalIcon,
} from '@mui/icons-material';
import { companyService, adminService, offerService, interviewService } from '../../services';

const STATUS_COLORS = {
  pending: 'warning', shortlisted: 'info', selected: 'success',
  rejected: 'error', withdrawn: 'default',
};

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Offer dialog
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [offerData, setOfferData] = useState({
    company_id: '', title: '', description: '', type: 'summer',
    stipend: '', location: '', min_cgpa: '0', max_backlogs: '0', deadline: '',
  });

  // Applicants panel
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsPanelOpen, setApplicantsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Interview dialog
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [targetApplicationId, setTargetApplicationId] = useState(null);
  const [interviewData, setInterviewData] = useState({
    scheduled_at: '', mode: 'online', link_or_venue: '', notes: '',
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [offersData, companiesData] = await Promise.all([
        offerService.getAll(),
        companyService.getAll(),
      ]);
      setOffers(offersData);
      setCompanies(companiesData);
    } catch (err) {
      showMessage('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleCreateOffer = async () => {
    try {
      await adminService.createOffer({
        ...offerData,
        stipend: parseFloat(offerData.stipend) || null,
        min_cgpa: parseFloat(offerData.min_cgpa),
        max_backlogs: parseInt(offerData.max_backlogs),
      });
      showMessage('success', 'Offer posted successfully!');
      setOfferDialogOpen(false);
      setOfferData({ company_id: '', title: '', description: '', type: 'summer', stipend: '', location: '', min_cgpa: '0', max_backlogs: '0', deadline: '' });
      loadAll();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to post offer');
    }
  };

  const openApplicants = async (offer) => {
    setSelectedOffer(offer);
    setApplicantsPanelOpen(true);
    setApplicantsLoading(true);
    try {
      const data = await adminService.getApplicants(offer.id);
      setApplicants(data);
    } catch (err) {
      showMessage('error', 'Failed to load applicants');
    } finally {
      setApplicantsLoading(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await adminService.updateApplicationStatus(applicationId, status);
      setApplicants(prev => prev.map(a => a.id === applicationId ? { ...a, status } : a));
      showMessage('success', 'Status updated');
    } catch (err) {
      showMessage('error', 'Failed to update status');
    }
  };

  const scheduleInterview = async () => {
    try {
      await interviewService.schedule({ application_id: targetApplicationId, ...interviewData });
      showMessage('success', 'Interview scheduled!');
      setInterviewDialogOpen(false);
      setInterviewData({ scheduled_at: '', mode: 'online', link_or_venue: '', notes: '' });
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to schedule interview');
    }
  };

  const openInterviewDialog = (applicationId) => {
    setTargetApplicationId(applicationId);
    setInterviewDialogOpen(true);
  };

  const getTypeLabel = (type) => ({ summer: 'Summer', '6_month': '6 Month', '6_plus_6_month': '6+6 Month' }[type] || type);
  const getTypeColor = (type) => ({ summer: 'primary', '6_month': 'secondary', '6_plus_6_month': 'success' }[type] || 'default');

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Manage Offers</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Post offers and manage applicants
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOfferDialogOpen(true)}>
          Post New Offer
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Offers List */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : offers.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <WorkIcon sx={{ fontSize: 56, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No offers posted yet</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOfferDialogOpen(true)} startIcon={<AddIcon />}>
            Post First Offer
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Stipend</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id} hover>
                  <TableCell><Typography fontWeight={600}>{offer.title}</Typography></TableCell>
                  <TableCell>{offer.company_name}</TableCell>
                  <TableCell><Chip label={getTypeLabel(offer.type)} color={getTypeColor(offer.type)} size="small" /></TableCell>
                  <TableCell>{offer.stipend ? `₹${Number(offer.stipend).toLocaleString()}` : '—'}</TableCell>
                  <TableCell>{new Date(offer.deadline).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell>
                    <Chip
                      label={offer.status.toUpperCase()}
                      color={offer.status === 'open' ? 'success' : offer.status === 'closed' ? 'error' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small" variant="outlined" startIcon={<PeopleIcon />}
                      onClick={() => openApplicants(offer)} sx={{ mr: 1 }}
                    >
                      Applicants
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Applicants Panel Dialog */}
      <Dialog open={applicantsPanelOpen} onClose={() => setApplicantsPanelOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">Applicants — {selectedOffer?.title}</Typography>
              <Typography variant="caption" color="text.secondary">{selectedOffer?.company_name}</Typography>
            </Box>
            <IconButton onClick={() => setApplicantsPanelOpen(false)}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {applicantsLoading ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
          ) : applicants.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography color="text.secondary">No applicants yet</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Reg No.</TableCell>
                    <TableCell>Branch</TableCell>
                    <TableCell>CGPA</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Change Status</TableCell>
                    <TableCell>Interview</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applicants.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell>
                        <Typography fontWeight={600} fontSize={13}>{app.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{app.email}</Typography>
                      </TableCell>
                      <TableCell>{app.reg_number}</TableCell>
                      <TableCell>{app.branch}</TableCell>
                      <TableCell>
                        <Chip
                          label={app.cgpa}
                          size="small"
                          color={app.cgpa >= 8 ? 'success' : app.cgpa >= 6 ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={app.status} color={STATUS_COLORS[app.status]} size="small" />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                          <Select
                            value={app.status}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="shortlisted">Shortlisted</MenuItem>
                            <MenuItem value="selected">Selected</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small" variant="outlined" startIcon={<EventIcon />}
                          onClick={() => openInterviewDialog(app.id)}
                          disabled={app.status === 'rejected' || app.status === 'withdrawn'}
                        >
                          Schedule
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* Post Offer Dialog */}
      <Dialog open={offerDialogOpen} onClose={() => setOfferDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post New Offer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Company</InputLabel>
                <Select name="company_id" value={offerData.company_id} label="Company"
                  onChange={(e) => setOfferData({ ...offerData, company_id: e.target.value })}>
                  {companies.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required name="title" label="Job Title"
                value={offerData.title} onChange={(e) => setOfferData({ ...offerData, title: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} name="description" label="Description"
                value={offerData.description} onChange={(e) => setOfferData({ ...offerData, description: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select name="type" value={offerData.type} label="Type"
                  onChange={(e) => setOfferData({ ...offerData, type: e.target.value })}>
                  <MenuItem value="summer">Summer Internship</MenuItem>
                  <MenuItem value="6_month">6 Month Internship</MenuItem>
                  <MenuItem value="6_plus_6_month">6+6 Month Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="stipend" label="Stipend (₹/month)" type="number"
                value={offerData.stipend} onChange={(e) => setOfferData({ ...offerData, stipend: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="location" label="Location"
                value={offerData.location} onChange={(e) => setOfferData({ ...offerData, location: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required name="deadline" label="Application Deadline" type="date"
                InputLabelProps={{ shrink: true }}
                value={offerData.deadline} onChange={(e) => setOfferData({ ...offerData, deadline: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="min_cgpa" label="Minimum CGPA" type="number"
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                value={offerData.min_cgpa} onChange={(e) => setOfferData({ ...offerData, min_cgpa: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="max_backlogs" label="Max Backlogs Allowed" type="number"
                inputProps={{ min: 0 }}
                value={offerData.max_backlogs} onChange={(e) => setOfferData({ ...offerData, max_backlogs: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOfferDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateOffer} variant="contained">Post Offer</Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={interviewDialogOpen} onClose={() => setInterviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CalIcon color="primary" />
            Schedule Interview
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth required label="Date & Time" type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={interviewData.scheduled_at}
                onChange={(e) => setInterviewData({ ...interviewData, scheduled_at: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Mode</InputLabel>
                <Select value={interviewData.mode} label="Mode"
                  onChange={(e) => setInterviewData({ ...interviewData, mode: e.target.value })}>
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label={interviewData.mode === 'online' ? 'Meeting Link' : 'Venue'}
                value={interviewData.link_or_venue}
                onChange={(e) => setInterviewData({ ...interviewData, link_or_venue: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Notes"
                value={interviewData.notes}
                onChange={(e) => setInterviewData({ ...interviewData, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInterviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={scheduleInterview} variant="contained" disabled={!interviewData.scheduled_at}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
