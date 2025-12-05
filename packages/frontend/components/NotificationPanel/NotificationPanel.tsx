'use client';
import { useState, useEffect } from 'react';
import { Typography, Box, Container, Popover } from '@mui/material';
import Pagination from '@/components/Pagination/Pagination';
import NotificationCard from '@/components/NotificationCard/NotificationCard';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';

interface NotificationPanelProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationPanel({ anchorEl, onClose, onUnreadCountChange }: NotificationPanelProps) {
  const open = Boolean(anchorEl);
  const { getToken } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notificaciones paginadas (cuando se abre el panel)
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        console.error('No se pudo obtener el token de autenticación');
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/usuarios/notificaciones/no-leidas`;
      console.log('Fetching notifications from:', url);
      console.log('With params:', { page: currentPage, limit: pageSize });

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          limit: pageSize,
        },
      });

      console.log('Response:', response.data);
      setNotifications(response.data.data || []);
      setTotalPages(response.data.totalPaginas || 1);
      const total = response.data.totalColecciones || response.data.total || 0;
      setUnreadCount(total);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Request URL:', error.config?.url);

        // Si el usuario no ha completado el registro, redirigir
        if (error.response?.data?.requiresRegistration) {
          window.location.href = '/completar-registro';
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch notificaciones cuando se abre el panel
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, currentPage]);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleToggleRead = async (id: string) => {
    try {
      const token = await getToken();

      if (!token) {
        console.error('No se pudo obtener el token de autenticación');
        return;
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/notificaciones/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualizar localmente
      setNotifications(prev =>
        prev.filter(n => n._id !== id)
      );

      // Actualizar el conteo en el navbar
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      if (onUnreadCountChange) {
        onUnreadCountChange(newCount);
      }
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  return (
        <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
            sx: {
            overflow: 'visible',
            mt: 1, // 👈 separa un poquito el popup del icono
            '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -5,          // 👈 mueve la flecha justo encima del borde
                right: 13,        // 👈 ajustá según quieras que apunte al ícono
                width: 10,
                height: 10,
                bgcolor: '#EDEDED',
                transform: 'rotate(45deg)',
                zIndex: 0,
            },
            },
        }}
        >
      <Box sx={{ width: 400, maxHeight: 500, overflowY: 'auto', p: 2, backgroundColor: '#EDEDED' }}>
        <Container maxWidth="sm">
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Notificaciones{' '}
            <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary', ml: 1 }}>
              (sin leer {unreadCount})
            </Box>
          </Typography>

          {loading ? (
            <Typography>Cargando...</Typography>
          ) : notifications.length === 0 ? (
            <Typography>No tienes notificaciones sin leer</Typography>
          ) : (
            <>
              {notifications.map((notif) => (
                <NotificationCard
                  key={notif._id}
                  notification={notif}
                  onReadToggle={handleToggleRead}
                />
              ))}

              {totalPages > 1 && (
                <Box sx={{ mt: 2 }}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </Popover>
  );
}