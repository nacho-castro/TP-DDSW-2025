import jwt from 'jsonwebtoken';


const SECRET_KEY = process.env.JWT_SECRET || 'test-secret-key';


export function generateMockToken(userId, tipoUsuario = 'comprador') {
  const payload = {
    sub: userId,
    userId: userId,
    tipoUsuario: tipoUsuario,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // Expira en 1 hora
  };

  return jwt.sign(payload, SECRET_KEY, { algorithm: 'HS256' });
}


export function mockAuthMiddleware() {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Token inválido o expirado'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] });

      // Simular la estructura de req que Clerk proporciona
      req.userId = decoded.userId;
      req.tipoUsuario = decoded.tipoUsuario;
      req.auth = () => ({
        userId: decoded.userId
      });

      next();
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Token inválido o expirado'
      });
    }
  };
}

export function mockRequireComprador() {
  return (req, res, next) => {
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
}

export function mockRequireVendedor() {
  return (req, res, next) => {
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
}
