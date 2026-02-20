/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-18
 * @description Página de gestão de pedidos do admin
 */

import { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Fade,
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  Cancel,
  ShoppingBag,
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
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.get<Order[]>('/orders/admin/orders');
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
      month: 'short',
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
          icon: <CheckCircle sx={{ fontSize: 18 }} />,
        };
      case 'PENDING':
        return {
          label: 'Pendente',
          color: 'warning' as const,
          icon: <Pending sx={{ fontSize: 18 }} />,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelado',
          color: 'error' as const,
          icon: <Cancel sx={{ fontSize: 18 }} />,
        };
      default:
        return {
          label: status,
          color: 'default' as const,
          icon: <ShoppingBag sx={{ fontSize: 18 }} />,
        };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Pedidos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualize e acompanhe todos os pedidos do sistema
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Evento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Quantidade</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order, index) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <TableRow
                    key={order.id}
                    sx={{
                      '&:hover': { bgcolor: '#fafafa' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {order.id.slice(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={600}>
                        {order.event.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {order.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={order.quantity}
                        size="small"
                        sx={{ bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={600} sx={{ color: 'secondary.main' }}>
                        {formatPrice(order.amountCents)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        color={statusConfig.color}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(order.createdAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

export default Orders;
