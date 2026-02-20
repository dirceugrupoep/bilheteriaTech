/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-18
 * @description Página de gestão de eventos do admin
 */

import { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Fade,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Event as EventIcon,
  AccessTime,
  AttachMoney,
} from '@mui/icons-material';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  priceCents: number;
  totalTickets: number;
}

function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    priceCents: '',
    totalTickets: '',
  });

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

  const handleOpenDialog = () => {
    setEditingEvent(null);
    setFormData({ title: '', description: '', date: '', priceCents: '', totalTickets: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
    setFormData({ title: '', description: '', date: '', priceCents: '', totalTickets: '' });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: new Date(event.date).toISOString().slice(0, 16),
      priceCents: event.priceCents.toString(),
      totalTickets: event.totalTickets.toString(),
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingEvent) {
        await api.put(`/admin/events/${editingEvent.id}`, {
          title: formData.title,
          description: formData.description || null,
          date: new Date(formData.date).toISOString(),
          priceCents: parseInt(formData.priceCents),
          totalTickets: parseInt(formData.totalTickets),
        });
      } else {
        await api.post('/admin/events', {
          title: formData.title,
          description: formData.description || null,
          date: new Date(formData.date).toISOString(),
          priceCents: parseInt(formData.priceCents),
          totalTickets: parseInt(formData.totalTickets),
        });
      }
      handleCloseDialog();
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar evento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este evento?')) return;
    try {
      await api.delete(`/admin/events/${id}`);
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar evento');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Eventos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Novo Evento
        </Button>
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
                <TableCell sx={{ fontWeight: 600 }}>Título</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Preço</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Tickets</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow
                  key={event.id}
                  sx={{
                    '&:hover': { bgcolor: '#fafafa' },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {event.title}
                      </Typography>
                      {event.description && (
                        <Typography variant="caption" color="text.secondary">
                          {event.description.slice(0, 50)}...
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{formatDate(event.date)}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={600} sx={{ color: 'secondary.main' }}>
                      {formatPrice(event.priceCents)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={event.totalTickets}
                      size="small"
                      sx={{ bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleEdit(event)}
                      sx={{ color: 'primary.main' }}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(event.id)}
                      sx={{ color: 'error.main' }}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Editar Evento' : 'Novo Evento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Título"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              label="Data e Hora"
              type="datetime-local"
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Preço (centavos)"
              type="number"
              fullWidth
              value={formData.priceCents}
              onChange={(e) => setFormData({ ...formData, priceCents: e.target.value })}
              required
              InputProps={{
                startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              label="Total de Tickets"
              type="number"
              fullWidth
              value={formData.totalTickets}
              onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
              required
              InputProps={{
                startAdornment: <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Events;
