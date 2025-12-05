'use client';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Pagination from '@/components/Pagination/Pagination';
import { Typography, Box, Container, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import NotificationCard from '@/components/NotificationCard/NotificationCard';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { withAuth } from '@/src/hocs/withAuth';

function NotificationsPage() {
    const { getToken } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const pageSize = 5;

    useEffect(() => {
        fetchNotifications(true);
        const intervalId = setInterval(() => {
            fetchNotifications(false);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchNotifications = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const token = await getToken();
            
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/usuarios/notificaciones`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            setNotifications(response.data);
        } catch (error) {
            console.error("Error cargando notificaciones", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleToggleRead = async (id: string) => {
        setNotifications(prev =>
            prev.map(n =>
                n._id === id ? { ...n, leida: !n.leida } : n
            )
        );

        try {
            const token = await getToken();
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/notificaciones/${id}/leidas`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Error actualizando lectura", error);
        }
    };

    const totalPages = Math.ceil(notifications.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedNotifs = notifications.slice(startIndex, startIndex + pageSize);

    return (
    <div className="min-h-screen flex flex-col">
        <Navbar />

        <main
        role="main"
        aria-label="Sección de notificaciones"
        className="flex-grow py-12"
        style={{ backgroundColor: '#EDEDED' }}
        >
        <Container maxWidth="lg">
            <Typography
            variant="h4"
            sx={{ marginBottom: 4, fontWeight: 'bold', color: 'primary.main' }}
            >
            Notificaciones{' '}
            <Box
                component="span"
                aria-live="polite"
                sx={{
                fontSize: '20px',
                fontWeight: 400,
                color: 'text.secondary',
                marginLeft: 1
                }}
            >
                (sin leer {notifications.filter(n => !n.leida).length})
            </Box>
            </Typography>

            {loading && notifications.length === 0 ? (
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box role="region" aria-label="Listado de notificaciones">
                    {paginatedNotifs.map((notif) => (
                        <NotificationCard
                        key={notif._id}
                        notification={notif}
                        onReadToggle={handleToggleRead}
                        />
                    ))}
                    </Box>

                    {notifications.length > 0 && (
                        <Box sx={{ marginTop: 4 }} aria-label="Paginación de notificaciones">
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
        </main>

        <Footer />
    </div>
    );
}

export default withAuth(NotificationsPage);
