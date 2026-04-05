import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { companyService, adminService } from '../../services';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeOffers: 0,
    totalStudents: 0,
    totalApplications: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [companies, students] = await Promise.all([
        companyService.getAll(),
        adminService.getStudents(),
      ]);

      setStats({
        totalCompanies: companies.length,
        activeOffers: 0, // Would need to fetch offers
        totalStudents: students.length,
        totalApplications: 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Active Offers',
      value: stats.activeOffers,
      icon: <WorkIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'Registered Students',
      value: stats.totalStudents,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage placements and internships
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
              • Add and manage companies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Post new internship/placement offers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Review and manage student applications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Schedule interviews for shortlisted candidates
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
