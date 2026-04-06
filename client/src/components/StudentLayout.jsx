import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton,
  Avatar, Menu, MenuItem, Divider, Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { authService } from '../services';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', path: '/student', icon: <DashboardIcon /> },
  { label: 'Browse Offers', path: '/student/offers', icon: <WorkIcon /> },
  { label: 'My Applications', path: '/student/applications', icon: <AssignmentIcon /> },
  { label: 'Interviews', path: '/student/interviews', icon: <EventIcon /> },
  { label: 'Notifications', path: '/student/notifications', icon: <NotificationsIcon /> },
  { label: 'My Profile', path: '/student/profile', icon: <PersonIcon /> },
];

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/student') return location.pathname === '/student';
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        p: 2.5, background: 'linear-gradient(135deg, #0f4c81 0%, #1565c0 100%)',
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <SchoolIcon sx={{ color: 'white', fontSize: 28 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
            Placement Portal
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Student Dashboard
          </Typography>
        </Box>
      </Box>

      <List sx={{ flex: 1, pt: 1.5, px: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'rgba(15,76,129,0.10)',
                  color: '#0f4c81',
                  '& .MuiListItemIcon-root': { color: '#0f4c81' },
                },
                '&:hover': { bgcolor: 'rgba(15,76,129,0.06)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#7a8ba4' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive(item.path) ? 700 : 500, fontSize: 14 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Placement Management System
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={0} sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        bgcolor: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        color: 'text.primary',
      }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, color: '#0f4c81', fontWeight: 700 }}>
            {navItems.find(n => isActive(n.path))?.label || 'Dashboard'}
          </Typography>
          <Tooltip title="Account">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ bgcolor: '#e8621a', width: 34, height: 34, fontSize: 14 }}>S</Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { navigate('/student/profile'); setAnchorEl(null); }}>
              <PersonIcon sx={{ mr: 1, fontSize: 18 }} /> Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1, fontSize: 18 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid rgba(0,0,0,0.08)' } }}
          open>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{
        flex: 1, p: 3, mt: 8,
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
      }}>
        <Outlet />
      </Box>
    </Box>
  );
}
