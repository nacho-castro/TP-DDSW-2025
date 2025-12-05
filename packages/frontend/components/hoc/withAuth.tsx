'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    allowedRoles?: string[];
  }
) {
  return function ProtectedComponent(props: P) {
    const { isLoaded, isSignedIn, userId } = useAuth();
    const router = useRouter();
    const redirectTo = options?.redirectTo || '/inicio-sesion';

    useEffect(() => {
      if (isLoaded && !isSignedIn) {
        router.push(redirectTo);
      }
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (!isSignedIn) {
      return null;
    }

    return <Component {...props} />;
  };
}
