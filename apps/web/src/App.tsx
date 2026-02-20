/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-17
 * @description Layout principal do app web com navegação e rotas
 */

import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { AppBar, Toolbar, Button, Container, Box, Typography, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import { Event, Person, ShoppingBag, Logout } from '@mui/icons-material';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import { useState } from 'react';

function AppContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          borderBottom: '1px solid #e0e0e0',
          color: '#1a1a1a'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Event sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
              <Typography
                variant="h5"
                component={Link}
                to="/"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                BilheteriaTech
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user ? (
                <>
                  <Button
                    component={Link}
                    to="/meus-pedidos"
                    startIcon={<ShoppingBag />}
                    sx={{
                      color: '#666',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    Meus Pedidos
                  </Button>
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <Person />
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
                    <MenuItem onClick={handleLogout}>
                      <Logout sx={{ mr: 1 }} /> Sair
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{
                      color: '#666',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    Entrar
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      borderRadius: 2
                    }}
                  >
                    Cadastrar
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/eventos/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/meus-pedidos" element={<MyOrders />} />
        </Routes>
      </Box>

      <Box
        component="footer"
        sx={{
          bgcolor: 'white',
          borderTop: '1px solid #e0e0e0',
          py: 3,
          mt: 'auto'
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2026 BilheteriaTech - Todos os direitos reservados
          </Typography>
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
