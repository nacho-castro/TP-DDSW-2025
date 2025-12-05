'use client';
import React from 'react';
import { Box, Typography, TextField, Button, Container } from '@mui/material';
import { FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa';

const Footer: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Box
      component="footer"
      role="contentinfo"
      sx={{
        backgroundColor: '#c8c8c8ff',
        padding: 5,
        width: '100%',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 6,
            flexWrap: 'wrap',
            gap: 4,
            
            /* MOBILE */
            '@media (max-width:600px)': {
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }
          }}
        >
          {/* ---- LOGO + REDES ---- */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',

              /* MOBILE */
              '@media (max-width:600px)': {
                alignItems: 'center',
              }
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
              Tienda Sol
            </Typography>

            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              Redes sociales
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 1,

                /* MOBILE */
                '@media (max-width:600px)': {
                  justifyContent: 'center',
                }
              }}
            >
              {/* Todas las redes quedan iguales — no se toca nada */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar Facebook de Tienda Sol"
                title="Facebook"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'black',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#14213d')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'black')}
              >
                <FiFacebook size={20} style={{ color: 'white' }} />
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar TikTok de Tienda Sol"
                title="TikTok"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'black',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#14213d')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'black')}
              >
                <FaTiktok size={20} style={{ color: 'white' }} />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar Twitter de Tienda Sol"
                title="Twitter"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'black',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#14213d')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'black')}
              >
                <FiTwitter size={20} style={{ color: 'white' }} />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar Instagram de Tienda Sol"
                title="Instagram"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'black',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#14213d')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'black')}
              >
                <FiInstagram size={20} style={{ color: 'white' }} />
              </a>
            </Box>
          </Box>

          {/* ---- SUBSCRIBITE ---- */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',

              /* MOBILE */
              '@media (max-width:600px)': {
                alignItems: 'center',
                width: '100%',
              }
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'bold',
                fontSize: '18px',
                marginBottom: 2,
                letterSpacing: '0.1em',
              }}
            >
              SUBSCRIBITE
            </Typography>

            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '280px',
                gap: '12px',
              }}
            >
              <TextField
                type="email"
                placeholder="Ingresa tu mail"
                size="small"
                fullWidth
                required
                aria-label="Ingresa tu mail para suscribirte"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                aria-label="Enviar suscripción"
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  borderRadius: 0,
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                }}
              >
                Enviar
              </Button>
            </form>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', marginTop: 4 }}>
          <Typography variant="body2" sx={{ fontSize: '14px' }}>
            © 2025 tienda sol — Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
