/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-18
 * @description Página de listagem de pedidos do usuário
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ConfirmationNumber,
  AccessTime,
  CheckCircle,
  Pending,
  Cancel,
  CreditCard,
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

interface CardFormData {
  cardNumber: string;
  cardName: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}

function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<CardFormData>({
    cardNumber: '',
    cardName: '',
    expMonth: '',
    expYear: '',
    cvv: '',
  });

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

  const openPayModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCardError(null);
    setCardForm({
      cardNumber: '',
      cardName: '',
      expMonth: '',
      expYear: '',
      cvv: '',
    });
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    if (!processingOrderId) {
      setPayModalOpen(false);
      setSelectedOrderId(null);
      setCardError(null);
    }
  };

  const handlePayOrder = async () => {
    if (!selectedOrderId) return;

    const expMonth = Number(cardForm.expMonth);
    const expYear = Number(cardForm.expYear);
    const normalizedCardNumber = cardForm.cardNumber.replace(/\s+/g, '');

    if (!normalizedCardNumber || normalizedCardNumber.length < 13 || normalizedCardNumber.length > 19) {
      setCardError('Número do cartão inválido');
      return;
    }
    if (!cardForm.cardName || cardForm.cardName.trim().length < 2) {
      setCardError('Nome impresso no cartão inválido');
      return;
    }
    if (!expMonth || expMonth < 1 || expMonth > 12) {
      setCardError('Mês de validade inválido');
      return;
    }
    if (!expYear || expYear < new Date().getFullYear()) {
      setCardError('Ano de validade inválido');
      return;
    }
    if (!/^\d{3,4}$/.test(cardForm.cvv)) {
      setCardError('CVV deve ter 3 ou 4 dígitos');
      return;
    }

    try {
      setProcessingOrderId(selectedOrderId);
      setError(null);
      setSuccess(null);
      setCardError(null);

      await api.post('/payments/fake', {
        orderId: selectedOrderId,
        cardNumber: normalizedCardNumber,
        cardName: cardForm.cardName.trim(),
        expMonth,
        expYear,
        cvv: cardForm.cvv,
      });

      setSuccess('Pagamento iniciado com sucesso! Aguarde alguns segundos para confirmação.');
      setPayModalOpen(false);
      await loadOrders();
      setTimeout(() => {
        loadOrders();
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar pagamento';
      setCardError(message);
      setError(message);
    } finally {
      setProcessingOrderId(null);
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
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
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
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            icon={statusConfig.icon}
                            label={statusConfig.label}
                            color={statusConfig.color}
                            sx={{ fontWeight: 600 }}
                          />
                          {order.status === 'PENDING' && (
                            <Button
                              variant="contained"
                              color="secondary"
                              startIcon={<CreditCard />}
                              onClick={() => openPayModal(order.id)}
                              disabled={processingOrderId === order.id}
                              sx={{ fontWeight: 600, borderRadius: 2 }}
                            >
                              {processingOrderId === order.id ? 'Processando...' : 'Pagar agora'}
                            </Button>
                          )}
                        </Box>
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

      <Dialog open={payModalOpen} onClose={closePayModal} maxWidth="xs" fullWidth>
        <DialogTitle>Pagar pedido</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            {cardError && <Alert severity="error">{cardError}</Alert>}
            <TextField
              label="Número do cartão"
              placeholder="0000 0000 0000 0000"
              value={cardForm.cardNumber}
              onChange={(e) => setCardForm((prev) => ({ ...prev, cardNumber: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Nome no cartão"
              placeholder="Como está no cartão"
              value={cardForm.cardName}
              onChange={(e) => setCardForm((prev) => ({ ...prev, cardName: e.target.value }))}
              fullWidth
            />
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr 1fr' }}>
              <TextField
                label="Mês"
                placeholder="12"
                value={cardForm.expMonth}
                onChange={(e) => setCardForm((prev) => ({ ...prev, expMonth: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Ano"
                placeholder="2030"
                value={cardForm.expYear}
                onChange={(e) => setCardForm((prev) => ({ ...prev, expYear: e.target.value }))}
                fullWidth
              />
              <TextField
                label="CVV"
                placeholder="123"
                value={cardForm.cvv}
                onChange={(e) => setCardForm((prev) => ({ ...prev, cvv: e.target.value }))}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closePayModal} disabled={!!processingOrderId}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handlePayOrder}
            disabled={!!processingOrderId}
          >
            {processingOrderId ? 'Processando...' : 'Confirmar pagamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyOrders;
