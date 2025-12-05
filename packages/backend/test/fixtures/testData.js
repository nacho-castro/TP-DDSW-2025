import mongoose from "mongoose";
import { EstadoPedido } from "../../domain/pedido/enums.js";

/**
 * Fixtures reutilizables para tests con MongoDB en memoria
 * Proporciona datos de prueba consistentes para servicios e integración
 */

export class TestDataFactory {
  /**
   * Crea un usuario válido de prueba
   */
  static createUsuario(overrides = {}) {
    const id = new mongoose.Types.ObjectId();
    return {
      _id: id,
      nombre: "Usuario Test",
      email: `usuario-${id}@test.com`,
      rol: "comprador",
      ...overrides
    };
  }

  /**
   * Crea una categoría válida de prueba
   */
  static createCategoria(overrides = {}) {
    return {
      _id: new mongoose.Types.ObjectId(),
      nombre: "Electrónica",
      ...overrides
    };
  }

  /**
   * Crea un producto válido de prueba
   */
  static createProducto(vendedor, overrides = {}) {
    return {
      _id: new mongoose.Types.ObjectId(),
      vendedor: vendedor ? vendedor._id : new mongoose.Types.ObjectId(),
      titulo: "Laptop Gaming",
      descripcion: "Laptop de alta performance",
      categorias: [],
      precio: 1500,
      moneda: "DOLAR_USA",
      stock: 10,
      totalVendido: 0,
      calificacionPromedio: 0,
      imagenPrincipal: "https://example.com/laptop.jpg",
      estado: "activo",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * Crea un item de pedido válido
   */
  static createItemPedido(productoId, overrides = {}) {
    return {
      productoId: productoId || new mongoose.Types.ObjectId(),
      cantidad: 2,
      precioUnitario: 100,
      vendedorId: new mongoose.Types.ObjectId(),
      ...overrides
    };
  }

  /**
   * Crea una dirección de entrega válida
   */
  static createDireccionEntrega(overrides = {}) {
    return {
      calle: "Av. Corrientes",
      numero: "1234",
      piso: "5",
      departamento: "B",
      localidad: "Buenos Aires",
      provincia: "CABA",
      codigoPostal: "1043",
      pais: "Argentina",
      ...overrides
    };
  }

  /**
   * Crea un pedido válido de prueba
   */
  static createPedido(comprador, overrides = {}) {
    const items = [
      this.createItemPedido(new mongoose.Types.ObjectId())
    ];

    return {
      _id: new mongoose.Types.ObjectId(),
      compradorId: comprador ? comprador._id : new mongoose.Types.ObjectId(),
      vendedorId: new mongoose.Types.ObjectId(),
      estado: EstadoPedido.PENDIENTE,
      items,
      direccionEntrega: this.createDireccionEntrega(),
      moneda: "DOLAR_USA",
      historialEstados: [
        {
          fecha: new Date(),
          estado: EstadoPedido.PENDIENTE,
          quien: comprador ? comprador._id : new mongoose.Types.ObjectId()
        }
      ],
      montoTotal: 200,
      medioPago: "tarjeta",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * Crea una notificación válida de prueba
   */
  static createNotificacion(usuarioDestino, overrides = {}) {
    return {
      _id: new mongoose.Types.ObjectId(),
      usuarioDestinoId: usuarioDestino ? usuarioDestino._id : new mongoose.Types.ObjectId(),
      titulo: "Notificación de prueba",
      mensaje: "Este es un mensaje de prueba",
      tipo: "sistema",
      leida: false,
      fechaCreacion: new Date(),
      ...overrides
    };
  }

  /**
   * Genera múltiples usuarios
   */
  static createMultipleUsuarios(cantidad, overrides = {}) {
    return Array.from({ length: cantidad }).map((_, i) =>
      this.createUsuario({
        nombre: `Usuario ${i + 1}`,
        email: `usuario${i + 1}@test.com`,
        ...overrides
      })
    );
  }

  /**
   * Genera múltiples productos
   */
  static createMultipleProductos(vendedor, cantidad, overrides = {}) {
    return Array.from({ length: cantidad }).map((_, i) =>
      this.createProducto(vendedor, {
        titulo: `Producto ${i + 1}`,
        stock: 10 + i,
        precio: 100 + i * 50,
        ...overrides
      })
    );
  }

  /**
   * Genera múltiples pedidos
   */
  static createMultiplePedidos(comprador, cantidad, overrides = {}) {
    return Array.from({ length: cantidad }).map((_, i) =>
      this.createPedido(comprador, {
        montoTotal: 100 + i * 50,
        ...overrides
      })
    );
  }
}
