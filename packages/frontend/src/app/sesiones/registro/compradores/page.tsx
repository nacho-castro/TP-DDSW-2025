'use client'
import React from 'react'
import { Box, Paper } from '@mui/material'
import Navbar from '@/components/Navbar/Navbar'
import { SignUp } from '@clerk/nextjs'

export default function RegisterUserPage() {
  return (
    <>
      <Navbar minimal />
      <Box
        role="main"
        aria-label="Formulario de registro"
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
