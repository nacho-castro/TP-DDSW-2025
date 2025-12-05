'use client';
import React from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';

export type OrderStatus = 'ENVIADO' | 'CANCELADO' | 'PENDIENTE' | 'CONFIRMADO';

export interface Product {
  name: string;
  imageUrl?: string;
  size?: string;
  quantity: number;
}

// --- INTERFAZ MODIFICADA ---
// Añadimos las props opcionales para el VENDEDOR
interface OrderRowProps {
  orderId: string;
  status: OrderStatus;
  deliveryAddress: string;
  fechaCreacion: string; 
  products: Product[];
  userType?: 'buyer' | 'seller';

  // Props del Comprador (ya existían)
  onCancel?: (orderId: string) => void;
  onRepurchase?: (orderId: string) => void;

  // Props del Vendedor (NUEVAS)
  onConfirm?: (orderId: string) => void;
  onSend?: (orderId: string) => void;
  onCancelSeller?: (orderId: string) => void;
}

const OrderRow: React.FC<OrderRowProps> = ({
  orderId,
  status,
  deliveryAddress,
  fechaCreacion,
  products,
  userType = 'buyer', // Por defecto es 'buyer' si no se especifica
  onCancel,
  onRepurchase,
  onConfirm,
  onSend,
  onCancelSeller,
}) => {
  // Determina el color del chip según el estado
  const getStatusStyles = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case 'ENVIADO':
        return { bg: '#d4edda', color: '#155724' }; // Verde
      case 'CANCELADO':
        return { bg: '#f8d7da', color: '#721c24' }; // Rojo
      case 'PENDIENTE':
        return { bg: '#fff3cd', color: '#856404' }; // Amarillo
      case 'CONFIRMADO':
        return { bg: '#cce5ff', color: '#004085' }; // Azul
      default:
        return { bg: '#eeeeee', color: '#333' };
    }
  };

  const statusStyles = getStatusStyles(status);

  // --- LÓGICA DE BOTONES DEL VENDEDOR ---
  const renderSellerButtons = () => {
    const isPending = status === 'PENDIENTE';
    const isConfirmed = status === 'CONFIRMADO';
    const isFinished = status === 'ENVIADO' || status === 'CANCELADO';

    // Estilo de los botones del admin (naranja)
    const adminButtonSx = (disabled: boolean) => ({
      backgroundColor: disabled ? '#B0B0B0' : '#FB9635',
      color: '#FFFFFF',
      textTransform: 'none',
      fontSize: '13px',
      fontWeight: 'bold',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '3px',
      boxShadow: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      '&:hover': {
        backgroundColor: disabled ? '#B0B0B0' : '#e8852a',
        boxShadow: 'none',
      },
    });

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0, minWidth: '140px' }}>
        <Button
          variant="contained"
          onClick={() => onConfirm?.(orderId)}
          disabled={!isPending}
          sx={adminButtonSx(!isPending)}
        >
          Confirmar
        </Button>
        <Button
          variant="contained"
          onClick={() => onSend?.(orderId)}
          disabled={!isConfirmed}
          sx={adminButtonSx(!isConfirmed)}
        >
          Enviar
        </Button>
        <Button
          variant="contained"
          onClick={() => onCancelSeller?.(orderId)}
          disabled={isFinished}
          sx={adminButtonSx(isFinished)}
        >
          Cancelar
        </Button>
      </Box>
    );
  };

  // --- LÓGICA DE BOTONES DEL COMPRADOR ---
  const renderBuyerButtons = () => {
    const isCancelDisabled = status === 'ENVIADO' || status === 'CANCELADO';
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0, minWidth: '140px' }}>
        <Button
          variant="contained"
          onClick={() => onCancel?.(orderId)}
          disabled={isCancelDisabled}
          sx={{
            backgroundColor: isCancelDisabled ? '#B0B0B0' : '#E53935',
            color: '#FFFFFF',
            textTransform: 'none',
            cursor: isCancelDisabled ? 'not-allowed' : 'pointer',
            '&:hover': {
              backgroundColor: isCancelDisabled ? '#B0B0B0' : '#D32F2F',
            },
          }}
        >
          Cancelar pedido
        </Button>
        <Button
          variant="contained"
          onClick={() => onRepurchase?.(orderId)}
          size="small"
          sx={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 'bold',
            textTransform: 'none',
            backgroundColor: '#FB9635',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '3px',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#e8852a',
              boxShadow: 'none',
            },
          }}
        >
          Volver a Comprar
        </Button>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 1,
        padding: 2,
        marginBottom: 2,
        boxShadow: 1,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' }, // Apilable en móvil
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        {/* ENCABEZADO (Estado, ID y Dirección) */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', marginBottom: 2, gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={status}
            size="small"
            sx={{
              backgroundColor: statusStyles.bg,
              color: statusStyles.color,
              fontSize: '13px',
              fontWeight: 500,
              height: 'auto',
              padding: '2px 6px',
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontSize: '13px',
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            Pedido nro: {orderId} • {deliveryAddress} • {new Date(fechaCreacion).toLocaleDateString('es-AR')}
          </Typography>
        </Box>

        {/* LISTA DE PRODUCTOS DENTRO DEL PEDIDO */}
        {products.map((product, index) => (
          <Box
            key={index}
            sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: 1.5 }}
          >
            <img
              src={product.imageUrl || 'https://via.placeholder.com/70x70?text=Prod'}
              alt={product.name}
              style={{
                width: '70px',
                height: '70px',
                objectFit: 'cover',
                borderRadius: '4px',
                marginRight: '16px',
                flexShrink: 0,
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'text.primary',
                  margin: 0,
                }}
              >
                {product.name} {product.size && `talle ${product.size}`}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '13px',
                  color: 'text.secondary',
                  marginTop: '2px',
                }}
              >
                {product.quantity} unidad{product.quantity > 1 ? 'es' : ''}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* --- RENDERIZADO CONDICIONAL DE BOTONES --- */}
      <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
        {userType === 'seller' ? renderSellerButtons() : renderBuyerButtons()}
      </Box>
    </Box>
  );
};

export default OrderRow;
