import { createClerkClient, requireAuth } from '@clerk/express';
import jwt from 'jsonwebtoken';

export const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const withAuth = (options = {}) => {
  const { requireRegistration = true } = options;

  const requireAuthMiddleware = requireAuth({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  });

  return async (req, res, next) => {
    // Verificar si el token existe y está expirado antes de procesarlo
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        // Decodificar el token sin verificar para obtener el exp claim
        const decoded = jwt.decode(token);

        if (decoded && decoded.exp) {
          const currentTime = Math.floor(Date.now() / 1000);

          // Si el token está expirado
          if (decoded.exp < currentTime) {
            return res.status(401).json({
              error: 'Token expirado',
              message: 'El token de autenticación ha expirado'
            });
          }
        }
      } catch (decodeError) {
        // Si hay error al decodificar, continuar con la validación de Clerk
        console.error('Error decodificando token:', decodeError);
      }
    }

    requireAuthMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(401).json({
          error: 'No autenticado',
          message: 'Token inválido o expirado'
        });
      }

      const auth = req.auth();

      if (!auth?.userId) {
        return res.status(401).json({
          error: 'No autenticado',
          message: 'No se encontró información de autenticación'
        });
      }

      try {
        const user = await clerk.users.getUser(auth.userId);
        const metadata = user.publicMetadata || {};

        req.userId = auth.userId;
        req.tipoUsuario = metadata.tipoUsuario;

        // Verificar si el usuario ha completado el registro (solo si se requiere)
        if (requireRegistration && !req.tipoUsuario) {
          return res.status(403).json({
            error: 'Registro incompleto',
            message: 'Debes completar tu registro antes de acceder a este recurso',
            requiresRegistration: true
          });
        }

        next();
      } catch (error) {
        console.error('Error obteniendo información del usuario:', error);
        return res.status(500).json({
          error: 'Error interno',
          message: 'No se pudo obtener la información del usuario'
        });
      }
    });
  };
};

export const requireComprador = () => {
  return async (req, res, next) => {
    if (!req.tipoUsuario) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debes iniciar sesión para acceder a este recurso'
      });
    }

    if (req.tipoUsuario !== 'comprador' && req.tipoUsuario !== 'vendedor') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Este recurso requiere ser comprador o vendedor'
      });
    }

    next();
  };
};

export const requireVendedor = () => {
  return async (req, res, next) => {
    if (!req.tipoUsuario) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debes iniciar sesión para acceder a este recurso'
      });
    }

    if (req.tipoUsuario !== 'vendedor') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Este recurso requiere ser vendedor'
      });
    }

    next();
  };
};
