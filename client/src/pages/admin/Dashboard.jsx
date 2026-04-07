import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Card, CardContent, Typography, Box, Paper,
  Skeleton, Avatar,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { companyService, adminService, offerService } from '../../services';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

      const openOffers = offers.filter(o => o.status === 'open');
      const closedOffers = offers.filter(o => o.status === 'closed');

      setStats({
        totalCompanies: companies.length,
        activeOffers: openOffers.length,
        totalStudents: students.length,
        totalOffers: offers.length,
        closedOffers: closedOffers.length,
        recentCompanies: companies.slice(-3).reverse(),
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      description: 'View and manage all registered companies',
      icon: <BusinessIcon sx={{ fontSize: 36 }} />,
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      action: () => navigate('/admin/companies'),
    },
    {
      title: 'Active Offers',
      value: stats.activeOffers,
      description: 'Browse currently open job offers',
      icon: <WorkIcon sx={{ fontSize: 36 }} />,
      gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
      action: () => navigate('/admin/offers'),
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      description: 'Manage registered students',
      icon: <PeopleIcon sx={{ fontSize: 36 }} />,
      gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      action: () => navigate('/admin/students'),
    },
    {
      title: 'Placements',
      value: stats.closedOffers,
      description: 'View completed placements',
      icon: <TrophyIcon sx={{ fontSize: 36 }} />,
      gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
      action: () => navigate('/admin/offers'),
    },
  ] : [];

  return (
    <Container maxWidth="xl">
      {/* Welcome Section */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: 'white',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Welcome, Admin 👋
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Here's what's happening in your placement system today.
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading
          ? [1, 2, 3, 4].map(i => (
              <Grid item xs={12} sm={6} lg={3} key={i} sx={{ display: 'flex' }}>
                <Skeleton variant="rounded" height={170} sx={{ borderRadius: 3 }} />
              </Grid>
            ))
          : statCards.map((stat, i) => (
              <Grid item xs={12} sm={6} lg={3} key={i} sx={{ display: 'flex' }}>
                <Card
                  onClick={stat.action}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 4,
                    background: stat.gradient,
                    color: 'white',
                    height: 180,
                    display: 'flex',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.35s ease',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.12)',

                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(6px)',
                    },

                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.02)',
                      boxShadow: '0 18px 40px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    {/* Top Row */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          borderRadius: 2,
                          p: 1,
                          flexShrink: 0,
                        }}
                      >
                        {stat.icon}
                      </Box>

                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.9,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        View →
                      </Typography>
                    </Box>

                    {/* Bottom Content */}
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          lineHeight: 1.1,
                        }}
                      >
                        {stat.value}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {stat.title}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.85,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {stat.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
        }
      </Grid>

      {/* Recent Companies */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: 2,
                  p: 1,
                }}
              >
                <ScheduleIcon sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Recent Companies
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Latest registered companies
                </Typography>
              </Box>
            </Box>

            {loading ? (
              <Grid container spacing={2}>
                {[1, 2, 3].map(i => (
                  <Grid item xs={12} sm={6} lg={3} key={i} sx={{ display: 'flex' }}>
                    <Skeleton height={100} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))}
              </Grid>
            ) : stats?.recentCompanies?.length > 0 ? (
              <Grid container spacing={2}>
                {stats.recentCompanies.map((company, i) => (
                  <Grid item xs={12} sm={6} lg={3} key={i} sx={{ display: 'flex' }}>
                    <Box
                      onClick={() => navigate('/admin/companies')}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2.5,
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        height: 100,

                        '&:hover': {
                          bgcolor: 'rgba(102,126,234,0.08)',
                          borderColor: '#667eea',
                          transform: 'translateY(-6px) scale(1.02)',
                          boxShadow: '0 6px 16px rgba(102,126,234,0.2)',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: '#667eea',
                          width: 50,
                          height: 50,
                          fontWeight: 700,
                        }}
                      >
                        {company.name.charAt(0)}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {company.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {company.sector || 'Technology'} • {company.location || 'India'}
                        </Typography>
                      </Box>

                      <CheckIcon sx={{ color: '#43e97b' }} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={5}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No companies yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start by adding a company to begin placements 🚀
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}