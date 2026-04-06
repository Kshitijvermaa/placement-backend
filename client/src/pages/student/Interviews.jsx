import { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, Box, Chip, Grid, Card, CardContent,
  CircularProgress, Alert, Divider,
} from '@mui/material';
import {
  Event as EventIcon, Videocam as VideoIcon, LocationOn as LocationIcon,
  Business as BusinessIcon, AccessTime as ClockIcon, Notes as NotesIcon,
} from '@mui/icons-material';
import { interviewService } from '../../services';

const MODE_COLORS = { online: 'primary', offline: 'secondary' };

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const data = await interviewService.getForStudent();
      setInterviews(data);
    } catch (err) {
      setError('Failed to load interviews. Please ensure your profile is complete.');
    } finally {
      setLoading(false);
    }
  };

  const upcoming = interviews.filter(i => new Date(i.scheduled_at) >= new Date());
  const past = interviews.filter(i => new Date(i.scheduled_at) < new Date());

  const InterviewCard = ({ interview, isPast }) => {
    const date = new Date(interview.scheduled_at);
    const isToday = date.toDateString() === new Date().toDateString();

    return (
      <Card sx={{
        opacity: isPast ? 0.75 : 1,
        border: isToday ? '2px solid #0f4c81' : '1px solid rgba(0,0,0,0.08)',
      }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>{interview.title}</Typography>
              <Box display="flex" alignItems="center" gap={0.5} mt={0.3}>
                <BusinessIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">{interview.company_name}</Typography>
              </Box>
            </Box>
            <Box display="flex" gap={0.8} flexDirection="column" alignItems="flex-end">
              <Chip
                label={interview.mode.toUpperCase()}
                size="small"
                color={MODE_COLORS[interview.mode]}
                icon={interview.mode === 'online' ? <VideoIcon sx={{ fontSize: '14px !important' }} /> : <LocationIcon sx={{ fontSize: '14px !important' }} />}
              />
              {isToday && <Chip label="TODAY" size="small" color="error" />}
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={0.8}>
                <ClockIcon sx={{ fontSize: 16, color: '#0f4c81' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Date & Time</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={0.8}>
                {interview.mode === 'online' ? <VideoIcon sx={{ fontSize: 16, color: '#0f4c81' }} /> : <LocationIcon sx={{ fontSize: 16, color: '#0f4c81' }} />}
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {interview.mode === 'online' ? 'Meeting Link' : 'Venue'}
                  </Typography>
                  {interview.link_or_venue ? (
                    interview.mode === 'online' ? (
                      <Typography
                        variant="body2" fontWeight={600}
                        component="a" href={interview.link_or_venue} target="_blank" rel="noreferrer"
                        sx={{ color: '#0f4c81', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        Join Meeting →
                      </Typography>
                    ) : (
                      <Typography variant="body2" fontWeight={600}>{interview.link_or_venue}</Typography>
                    )
                  ) : (
                    <Typography variant="body2" color="text.secondary">Not specified</Typography>
                  )}
                </Box>
              </Box>
            </Grid>
            {interview.notes && (
              <Grid item xs={12}>
                <Box display="flex" alignItems="flex-start" gap={0.8} sx={{ bgcolor: 'rgba(15,76,129,0.05)', p: 1.2, borderRadius: 1.5 }}>
                  <NotesIcon sx={{ fontSize: 16, color: '#0f4c81', mt: 0.2 }} />
                  <Typography variant="body2" color="text.secondary">{interview.notes}</Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          <Box mt={1.5} pt={1.5} sx={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <Chip
              label={`Application: ${interview.status?.toUpperCase() || 'SHORTLISTED'}`}
              size="small"
              color={interview.status === 'selected' ? 'success' : interview.status === 'rejected' ? 'error' : 'warning'}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Typography variant="h4">My Interviews</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Scheduled interviews and history
        </Typography>
      </Box>

      {loading && <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && interviews.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <EventIcon sx={{ fontSize: 56, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No interviews scheduled yet</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Interviews will appear here once the admin schedules them for your applications.
          </Typography>
        </Paper>
      )}

      {!loading && upcoming.length > 0 && (
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <EventIcon color="primary" />
            <Typography variant="h6">Upcoming ({upcoming.length})</Typography>
          </Box>
          <Grid container spacing={2}>
            {upcoming.map(i => (
              <Grid item xs={12} md={6} key={i.id}>
                <InterviewCard interview={i} isPast={false} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {!loading && past.length > 0 && (
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <ClockIcon color="action" />
            <Typography variant="h6" color="text.secondary">Past ({past.length})</Typography>
          </Box>
          <Grid container spacing={2}>
            {past.map(i => (
              <Grid item xs={12} md={6} key={i.id}>
                <InterviewCard interview={i} isPast={true} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}
