'use client';
import React from 'react';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import Link from 'next/link';

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      role="main"
      aria-label="Landing page de Tienda Sol"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: '100vh',
        backgroundColor: 'black',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 24,
          zIndex: 2
        }}
      >
        <Link href="/inicio-sesion" passHref>
          <Button variant="outlined" sx={{ color: 'white', borderColor: 'white' }}>
            Ingresar
          </Button>
        </Link>
      </Box>

      <Box
        role="region"
        aria-label="Mensaje de bienvenida"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: { xs: 'center', md: 'flex-start' },
          padding: { xs: 2, sm: 4, md: 4 },
          textAlign: { xs: 'center', md: 'left' },
          zIndex: 1
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'orange',
            mb: 2,
            mt: { xs: 10, sm: 12, md: 0 },
            fontFamily: 'var(--font-montserrat)',
            fontSize: {
              xs: '2rem',
              sm: '2.5rem',
              md: '3rem'
            }
          }}
        >
          Descubre y encuentra tu estilo
        </Typography>

        <Typography
          variant="body1"
          sx={{
            maxWidth: 480,
            mb: 4,
            fontSize: { xs: '1rem', sm: '1.1rem' }
          }}
        >
          Explorá los productos que ofrecen distintos emprendedores, descubrí nuevas marcas y
          encontrá exactamente lo que buscás.
        </Typography>

        <Link
          href="/home"
          passHref
          aria-label="Ir al catálogo de productos"
          title="Descubrir productos"
        >
          <Button variant="outlined" sx={{ backgroundColor: 'white', color: 'black' }}>
            Descubrir Ahora
          </Button>
        </Link>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mt: { xs: 4, md: '10px' },
          pr: { xs: 0, md: '15%' },
          maxHeight: { xs: '40vh', sm: '50vh', md: '100%' },
          overflow: 'hidden'
        }}
      >
        <Box
          component="img"
          src="/img/modelo_home.png"
          alt="Modelo Tienda Sol"
          sx={{
            width: '100%',
            height: 'auto',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: 2,
            boxShadow: '0 0 8px rgba(252, 163, 17, 0.1)',
            mx: 'auto'
          }}
        />
      </Box>
    </Box>
  );
};

export default LandingPage;
