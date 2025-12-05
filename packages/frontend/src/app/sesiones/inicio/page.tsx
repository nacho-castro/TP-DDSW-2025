'use client'
import React from 'react'
import { Box, Paper, Link, Typography } from '@mui/material'
import Navbar from '@/components/Navbar/Navbar'
import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <>
      <Navbar minimal />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '93vh',
        backgroundColor: '#f1f1f1'
      }}>
        <Paper elevation={3} sx={{ p: 4, width: 'auto', textAlign: 'center', borderRadius: 2 }}>
          <SignIn
            afterSignInUrl="/home"
            appearance={{
              elements: {
                rootBox: {
                  width: '340px',
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

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <Link href="/registro" underline="hover">Crear cuenta</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </>
  )
}
