'use client'
import React from 'react'
import { Box } from '@mui/material'
import Navbar from '@/components/Navbar/Navbar'
import { SignIn } from '@clerk/nextjs'

export default function InicioSesionPage() {
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
        <SignIn
          afterSignInUrl="/home"
          appearance={{
            elements: {
              rootBox: {
                width: '340px',
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
      </Box>
    </>
  )
}
