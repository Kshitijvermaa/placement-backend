import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton,
  Avatar, Menu, MenuItem, Divider, Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { authService } from '../services';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
  { label: 'Companies', path: '/admin/companies', icon: <BusinessIcon /> },
  { label: 'Offers', path: '/admin/offers', icon: <WorkIcon /> },
  { label: 'Students', path: '/admin/students', icon: <PeopleIcon /> },
  { label: 'Catalog', path: '/admin/catalog', icon: <CategoryIcon /> },
  { label: 'Recruitment', path: '/admin/recruitment', icon: <TimelineIcon /> },
  { label: 'Analytics', path: '/admin/analytics', icon: <AssessmentIcon /> },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        p: 2.5, background: 'linear-gradient(135deg, #0f4c81 0%, #1565c0 100%)',
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <AdminIcon sx={{ color: 'white', fontSize: 28 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
            Placement Portal
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Admin Panel
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
            {navItems.find(n => isActive(n.path))?.label || 'Admin'}
          </Typography>
          <Tooltip title="Account">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ bgcolor: '#0f4c81', width: 34, height: 34, fontSize: 14 }}>A</Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
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
