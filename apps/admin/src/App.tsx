/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-17
 * @description Layout principal do app admin com navegação e rotas
 */

import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './hooks/useAuth';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  Event,
  ShoppingBag,
  People,
  Logout,
  Menu as MenuIcon,
} from '@mui/icons-material';
import Login from './pages/Login';
import DashboardPage from './pages/Dashboard';
import Events from './pages/Events';
import Orders from './pages/Orders';
import Users from './pages/Users';
import { useState } from 'react';

const drawerWidth = 260;

function AppContent() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Eventos', icon: <Event />, path: '/eventos' },
    { text: 'Pedidos', icon: <ShoppingBag />, path: '/pedidos' },
    { text: 'Usuários', icon: <People />, path: '/usuarios' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: 'white',
          color: '#1a1a1a',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Painel Administrativo
          </Typography>
          <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="body2" fontWeight={600}>{user.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0',
            bgcolor: 'white',
          },
        }}
      >
        <Toolbar sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" fontWeight={700}>
            BilheteriaTech
          </Typography>
        </Toolbar>
        <Divider />
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/pedidos" element={<Orders />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
