export class CambioEstadoPedido {
  fecha
  estado
  pedidoId
  usuario
  motivo

  constructor(fecha, estado, pedidoId, usuario, motivo) {
    this.fecha = fecha;
    this.estado = estado;
    this.pedidoId = pedidoId;
    this.usuario = usuario;
    this.motivo = motivo;
  }

  // Getters si es necesario
  getFecha() { return this.fecha; }
  getEstado() { return this.estado; }
  getPedidoId() { return this.pedidoId; }
  getUsuario() { return this.usuario; }
  getMotivo() { return this.motivo; }
}