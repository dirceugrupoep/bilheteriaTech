/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-16
 * @description Página que exibe todos os pedidos de ingressos realizados pelo cliente logado, com status e detalhes de cada pedido.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Fade,
} from '@mui/material';
import {
  ConfirmationNumber,
  Event,
  AccessTime,
  AttachMoney,
  CheckCircle,
  Pending,
  Cancel,
} from '@mui/icons-material';

interface Order {
  id: string;
  quantity: number;
  amountCents: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
  event: {
    id: string;
    title: string;
    date: string;
  };
  payments: Array<{
    id: string;
    status: string;
  }>;
}

function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.get<Order[]>('/orders/me/orders');
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return {
          label: 'Pago',
          color: 'success' as const,
          icon: <CheckCircle />,
        };
      case 'PENDING':
        return {
          label: 'Pendente',
          color: 'warning' as const,
          icon: <Pending />,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelado',
          color: 'error' as const,
          icon: <Cancel />,
        };
      default:
        return {
          label: status,
          color: 'default' as const,
          icon: <ConfirmationNumber />,
        };
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Carregando pedidos...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Meus Pedidos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Acompanhe todos os seus pedidos de ingressos
        </Typography>
      </Box>

      {orders.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            textAlign: 'center',
            py: 8,
          }}
        >
          <ConfirmationNumber sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Você ainda não fez nenhum pedido
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Explore nossos eventos e garanta seus ingressos
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            return (
              <Grid item xs={12} key={order.id}>
                <Fade in timeout={300 + index * 100}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Box>
                          <Typography variant="h5" fontWeight={600} gutterBottom>
                            {order.event.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(order.event.date)}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          icon={statusConfig.icon}
                          label={statusConfig.label}
                          color={statusConfig.color}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            Quantidade
                          </Typography>
                          <Typography variant="h6" fontWeight={600}>
                            {order.quantity}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            Valor Total
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ color: 'secondary.main' }}
                          >
                            {formatPrice(order.amountCents)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            Data do Pedido
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatDate(order.createdAt)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            ID do Pedido
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              color: 'text.secondary',
                            }}
                          >
                            {order.id.slice(0, 8)}...
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}

export default MyOrders;
