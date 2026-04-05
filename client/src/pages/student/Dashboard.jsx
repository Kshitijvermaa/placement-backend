import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import {
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { applicationService, interviewService } from '../../services';

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    shortlisted: 0,
    selected: 0,
    upcomingInterviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [applications, interviews] = await Promise.all([
        applicationService.getMyApplications(),
        interviewService.getForStudent(),
      ]);

      const pending = applications.filter(app => app.status === 'pending').length;
      const shortlisted = applications.filter(app => app.status === 'shortlisted').length;
      const selected = applications.filter(app => app.status === 'selected').length;
      
      const upcoming = interviews.filter(
        interview => new Date(interview.scheduled_at) > new Date()
      ).length;

      setStats({
        totalApplications: applications.length,
        pending,
        shortlisted,
        selected,
        upcomingInterviews: upcoming,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <WorkIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
    {
      title: 'Shortlisted',
      value: stats.shortlisted,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'Upcoming Interviews',
      value: stats.upcomingInterviews,
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome to your placement portal dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Browse available offers and apply
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Update your profile and upload resume
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Track your application status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • View scheduled interviews
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;
