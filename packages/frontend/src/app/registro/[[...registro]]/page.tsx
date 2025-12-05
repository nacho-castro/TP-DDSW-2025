'use client'
import React from 'react'
import { Box } from '@mui/material'
import Navbar from '@/components/Navbar/Navbar'
import { SignUp } from '@clerk/nextjs'

export default function RegistroPage() {
  return (
    <>
      <Navbar minimal />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '93vh',
          backgroundColor: '#f1f1f1'
        }}
      >
        <SignUp
          afterSignUpUrl="/completar-registro"
          appearance={{
            elements: {
              rootBox: {
                width: '450px',
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
