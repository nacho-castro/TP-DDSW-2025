'use client';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import OrderRow from '@/components/OrderRow/OrderRow';
import Pagination from '@/components/Pagination/Pagination';
import { Typography, Box, Container, CircularProgress, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { withAuth } from '@/src/hocs/withAuth';
import { useCart } from '@/src/store/CartContext';

function MisPedidosPage() {
  const { getToken } = useAuth();
  const { addToCart } = useCart();
  const [currentPage, setCurrentPage] = useState(1);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 3;

  useEffect(() => {
    fetchPedidos(true);
    const intervalId = setInterval(() => {
      fetchPedidos(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchPedidos = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError('');
      const token = await getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/usuarios/pedidos`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPedidos(response.data);
    } catch (err: any) {
      console.error('Error fetching pedidos:', err);
      if (showLoading) setError(err.response?.data?.error || 'Error al cargar los pedidos');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const token = await getToken();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/pedidos/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchPedidos(true);
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      setError(err.response?.data?.error || 'Error al cancelar el pedido');
    }
  };

  const handleRepurchase = (orderId: string) => {
    const orderToRepurchase = pedidos.find((p) => p._id === orderId);

    if (!orderToRepurchase || !orderToRepurchase.items) return;

    orderToRepurchase.items.forEach((item: any) => {
      if (item.productoId) {
        const productToCart = {
          ...item.productoId,
          precio: item.precioUnitario,
          moneda: orderToRepurchase.moneda
        };

        addToCart(productToCart, item.cantidad);
      }
    });
  };

  const totalPages = Math.ceil(pedidos.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = pedidos.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main
        role="main"
        aria-label="Sección de pedidos"
        className="flex-grow py-12"
        style={{ backgroundColor: '#EDEDED' }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{ marginBottom: 4, fontWeight: 'bold', color: 'primary.main' }}
          >
            Mis Pedidos
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading && pedidos.length === 0 ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : pedidos.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary">
                No tienes pedidos aún
              </Typography>
            </Box>
          ) : (
            <>
              <Box role="region" aria-label="Listado de pedidos">
                {paginatedOrders.map((order) => (
                  <OrderRow
                    key={order._id}
                    orderId={order._id}
                    status={order.estado}
                    fechaCreacion={order.fechaCreacion}
                    deliveryAddress={`${order.direccionEntrega.calle} ${order.direccionEntrega.altura}, ${order.direccionEntrega.ciudad}`}
                    products={(order.items || []).map((item: any) => ({
                      name: item.productoId?.titulo || 'Producto',
                      imageUrl: item.productoId?.fotos?.[0],
                      quantity: item.cantidad
                    }))}
                    userType="buyer"
                    onCancel={handleCancelOrder}
                    onRepurchase={handleRepurchase}
                  />
                ))}
              </Box>

              {totalPages > 1 && (
                <Box sx={{ marginTop: 4 }} aria-label="Paginación de pedidos">
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

export default withAuth(MisPedidosPage);