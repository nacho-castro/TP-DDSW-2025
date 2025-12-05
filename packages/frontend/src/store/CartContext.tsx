"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "@/components/ProductCard/ProductCard";

interface CartItem extends Product {
  cantidad: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((p) => p._id === product._id);

      if (existing) {
        return prev.map((p) =>
          p._id === product._id
            ? { ...p, cantidad: p.cantidad + quantity }
            : p
        );
      }

      return [...prev, { ...product, cantidad: quantity }];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    setCart((prev) =>
      prev.map((p) =>
        p._id === productId ? { ...p, cantidad: Math.max(1, qty) } : p
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((p) => p._id !== productId));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
