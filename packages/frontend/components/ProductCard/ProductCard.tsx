'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardMedia,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useCart } from "../../src/store/CartContext";
import { useCartPanel } from "../../src/store/CartPanelContext";
import { formatPrice } from "../../src/utils/formatPrice";

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

interface Props {
  product: Product;
  userType?: 'buyer' | 'seller';
  onEdit?: () => void;
  onDelete?: () => void;
  onAddToCart?: () => void;
}

const ProductCard: React.FC<Props> = ({
  product,
  userType = 'buyer',
  onEdit,
  onDelete,
  onAddToCart
}) => {

  const { addToCart } = useCart();
  const { openCartPanel } = useCartPanel();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const increase = () => {
    if (quantity < product.stock) setQuantity((q) => q + 1);
  };

  const decrease = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, quantity);

    // Abrir el CartPanel automáticamente
    openCartPanel();

    // Llamar al callback si existe
    if (onAddToCart) {
      onAddToCart();
    }

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  return (
    <>
      <Card
        sx={{
          width: 260,
          borderRadius: 3,
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          ":hover": {
            transform: "scale(1.03)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
          },
        }}
      >
      <CardMedia
        component="img"
        image={product.fotos?.[0] || "/placeholder.jpg"}
        alt={product.titulo}
        sx={{
          width: "100%",
          borderRadius: 2,
          objectFit: "cover",
          height: 200,
        }}
      />

      <Typography sx={{ mt: 2, fontWeight: 600, fontSize: "1.1rem", textAlign: "center" }}>
        {product.titulo}
      </Typography>

      <Typography sx={{ color: "#444", mt: 0.5, fontWeight: 500 }}>
        {formatPrice(product.precio, product.moneda)}
      </Typography>

      {userType === "seller" && (
        <Typography sx={{ color: "#666", mt: 0.5, fontSize: "0.9rem" }}>
          Stock: {product.stock} | Vendidos: {product.totalVendido}
        </Typography>
      )}

      {userType === "buyer" && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 2,
              width: "100%",
              justifyContent: "center",
            }}
          >
            <IconButton 
              onClick={decrease}
              disabled={quantity === 1}
              sx={{ color: "#333" }}
            >
              <RemoveIcon />
            </IconButton>

            <Typography sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
              {quantity}
            </Typography>

            <IconButton 
              onClick={increase}
              disabled={quantity === product.stock}
              sx={{ color: "#333" }}
            >
              <AddIcon />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            sx={{
              mt: 2,
              backgroundColor: isAdding ? "#4caf50" : "#ff9800",
              fontWeight: 600,
              transition: "all 0.3s ease-in-out",
              transform: isAdding ? "scale(0.95)" : "scale(1)",
              ":hover": { backgroundColor: isAdding ? "#4caf50" : "#e68900" },
            }}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? "Agregado!" : "Agregar al carrito"}
          </Button>
        </>
      )}

      {userType === "seller" && (
        <Box sx={{ display: "flex", gap: 1, mt: 2, width: "100%" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onEdit}
            sx={{ flex: 1 }}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onDelete}
            sx={{ flex: 1 }}
          >
            Eliminar
          </Button>
        </Box>
      )}
      </Card>
    </>
  );
};

export default ProductCard;