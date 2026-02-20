/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-18
 * @description Página de detalhes do evento com compra de ingressos
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api/client';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Fade,
} from '@mui/material';
import {
  Event,
  AccessTime,
  AttachMoney,
  ConfirmationNumber,
  ArrowBack,
  Add,
  Remove,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  priceCents: number;
  totalTickets: number;
}

function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await api.get<Event>(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar evento');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!event || !id) return;

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      const order = await api.post<{ id: string }>('/orders', {
        eventId: id,
        quantity,
      });

      await api.post('/payments/fake', {
        orderId: order.id,
        cardNumber: '4242424242424242',
        cardName: 'Teste',
        expMonth: 12,
        expYear: 2025,
        cvv: '123',
      });

      setSuccess('Pedido criado! Aguardando confirmação do pagamento...');

      setTimeout(() => {
        navigate('/meus-pedidos');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar compra');
    } finally {
      setProcessing(false);
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Carregando evento...
        </Typography>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Evento não encontrado</Alert>
      </Container>
    );
  }

  const totalPrice = event.priceCents * quantity;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack />}
          sx={{ color: 'text.secondary' }}
        >
          Voltar
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Fade in timeout={500}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Box
                sx={{
                  height: 300,
                  background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Event sx={{ fontSize: 120, color: 'white' }} />
              </Box>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  {event.title}
                </Typography>
                {event.description && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {event.description}
                  </Typography>
                )}
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Data e Hora
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatDate(event.date)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ConfirmationNumber color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Ingressos Disponíveis
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {event.totalTickets}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} md={4}>
          <Fade in timeout={700}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                position: 'sticky',
                top: 20,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Comprar Ingressos
                </Typography>
                {error && (
                  <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2, mt: 2 }}>
                    {success}
                  </Alert>
                )}

                <Box sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Quantidade
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      sx={{ border: '1px solid #e0e0e0' }}
                    >
                      <Remove />
                    </IconButton>
                    <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                      {quantity}
                    </Typography>
                    <IconButton
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      disabled={quantity >= 10}
                      sx={{ border: '1px solid #e0e0e0' }}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Preço unitário
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatPrice(event.priceCents)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Quantidade
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {quantity}x
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={700}>
                      Total
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{ color: 'secondary.main' }}
                    >
                      {formatPrice(totalPrice)}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handlePurchase}
                  disabled={processing}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    bgcolor: 'secondary.main',
                    '&:hover': { bgcolor: 'secondary.dark' },
                  }}
                >
                  {processing ? 'Processando...' : 'Comprar Ingressos'}
                </Button>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
}

export default EventDetail;
