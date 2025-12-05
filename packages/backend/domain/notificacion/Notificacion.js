export class Notificacion {
  id
  usuarioDestinoId
  mensaje
  fechaAlta
  fechaLeida
  leida

  constructor(usuarioDestinoId, mensaje) {
    this.id = null; // Se asigna al guardar en BD
    this.usuarioDestinoId = usuarioDestinoId; // Id de usuario
    this.mensaje = mensaje;
    this.fechaAlta = Date.now();
    this.fechaLeida = null;
    this.leida = false;
  }

  marcarComoLeida() {
    this.fechaLeida = new Date();
    this.leida = true;
  }

  // Getters si es necesario
  getId() { return this.id; }
  getUsuarioDestino() { return this.usuarioDestinoId; }
  getMensaje() { return this.mensaje; }
  getFechaAlta() { return this.fechaAlta; }
  getFechaLeida() { return this.fechaLeida; }
  isLeida() { return this.leida; }
}

