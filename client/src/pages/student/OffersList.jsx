import { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, CardActions, Typography, Button,
  Chip, Box, FormControl, InputLabel, Select, MenuItem, TextField,
  Alert, CircularProgress, InputAdornment, Tooltip, Divider,
} from '@mui/material';
import {
  Work as WorkIcon, LocationOn as LocationIcon,
  AttachMoney as MoneyIcon, CalendarToday as CalIcon,
  School as SchoolIcon, Search as SearchIcon,
  CheckCircle as AppliedIcon, Business as BizIcon,
} from '@mui/icons-material';
import { offerService, applicationService } from '../../services';

const TYPE_LABELS = { summer: 'Summer', '6_month': '6 Month', '6_plus_6_month': '6+6 Month' };
const TYPE_COLORS = { summer: 'primary', '6_month': 'secondary', '6_plus_6_month': 'success' };

export default function OffersList() {
  const [offers, setOffers] = useState([]);
  const [appliedOfferIds, setAppliedOfferIds] = useState(new Set());
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadData(); }, []);
  useEffect(() => { applyFilters(); }, [offers, typeFilter, searchTerm]);

  const loadData = async () => {
    try {
      const [offersData, myApps] = await Promise.all([
        offerService.getAll(),
        applicationService.getMyApplications().catch(() => []),
      ]);
      setOffers(offersData);
      setAppliedOfferIds(new Set(myApps.map(a => a.offer_id)));
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load offers' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...offers];
    if (typeFilter) filtered = filtered.filter(o => o.type === typeFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.title.toLowerCase().includes(term) ||
        o.company_name.toLowerCase().includes(term) ||
        (o.location || '').toLowerCase().includes(term)
      );
    }
    setFilteredOffers(filtered);
  };

  const handleApply = async (offerId) => {
    setApplying(offerId);
    try {
      await applicationService.apply(offerId);
      setAppliedOfferIds(prev => new Set([...prev, offerId]));
      setMessage({ type: 'success', text: 'Application submitted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to apply';
      if (errMsg === 'Already applied') {
        setAppliedOfferIds(prev => new Set([...prev, offerId]));
      }
      setMessage({ type: 'error', text: errMsg });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setApplying(null);
    }
  };

  const isDeadlineSoon = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 3 && days >= 0;
  };

  const isDeadlinePassed = (deadline) => new Date(deadline) < new Date();

  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Typography variant="h4">Browse Offers</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {offers.length} internship opportunities available
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search roles, companies, locations"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Internship Type</InputLabel>
          <Select value={typeFilter} label="Internship Type" onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="summer">Summer Internship</MenuItem>
            <MenuItem value="6_month">6 Month Internship</MenuItem>
            <MenuItem value="6_plus_6_month">6+6 Month Internship</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
      ) : filteredOffers.length === 0 ? (
        <Box textAlign="center" py={10}>
          <WorkIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No offers match your search</Typography>
          <Button sx={{ mt: 2 }} onClick={() => { setSearchTerm(''); setTypeFilter(''); }}>
            Clear Filters
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredOffers.map((offer) => {
            const hasApplied = appliedOfferIds.has(offer.id);
            const deadlinePassed = isDeadlinePassed(offer.deadline);
            const deadlineSoon = isDeadlineSoon(offer.deadline);

            return (
              <Grid item xs={12} md={6} key={offer.id}>
                <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: hasApplied ? '2px solid #2d8c5e' : '1px solid rgba(0,0,0,0.06)',
                }}>
                  <CardContent sx={{ flex: 1, p: 2.5 }}>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Box flex={1}>
                        <Typography variant="h6" fontWeight={700} fontSize={16} lineHeight={1.3}>
                          {offer.title}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.4}>
                          <BizIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {offer.company_name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" flexDirection="column" gap={0.5} alignItems="flex-end">
                        <Chip label={TYPE_LABELS[offer.type]} color={TYPE_COLORS[offer.type]} size="small" />
                        {hasApplied && (
                          <Chip
                            label="Applied"
                            size="small"
                            color="success"
                            icon={<AppliedIcon sx={{ fontSize: '14px !important' }} />}
                          />
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Details grid */}
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={0.6}>
                          <LocationIcon sx={{ fontSize: 15, color: '#0f4c81' }} />
                          <Typography variant="caption" color="text.secondary">
                            {offer.location || 'Not specified'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={0.6}>
                          <MoneyIcon sx={{ fontSize: 15, color: '#2d8c5e' }} />
                          <Typography variant="caption" color="text.secondary">
                            {offer.stipend ? `₹${Number(offer.stipend).toLocaleString()}/mo` : 'Not disclosed'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={0.6}>
                          <SchoolIcon sx={{ fontSize: 15, color: '#7b1fa2' }} />
                          <Typography variant="caption" color="text.secondary">
                            Min CGPA: {offer.min_cgpa}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={0.6}>
                          <CalIcon sx={{ fontSize: 15, color: deadlineSoon ? '#e8621a' : 'text.secondary' }} />
                          <Typography variant="caption" color={deadlineSoon ? 'error' : 'text.secondary'} fontWeight={deadlineSoon ? 700 : 400}>
                            {deadlinePassed
                              ? 'Deadline passed'
                              : `Due: ${new Date(offer.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {offer.max_backlogs === 0 && (
                      <Box mt={1.5}>
                        <Chip label="No Backlogs Allowed" size="small" color="warning" variant="outlined" />
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ px: 2.5, pb: 2, pt: 0, gap: 1 }}>
                    <Button
                      variant="contained" size="small" fullWidth
                      onClick={() => handleApply(offer.id)}
                      disabled={hasApplied || deadlinePassed || applying === offer.id}
                      startIcon={hasApplied ? <AppliedIcon /> : null}
                      sx={{
                        ...(hasApplied && {
                          bgcolor: '#2d8c5e',
                          '&:hover': { bgcolor: '#2d8c5e' },
                          '&.Mui-disabled': { bgcolor: '#2d8c5e', color: 'white', opacity: 0.8 },
                        }),
                      }}
                    >
                      {applying === offer.id
                        ? <CircularProgress size={18} color="inherit" />
                        : hasApplied
                          ? 'Applied'
                          : deadlinePassed
                            ? 'Closed'
                            : 'Apply Now'
                      }
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
