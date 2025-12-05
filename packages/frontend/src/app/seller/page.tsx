'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import {
  Container,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import { FiPackage, FiShoppingCart } from 'react-icons/fi';
import { withRole } from '@/src/hocs';

// Importa tus componentes existentes
import MisProductosView from '@/components/SellerViews/MisProductosView';
import AdministrarPedidosView from '@/components/SellerViews/AdministrarPedidosView';

function SellerDashboardPage() {
  const [selectedView, setSelectedView] = useState<number>(0);

  const handleViewChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedView(newValue);
  };

  return (
    <div className="min-h-screen flex flex-col bg-platinum">
      <Navbar />

      <main role="main" aria-label="Panel de vendedor" className="flex-grow py-6">
        <Container maxWidth="lg">
          {/* Tabs como solapas superiores */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={selectedView}
              onChange={handleViewChange}
              aria-label="navegación del panel"
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  gap: 1,
                  px: 3,
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600,
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                }
              }}
            >
              <Tab 
                icon={<FiShoppingCart size={18} />} 
                iconPosition="start" 
                label="Administrar Pedidos"
              />
              <Tab 
                icon={<FiPackage size={18} />} 
                iconPosition="start" 
                label="Mis Productos"
              />
            </Tabs>
          </Box>

          {/* Renderizado condicional de componentes */}
          {selectedView === 0 ? (
            <AdministrarPedidosView />
          ) : (
            <MisProductosView />
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default withRole('vendedor')(SellerDashboardPage);