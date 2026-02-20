/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-18
 * @description Página inicial pública com listagem de eventos
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Fade,
} from '@mui/material';
import { Event, AccessTime, AttachMoney } from '@mui/icons-material';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  priceCents: number;
  totalTickets: number;
}

function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.get<Event[]>('/events');
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Carregando eventos...
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
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: 'text.primary',
          }}
        >
          Eventos Disponíveis
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Descubra os melhores eventos e garanta seu ingresso
        </Typography>
      </Box>

      {events.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Event sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum evento disponível no momento
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {events.map((event, index) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Fade in timeout={300 + index * 100}>
                <Card
                  component={Link}
                  to={`/eventos/${event.id}`}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    transition: 'border-color 0.2s ease',
                    '&:hover': {
                      borderColor: '#cbd5e1',
                    },
                  }}
                >
                  <CardMedia
                    sx={{
                      height: 200,
                      background: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Event sx={{ fontSize: 56, color: '#6b7280' }} />
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: 'text.primary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {event.title}
                    </Typography>
                    {event.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {event.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.date)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pt: 2,
                        borderTop: '1px solid #e0e0e0',
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          A partir de
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            lineHeight: 1,
                          }}
                        >
                          {formatPrice(event.priceCents)}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${event.totalTickets} ingressos`}
                        size="small"
                        sx={{
                          bgcolor: '#f3f4f6',
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Home;
