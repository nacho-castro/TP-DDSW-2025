import { ValidationError } from '../../errors/AppError.js';

export class ItemPedido {
  //producto
  productoId
  cantidad
  precioUnitario
  vendedorId // NUEVO: almacenar vendedorId

  constructor(productoId, cantidad, precioUnitario, vendedorId = null) {
    this.productoId = productoId;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.vendedorId = vendedorId; // NUEVO

    if (this.productoId == null || this.productoId === '') {
      throw new ValidationError('El productoId no puede ser nulo o vacío', 'productoId');
    }

    if (this.cantidad == null || isNaN(this.cantidad) || this.cantidad <= 0) {
      throw new ValidationError('La cantidad debe ser un número mayor a 0', 'cantidad');
    }

    if (this.precioUnitario == null || isNaN(this.precioUnitario) || this.precioUnitario <= 0) {
      throw new ValidationError('El precio unitario debe ser un número mayor a 0', 'precioUnitario');
    }
  }

  subTotal() {
    return this.cantidad * this.precioUnitario;
  }

  getProductoId() {
    return this.productoId;
  }

  getCantidad() {
    return this.cantidad;
  }

  getProducto() {
    return this.productoId;
  }

  // No usados pero los agrego para futuras funcionalidades:
  getPrecioUnitario() { return this.precioUnitario; }
}
