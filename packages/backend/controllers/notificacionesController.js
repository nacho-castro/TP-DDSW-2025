import { AppError } from '../errors/AppError.js';

export class NotificacionesController {
  constructor(notificacionesService) {
    this.notificacionesService = notificacionesService;
  }

  obtenerNotificacionesNoLeidas = async (req, res) => {
    try {
      const usuarioId = req.userId;
      const { page = 1, limit = 10 } = req.query;

      const resultado = await this.notificacionesService.obtenerNotificacionesNoLeidas(usuarioId, page, limit);
      res.json(resultado);
    } catch (err) {
      this.handleError(err, res);
    }
  };

  obtenerNotificacionesLeidas = async (req, res) => {
    try {
      const usuarioId = req.userId;
      const { page = 1, limit = 10 } = req.query;

      const resultado = await this.notificacionesService.obtenerNotificacionesLeidas(usuarioId, page, limit);
      res.json(resultado);
    } catch (err) {
      this.handleError(err, res);
    }
  };

  marcarComoLeida = async (req, res) => {
    try {
      const { id } = req.params;
      const notificacion = await this.notificacionesService.marcarComoLeida(id);
      res.json({
        message: "Notificación marcada como leída",
        notificacion
      });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  // Método centralizado para manejo de errores
  handleError = (err, res) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        error: err.message,
        code: err.errorCode,
        ...(err.field && { field: err.field }),
        ...(err.resource && { resource: err.resource }),
        ...(err.resourceId && { resourceId: err.resourceId })
      });
    }

    // Error no controlado - log para debugging y respuesta genérica
    console.error('Error no controlado:', err);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  };
}