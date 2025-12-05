"use client";

import { createContext, useContext, useState, useRef } from "react";

interface CartPanelContextType {
  cartAnchorEl: HTMLElement | null;
  openCartPanel: (element?: HTMLElement) => void;
  closeCartPanel: () => void;
  setCartIconRef: (element: HTMLElement | null) => void;
}

const CartPanelContext = createContext<CartPanelContextType | null>(null);

export const CartPanelProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartAnchorEl, setCartAnchorEl] = useState<HTMLElement | null>(null);
  const cartIconRef = useRef<HTMLElement | null>(null);

  const setCartIconRef = (element: HTMLElement | null) => {
    cartIconRef.current = element;
  };

  const openCartPanel = (element?: HTMLElement) => {
    // Si se pasa un elemento específico, usarlo; sino usar el ícono del navbar
    const anchorElement = element || cartIconRef.current;
    if (anchorElement) {
      setCartAnchorEl(anchorElement);
    }
  };

  const closeCartPanel = () => {
    setCartAnchorEl(null);
  };

  return (
    <CartPanelContext.Provider value={{ cartAnchorEl, openCartPanel, closeCartPanel, setCartIconRef }}>
      {children}
    </CartPanelContext.Provider>
  );
};

export const useCartPanel = () => {
  const ctx = useContext(CartPanelContext);
  if (!ctx) throw new Error("useCartPanel must be used inside CartPanelProvider");
  return ctx;
};
