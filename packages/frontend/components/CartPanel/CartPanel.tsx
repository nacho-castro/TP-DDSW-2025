'use client';
import { Box, Typography, Popover, Button, IconButton, Fade, Grow } from '@mui/material';
import { useCart } from '../../src/store/CartContext';
import { formatPrice } from '../../src/utils/formatPrice';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';

interface CartPanelProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export default function CartPanel({ anchorEl, onClose }: CartPanelProps) {
  const open = Boolean(anchorEl);
  const { cart, removeFromCart } = useCart();
  const router = useRouter();

  const handleGoToCart = () => {
    router.push('/carrito');
    onClose();
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={Grow}
      transitionDuration={300}
      PaperProps={{
        sx: {
          overflow: 'visible',
          mt: 1,
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: -5,
            right: 13,
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
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Carrito de Compras
        </Typography>

        {cart.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            Tu carrito está vacío
          </Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {cart.map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    p: 1.5,
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'center',
                  }}
                >
                  <Box
                    component="img"
                    src={item.fotos?.[0] || '/placeholder.jpg'}
                    alt={item.titulo}
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: '6px',
                    }}
                  />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cantidad: {item.cantidad}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                      {formatPrice(item.precio * item.cantidad, item.moneda)}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => handleRemoveItem(item._id)}
                    sx={{ color: '#666' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleGoToCart}
              sx={{
                mt: 2,
                backgroundColor: '#ff9800',
                fontWeight: 600,
                ':hover': { backgroundColor: '#e68900' },
              }}
            >
              Ver carrito completo
            </Button>
          </>
        )}
      </Box>
    </Popover>
  );
}
