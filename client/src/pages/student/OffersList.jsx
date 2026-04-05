import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
} from '@mui/material';
import { Work as WorkIcon, LocationOn as LocationIcon, AttachMoney as MoneyIcon } from '@mui/icons-material';
import { offerService, applicationService } from '../../services';

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadOffers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [offers, typeFilter, searchTerm]);

  const loadOffers = async () => {
    try {
      const data = await offerService.getAll();
      setOffers(data);
    } catch (error) {
      console.error('Failed to load offers:', error);
      setMessage({ type: 'error', text: 'Failed to load offers' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...offers];

    if (typeFilter) {
      filtered = filtered.filter(offer => offer.type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        offer =>
          offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOffers(filtered);
  };

  const handleApply = async (offerId) => {
    try {
      await applicationService.apply(offerId);
      setMessage({ type: 'success', text: 'Application submitted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to apply',
      });
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      summer: 'primary',
      '6_month': 'secondary',
      '6_plus_6_month': 'success',
    };
    return colors[type] || 'default';
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Browse Offers
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Search by title or company"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Type</InputLabel>
          <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="summer">Summer Internship</MenuItem>
            <MenuItem value="6_month">6 Month Internship</MenuItem>
            <MenuItem value="6_plus_6_month">6+6 Month Internship</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography>Loading offers...</Typography>
      ) : filteredOffers.length === 0 ? (
        <Alert severity="info">No offers found</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredOffers.map((offer) => (
            <Grid item xs={12} md={6} key={offer.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Typography variant="h6" gutterBottom>
                      {offer.title}
                    </Typography>
                    <Chip label={offer.type.replace(/_/g, ' ')} color={getTypeColor(offer.type)} size="small" />
                  </Box>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    <WorkIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {offer.company_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <LocationIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {offer.location || 'Not specified'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <MoneyIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    ₹{offer.stipend ? offer.stipend.toLocaleString() : 'Not disclosed'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Min CGPA:</strong> {offer.min_cgpa}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Max Backlogs:</strong> {offer.max_backlogs}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Deadline:</strong> {new Date(offer.deadline).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/student/offers/${offer.id}`)}>
                    View Details
                  </Button>
                  <Button size="small" variant="contained" onClick={() => handleApply(offer.id)}>
                    Apply Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default OffersList;
