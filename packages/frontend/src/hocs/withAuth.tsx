'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
import { CircularProgress, Box } from '@mui/material';

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (isLoaded) {
        if (!isSignedIn) {
          router.push('/inicio-sesion');
          return;
        }

        const metadata = user?.publicMetadata;
        const hasCompletedRegistration =
          metadata?.tipoUsuario &&
          metadata?.telefono &&
          metadata?.direccion;

        if (!hasCompletedRegistration && pathname !== '/completar-registro') {
          router.push('/completar-registro');
        }
      }
    }, [isLoaded, isSignedIn, user, router, pathname]);

    if (!isLoaded || !isSignedIn) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      );
    }

    const metadata = user?.publicMetadata;
    const hasCompletedRegistration =
      metadata?.tipoUsuario &&
      metadata?.telefono &&
      metadata?.direccion;

    if (!hasCompletedRegistration && pathname !== '/completar-registro') {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      );
    }

    return <Component {...props} />;
  };
}
