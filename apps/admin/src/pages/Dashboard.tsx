/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-18
 * @description Página de dashboard do admin com estatísticas gerais
 */

import { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Event,
  ShoppingBag,
  People,
  PendingActions,
  TrendingUp,
} from '@mui/icons-material';

function Dashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [events, orders, users] = await Promise.all([
        api.get<unknown[]>('/events'),
        api.get<Array<{ status: string }>>('/orders/admin/orders'),
        api.get<unknown[]>('/admin/users'),
      ]);

      setStats({
        totalEvents: events.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Eventos',
      value: stats.totalEvents,
      icon: <Event sx={{ fontSize: 40 }} />,
      color: '#42a5f5',
      bgGradient: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
    },
    {
      title: 'Pedidos',
      value: stats.totalOrders,
      icon: <ShoppingBag sx={{ fontSize: 40 }} />,
      color: '#ffc107',
      bgGradient: 'linear-gradient(135deg, #ffc107 0%, #ffa000 100%)',
    },
    {
      title: 'Usuários',
      value: stats.totalUsers,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#66bb6a',
      bgGradient: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
    },
    {
      title: 'Pendentes',
      value: stats.pendingOrders,
      icon: <PendingActions sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      bgGradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Fade in timeout={300 + index * 100}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        background: stat.bgGradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;
