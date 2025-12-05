'use client';
import React, { useState, useEffect } from 'react';
import OrderRow, { OrderStatus } from '@/components/OrderRow/OrderRow';
import Pagination from '@/components/Pagination/Pagination';
import { Typography, Box, Snackbar, Alert } from '@mui/material';
import axios from "axios";
import { useAuth } from '@clerk/nextjs';

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type Order = {
  orderId: string;
  status: OrderStatus;
  deliveryAddress: string;
  products: Product[];
};

export default function AdministrarPedidosView() {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [alerta, setAlerta] = useState({ open: false, tipo: "success", mensaje: "" });
  const pageSize = 4;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/vendedor`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setOrders(res.data);
      } catch (err: any) {
        console.error("Error al traer pedidos:", err.message);
      }
    };

    fetchOrders();

    const intervalId = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [getToken]);

  const totalPages = Math.ceil(orders.length / pageSize);
  const handlePageChange = (page: number) => setCurrentPage(page);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = orders.slice(startIndex, startIndex + pageSize);

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/${orderId}/confirmar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al confirmar pedido");
      }

      const data = await response.json();
      setOrders((prev) =>
        prev.map((o) => o.orderId === orderId ? { ...o, status: "CONFIRMADO" } : o)
      );
      setAlerta({
        open: true,
        tipo: "success",
        mensaje: `Pedido ${data.pedido} confirmado`,
      });
    } catch (err: any) {
      setAlerta({
        open: true,
        tipo: "error",
        mensaje: `Error: ${err.message}`,
      });
    }
  };

  const handleCancelOrderSeller = async (orderId: string) => {
    try {
      const token = await getToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      setOrders((prev) =>
        prev.map((o) => o.orderId === orderId ? { ...o, status: "CANCELADO" } : o)
      );
      setAlerta({
        open: true,
        tipo: "success",
        mensaje: `Pedido ${orderId} cancelado`,
      });
    } catch (err: any) {
      setAlerta({
        open: true,
        tipo: "error",
        mensaje: `Error: ${err.response?.data?.error || err.message}`,
      });
    }
  };

  const handleSendOrder = async (orderId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/${orderId}/enviado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al enviar pedido");
      }

      const data = await response.json();
      setOrders((prev) =>
        prev.map((o) => o.orderId === orderId ? { ...o, status: "ENVIADO" } : o)
      );
      setAlerta({
        open: true,
        tipo: "success",
        mensaje: `Pedido ${data.pedido} enviado`,
      });
    } catch (err: any) {
      setAlerta({
        open: true,
        tipo: "error",
        mensaje: `Error: ${err.message}`,
      });
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Pedidos de Clientes
      </Typography>

      <Box role="region" aria-label="Listado de pedidos del vendedor">
        {paginatedOrders.map((order: any) => (
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
            userType="seller"
            onConfirm={handleConfirmOrder}
            onSend={handleSendOrder}
            onCancelSeller={handleCancelOrderSeller}
            onCancel={() => {}}
            onRepurchase={() => {}}
          />
        ))}
      </Box>

      <Box sx={{ marginTop: 4 }} aria-label="Paginación de pedidos">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Box>

      <Snackbar
        open={alerta.open}
        autoHideDuration={4000}
        onClose={() => setAlerta((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={alerta.tipo === "error" ? "error" : "success"}
          variant="filled"
          onClose={() => setAlerta((prev) => ({ ...prev, open: false }))}
        >
          {alerta.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}