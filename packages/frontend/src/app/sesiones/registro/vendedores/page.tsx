'use client'
import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import Navbar from '@/components/Navbar/Navbar'
import { SignUp } from '@clerk/nextjs'

export default function RegisterStorePage() {
  return (
    <>
      <Navbar minimal />
      <Box
        role="main"
        aria-label="Formulario de registro para vendedores"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '93vh',
          backgroundColor: '#f1f1f1'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: 'auto', textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
            ¡Bienvenido al equipo!
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Creá tu cuenta y empezá a vender tus prendas al mundo
          </Typography>

          <SignUp
            afterSignUpUrl="/completar-registro"
            appearance={{
              elements: {
                rootBox: {
                  width: '450px',
                },
                card: {
                  boxShadow: 'none',
                },
                headerTitle: {
                  fontWeight: 'bold',
                },
                formButtonPrimary: {
                  backgroundColor: '#f79533',
                  '&:hover': {
                    backgroundColor: '#e68400',
                  },
                },
              },
            }}
          />
        </Paper>
      </Box>
    </>
  )
}
