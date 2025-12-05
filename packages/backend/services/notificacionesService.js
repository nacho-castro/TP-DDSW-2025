import mongoose from 'mongoose';
import { InvalidIdError, NotFoundError, ConflictError } from '../errors/AppError.js';
import { FactoryNotificacion } from '../domain/notificacion/FactoryNotificacion.js';

export class NotificacionesService {
  constructor(notificacionesRepository, usuarioRepository) {
    this.notificacionesRepository = notificacionesRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async obtenerNotificacionesNoLeidas(usuarioDestinoId, page = 1, limit = 10) {
    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findById(usuarioDestinoId);
    if (!usuario) {
      throw new NotFoundError('Usuario', usuarioDestinoId);
    }

    // Validar parámetros de paginación siguiendo la convención existente
    const numeroPagina = Math.max(Number(page), 1);
    const elementosXPagina = Math.min(Math.max(Number(limit), 1), 100);

    return await this.notificacionesRepository.findByUsuarioAndLeida(usuarioDestinoId, false, numeroPagina, elementosXPagina);
  }

  async obtenerNotificacionesLeidas(usuarioDestinoId, page = 1, limit = 10) {
    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findById(usuarioDestinoId);
    if (!usuario) {
      throw new NotFoundError('Usuario', usuarioDestinoId);
    }

    // Validar parámetros de paginación siguiendo la convención existente
    const numeroPagina = Math.max(Number(page), 1);
    const elementosXPagina = Math.min(Math.max(Number(limit), 1), 100);

    return await this.notificacionesRepository.findByUsuarioAndLeida(usuarioDestinoId, true, numeroPagina, elementosXPagina);
  }

  async marcarComoLeida(notificacionId) {
    if (!mongoose.Types.ObjectId.isValid(notificacionId)) {
      throw new InvalidIdError('Notificación ID');
    }

    const notificacion = await this.notificacionesRepository.findById(notificacionId);

    if (!notificacion) {
      throw new NotFoundError('Notificación', notificacionId);
    }

    if (notificacion.leida) {
      throw new ConflictError('La notificación ya está marcada como leída');
    }

    const notificacionActualizada = {
      ...notificacion,
      leida: true,
      fechaLectura: new Date()
    };

    return await this.notificacionesRepository.save(notificacionActualizada);
  }

  async crearNotificacion(usuarioDestinoId, titulo, mensaje, tipo = 'sistema') {
    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findById(usuarioDestinoId);
    if (!usuario) {
      throw new NotFoundError('Usuario', usuarioDestinoId);
    }

    const notificacionData = {
      usuarioDestinoId,
      titulo,
      mensaje,
      tipo
    };

    return await this.notificacionesRepository.create(notificacionData);
  }

  //Persiste notificaciones segun pedido y estado
  //La logica de creacion es delegada al FACTORY segun cada estado
  async despacharPorEstado(pedido, estado) {
    const notificaciones = FactoryNotificacion.crearNotificacion(pedido, estado);
    await this.despacharNotificaciones(notificaciones);
  }

  async despacharNotificaciones(notificaciones) {
    for (const notif of notificaciones) {
      const data = {
        usuarioDestinoId: notif.usuarioDestinoId,
        mensaje: notif.mensaje,
        leida: notif.leida,
        fechaCreacion: notif.fechaAlta,
      };
      await this.notificacionesRepository.create(data);
    }
  }
}