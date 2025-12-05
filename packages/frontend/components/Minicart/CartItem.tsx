'use client';
import React from 'react';
import { Box, Divider, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { formatPrice, formatNumber } from '../../src/utils/formatPrice';

export type ProductStatus = 'Disponible' | 'Agotado';

export interface Product {
  _id: string;
  vendedor: string;
  titulo: string;
  descripcion: string;
  categorias?: string[];
  precio: number;
  moneda: string;
  stock: number;
  totalVendido: number;
  fotos?: string[];
}

interface CartItemProps {
  orderId: string;
  status: ProductStatus;
  deliveryAddress: string;
  products: Product[];
  quantity: number;
  available: boolean;
  onRemove?: () => void;
}

const CartItem: React.FC<CartItemProps> = ({
  products,
  deliveryAddress,
  quantity,
  available,
  onRemove,
}) => {
  // Calcular subtotal
  const subtotal = products.reduce((acc, product) => acc + product.precio * quantity, 0);

  return (
    <Box
      sx={{
        borderRadius: 2,
        p: 2,
        mb: 3,
        backgroundColor: '#fff',
        boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>Producto #{products[0]?._id || ''}</Typography>
        <IconButton onClick={onRemove}>
          <DeleteIcon sx={{ color: '#888' }} />
        </IconButton>
      </Box>

      {/* Dirección */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <LocalShippingIcon sx={{ fontSize: 20, color: '#777' }} />
        <Typography variant="body2" color="text.secondary">
          {deliveryAddress}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Lista de productos */}
      {products.map((product) => (
        <Box
          key={product._id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          {/* Imagen y descripción */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src={product.fotos?.[0] || 'https://via.placeholder.com/80?text=Sin+imagen'}
              alt={product.titulo}
              style={{
                width: 70,
                height: 70,
                borderRadius: 6,
                objectFit: 'cover',
              }}
            />
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{product.titulo}</Typography>
              <Typography variant="body2" color="text.secondary">
                Stock: {product.stock}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: available ? '#388E3C' : '#D32F2F', fontWeight: 500 }}
              >
                {available ? 'Disponible' : 'Agotado'}
              </Typography>
            </Box>
          </Box>

          {/* Cantidad y precio */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary"  sx={{fontSize: '1.1rem' }}>
              x{quantity} un.
            </Typography>
            <Typography sx={{ fontWeight: 500, fontSize: '1.2rem' }}>
              {formatPrice(product.precio, product.moneda)}
            </Typography>
          </Box>
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* Subtotal */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 600, fontSize: '1.4rem' }}>
          Subtotal: ${formatNumber(subtotal)}
        </Typography>
      </Box>
    </Box>
  );
};

export default CartItem;
