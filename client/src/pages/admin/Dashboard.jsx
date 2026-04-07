import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Card, CardContent, Typography, Box, Paper, Button,
  Skeleton, Divider, Alert,
} from '@mui/material';
import {
  Business as BusinessIcon, Work as WorkIcon, People as PeopleIcon,
  Assignment as AssignmentIcon, ArrowForward as ArrowIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { companyService, adminService, offerService } from '../../services';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [companies, students, offers] = await Promise.all([
        companyService.getAll(),
        adminService.getStudents(),
        offerService.getAll(),
      ]);
      setStats({
        totalCompanies: companies.length,
        activeOffers: offers.filter(o => o.status === 'open').length,
        totalStudents: students.length,
        totalOffers: offers.length,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDummyData = async () => {
    setSeeding(true);
    setSeedMessage({ type: '', text: '' });
    try {
      const data = await adminService.seedDummyData();
      setSeedMessage({ type: 'success', text: data.message || 'Dummy data seeded successfully.' });
      await loadStats();
    } catch (err) {
      setSeedMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to seed dummy data.',
      });
    } finally {
      setSeeding(false);
    }
  };

  const statCards = stats ? [
    {
      title: 'Total Companies', value: stats.totalCompanies,
      icon: <BusinessIcon sx={{ fontSize: 32 }} />,
      color: '#0f4c81', bg: 'rgba(15,76,129,0.08)',
      action: () => navigate('/admin/companies'),
    },
    {
      title: 'Active Offers', value: stats.activeOffers,
      icon: <WorkIcon sx={{ fontSize: 32 }} />,
      color: '#2d8c5e', bg: 'rgba(45,140,94,0.08)',
      action: () => navigate('/admin/offers'),
    },
    {
      title: 'Registered Students', value: stats.totalStudents,
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      color: '#e8621a', bg: 'rgba(232,98,26,0.08)',
      action: () => navigate('/admin/students'),
    },
    {
      title: 'Total Offers', value: stats.totalOffers,
      icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
      color: '#7b1fa2', bg: 'rgba(123,31,162,0.08)',
      action: () => navigate('/admin/offers'),
    },
  ] : [];

  const quickActions = [
    { label: 'Add Company', desc: 'Register a new recruiting company', path: '/admin/companies', color: '#0f4c81' },
    { label: 'Post Offer', desc: 'Create a new internship opportunity', path: '/admin/offers', color: '#2d8c5e' },
    { label: 'View Students', desc: 'Browse registered student profiles', path: '/admin/students', color: '#e8621a' },
  ];

  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Placement portal overview and quick actions
        </Typography>
        <Box mt={2} display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <Button
            variant="contained"
            onClick={handleSeedDummyData}
            disabled={seeding}
          >
            {seeding ? 'Seeding Dummy Data...' : 'Fill Dummy Data (Expanded DB)'}
          </Button>
        </Box>
        {seedMessage.text && (
          <Alert
            severity={seedMessage.type}
            sx={{ mt: 2 }}
            onClose={() => setSeedMessage({ type: '', text: '' })}
          >
            {seedMessage.text}
          </Alert>
        )}
      </Box>

      <Grid container spacing={3}>
        {loading
          ? [1, 2, 3, 4].map(i => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rounded" height={110} />
              </Grid>
            ))
          : statCards.map((stat, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card
                  onClick={stat.action}
                  sx={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={0.5}>
                          {stat.title.toUpperCase()}
                        </Typography>
                        <Typography variant="h3" fontWeight={800} mt={0.5} sx={{ color: stat.color }}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Box sx={{
                        bgcolor: stat.bg, color: stat.color,
                        borderRadius: 2, p: 1.2, display: 'flex',
                      }}>
                        {stat.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
        }

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TrendingIcon color="primary" />
              <Typography variant="h6">Quick Actions</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {quickActions.map((action, i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <Box
                    onClick={() => navigate(action.path)}
                    sx={{
                      p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)',
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', borderColor: action.color },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box>
                      <Typography fontWeight={700} sx={{ color: action.color }}>{action.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{action.desc}</Typography>
                    </Box>
                    <ArrowIcon sx={{ color: action.color, fontSize: 20 }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
