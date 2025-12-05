'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, ComponentType, useState } from 'react';
import { CircularProgress, Box, Alert, Container } from '@mui/material';

type TipoUsuario = 'comprador' | 'vendedor';

export function withRole<P extends object>(requiredRole: TipoUsuario) {
  return function (Component: ComponentType<P>) {
    return function WithRoleComponent(props: P) {
      const { isLoaded, isSignedIn } = useAuth();
      const { user } = useUser();
      const router = useRouter();
      const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
      const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);

      useEffect(() => {
        async function checkRole() {
          if (!isLoaded) return;

          if (!isSignedIn) {
            router.push('/inicio-sesion');
            return;
          }

          try {
            const tipo = user?.publicMetadata?.tipoUsuario as TipoUsuario;

            if (!tipo) {
              router.push('/completar-registro');
              return;
            }

            setTipoUsuario(tipo);

            if (requiredRole === 'comprador') {
              setIsAuthorized(tipo === 'comprador' || tipo === 'vendedor');
            } else if (requiredRole === 'vendedor') {
              setIsAuthorized(tipo === 'vendedor');
            } else {
              setIsAuthorized(false);
            }
          } catch (error) {
            console.error('Error verificando rol:', error);
            setIsAuthorized(false);
          }
        }

        checkRole();
      }, [isLoaded, isSignedIn, user, router]);

      if (!isLoaded || isAuthorized === null) {
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

      if (!isAuthorized) {
        return (
          <Container maxWidth="sm" sx={{ py: 8 }}>
            <Alert severity="error">
              No tienes permisos para acceder a esta página.
              {tipoUsuario && ` Tu tipo de usuario actual es: ${tipoUsuario}`}
            </Alert>
          </Container>
        );
      }

      return <Component {...props} />;
    };
  };
}
