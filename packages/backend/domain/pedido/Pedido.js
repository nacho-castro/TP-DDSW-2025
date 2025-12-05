import { EstadoPedido } from "./enums.js";
import { FactoryNotificacion } from "../notificacion/FactoryNotificacion.js";
import { CambioEstadoPedido } from "./CambioEstadoPedido.js";

export class Pedido {
  id
  compradorId
  items
  moneda
  direccionEntrega
  estado
  fechaCreacion
  historialEstados

  constructor(compradorId, items, moneda, direccionEntrega) {
    this.id = null; // Se asigna al guardar en BD
    this.compradorId = compradorId; // Id de usuario
    this.items = Array.isArray(items) ? items : []; // [ItemPedido]
    this.moneda = moneda;
    this.direccionEntrega = direccionEntrega; // DireccionEntrega
    this.estado = EstadoPedido.PENDIENTE;
    this.fechaCreacion = new Date();
    this.historialEstados = [];
  }

  calcularTotal() {
    return this.items.reduce((acc, item) => acc + item.subTotal(), 0);
  }

  obtenerVendedoresIds() {
    const vendedoresIds = new Set();
    for (const item of this.items) {
      if (item.vendedorId) {
        vendedoresIds.add(item.vendedorId.toString());
      }
    }
    return Array.from(vendedoresIds);
  }

  getCompradorId() {
    return this.compradorId;
  }

  getComprador() {
    return this.compradorId;
  }

  getItems() {
    return this.items;
  }

  getDireccionEntrega() {
    return this.direccionEntrega;
  }

  getId() {
    return this.id;
  }

  // No usados pero los agrego para futuras funcionalidades:
  getMoneda() { return this.moneda; }
  getEstado() { return this.estado; }
  getFechaCreacion() { return this.fechaCreacion; }
  getHistorialEstados() { return this.historialEstados; }

  toJSONResumen() {
    return {
      id: this.id,
      items: Array.isArray(this.items) ? this.items.map(item => ({
        productoId: item.productoId || item.getProductoId(),
        cantidad: item.cantidad || item.getCantidad(),
        precioUnitario: item.precioUnitario || item.getPrecioUnitario()
      })) : [],
      estado: this.estado,
      direccionEntrega: {
        calle: this.direccionEntrega.calle,
        altura: this.direccionEntrega.altura,
        piso: this.direccionEntrega.piso,
        departamento: this.direccionEntrega.departamento,
        codPostal: this.direccionEntrega.codPostal,
        ciudad: this.direccionEntrega.ciudad,
        provincia: this.direccionEntrega.provincia,
        pais: this.direccionEntrega.pais
      },
      compradorId: this.compradorId,
      fechaCreacion: this.fechaCreacion,
      total: this.calcularTotal()
    };
  }
}
