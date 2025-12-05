'use client';

import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useCart } from "../../store/CartContext";
import { useRouter } from "next/navigation";
import { formatPrice, formatNumber } from "../../utils/formatPrice";

export default function CarritoPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart } = useCart();

  const [open, setOpen] = useState(false);

  const handleQuantityChange = (productId: string, delta: number) => {
    const item = cart.find((p) => p._id === productId);
    if (!item) return;
    const newQty = Math.max(1, Math.min(item.stock, item.cantidad + delta));
    updateQuantity(productId, newQty);
  };

  const totalProductos = cart.reduce((acc, p) => acc + p.cantidad, 0);

  // Agrupar subtotales por moneda
  const subtotalesPorMoneda = cart.reduce((acc, p) => {
    const moneda = p.moneda;
    if (!acc[moneda]) {
      acc[moneda] = 0;
    }
    acc[moneda] += p.precio * p.cantidad;
    return acc;
  }, {} as Record<string, number>);

  
  const handleComprar = () => {
    if (cart.length === 0) return;
    setOpen(true);
  };

  
  const goToCheckout = () => {
    setOpen(false);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-12" style={{ backgroundColor: "#EDEDED" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: "bold",
              color: "primary.main",
              fontSize: { xs: 24, sm: 32 },
            }}
          >
            Mi carrito
          </Typography>

          {cart.length === 0 ? (
            <Typography variant="body1">Tu carrito está vacío.</Typography>
          ) : (
            <>
              {cart.map((product) => (
                <Box
                  key={product._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    gap: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={product.fotos?.[0] || "/placeholder.jpg"}
                    alt={product.titulo}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      objectFit: "cover",
                    }}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {product.titulo}
                    </Typography>
                    <Typography sx={{ color: "#555", fontSize: 14 }}>
                      {product.descripcion}
                    </Typography>

                    <Typography sx={{ mt: 1, fontWeight: 500 }}>
                      {formatPrice(product.precio, product.moneda)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      onClick={() => handleQuantityChange(product._id, -1)}
                      sx={{ color: "#333" }}
                    >
                      <Remove />
                    </IconButton>

                    <Typography>{product.cantidad}</Typography>

                    <IconButton
                      onClick={() => handleQuantityChange(product._id, 1)}
                      sx={{ color: "#333" }}
                    >
                      <Add />
                    </IconButton>
                  </Box>

                  <Typography
                    sx={{
                      width: 120,
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    {formatPrice(product.precio * product.cantidad, product.moneda)}
                  </Typography>

                  <IconButton
                    onClick={() => removeFromCart(product._id)}
                    sx={{ color: "#d32f2f" }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                <Box sx={{ minWidth: 300 }}>
                  <Typography sx={{ mb: 2, fontWeight: 600 }}>
                    Resumen ({totalProductos} productos)
                  </Typography>

                  {Object.entries(subtotalesPorMoneda).map(([moneda, subtotal]) => (
                    <Typography key={moneda} sx={{ mb: 1 }}>
                      Subtotal: {formatPrice(subtotal, moneda)}
                    </Typography>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  {Object.entries(subtotalesPorMoneda).map(([moneda, total]) => (
                    <Typography key={moneda} sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>
                      Total: {formatPrice(total, moneda)}
                    </Typography>
                  ))}

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleComprar}
                  >
                    Comprar
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Container>
      </main>

      <Footer />

      {/*MODAL DE CONFIRMACIÓN*/}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            backgroundColor: "#fafafa",
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontSize: 22, textAlign: "center" }}
        >
          Confirmar compra
        </DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          <Typography sx={{ mb: 2, textAlign: "center" }}>
            Estás por comprar los siguientes productos:
          </Typography>

          <List>
            {cart.map((item) => (
              <ListItem
                key={item._id}
                sx={{
                  backgroundColor: "white",
                  borderRadius: 2,
                  mb: 1,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                <ListItemText
                  primary={item.titulo}
                  secondary={`Cantidad: ${item.cantidad}`}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: "right" }}>
            {Object.entries(subtotalesPorMoneda).map(([moneda, total]) => (
              <Typography key={moneda} sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
                Total: {formatPrice(total, moneda)}
              </Typography>
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{
          backgroundColor: "#d32f2f",
          color: "white",
          "&:hover": {
            backgroundColor: "#b71c1c",
          },
          }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={goToCheckout}>
            Ir a checkout
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}