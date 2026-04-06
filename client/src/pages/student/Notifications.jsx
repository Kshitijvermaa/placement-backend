import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { notificationService } from '../../services';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark all notifications as read');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Notifications</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`${unreadCount} unread`} color={unreadCount > 0 ? 'primary' : 'default'} />
          <Button variant="outlined" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        {notifications.length === 0 ? (
          <Typography color="text.secondary">No notifications yet.</Typography>
        ) : (
          notifications.map((notification, index) => (
            <Box key={notification.id}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} py={1.5}>
                <Box>
                  <Typography variant="body1">{notification.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.created_at).toLocaleString()}
                  </Typography>
                </Box>
                {!notification.is_read && (
                  <Button size="small" onClick={() => markAsRead(notification.id)}>
                    Mark read
                  </Button>
                )}
              </Box>
              {index < notifications.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </Paper>
    </Container>
  );
};

export default Notifications;
