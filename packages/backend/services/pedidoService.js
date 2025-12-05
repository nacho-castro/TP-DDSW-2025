import mongoose from 'mongoose';
import { Pedido } from "../domain/pedido/Pedido.js";
import { ItemPedido } from "../domain/pedido/ItemPedido.js";
import { EstadoPedido } from '../domain/pedido/enums.js';
import { DireccionEntrega } from "../domain/pedido/DireccionEntrega.js";
import { InvalidIdError, NotFoundError, ValidationError } from '../errors/AppError.js';
import { PedidoModel } from '../models/PedidoModel.js';

export class PedidoService {
  constructor(pedidoRepository, productoService, usuarioRepository, notificacionesService) {
    this.pedidoRepository = pedidoRepository;
    this.productoService = productoService;
    this.usuarioRepository = usuarioRepository;
    this.notificacionesService = notificacionesService;
  }

  // Crear un nuevo pedido
  async crearPedido(compradorId, items, moneda, direccionEntrega) {
    // Validar que comprador exista
    const comprador = await this.usuarioRepository.findById(compradorId);
    if (!comprador) {
      throw new NotFoundError('Comprador', compradorId);
    }

    //Instancio items con validacion interna
    const itemsInstancia = await Promise.all(
      items.map(async (item) => {
        const producto = await this.productoService.buscarProductoPorId(item.productoId);
        if (!producto) {
          throw new NotFoundError('Producto', item.productoId);
        }

        const precio = producto.precio;
        const vendedorId = producto.vendedor?._id || producto.vendedor;

        return new ItemPedido(
          item.productoId,
          item.cantidad,
          precio,
          vendedorId // NUEVO: pasar vendedorId al ItemPedido
        );
      })
    );

    //Instancio direcc con validacion interna
    const direccionEntregaInstancia = new DireccionEntrega(
      direccionEntrega.calle,
      direccionEntrega.altura,
      direccionEntrega.piso,
      direccionEntrega.departamento,
      direccionEntrega.codPostal,
      direccionEntrega.ciudad,
      direccionEntrega.provincia,
      direccionEntrega.pais,
      direccionEntrega.lat,
      direccionEntrega.lon
    );

    //Instancio pedido con validacion interna
    const pedido = new Pedido(
      compradorId,
      itemsInstancia,
      moneda,
      direccionEntregaInstancia
    );

    // Validar stock de todos los productos
    for (const item of pedido.items) {
      if (!(await this.productoService.tieneStockSuficiente(item.productoId, item.cantidad))) {
        throw new ValidationError("Stock insuficiente para uno o más productos");
      }
    }

    //SI SE CREA EL PEDIDO, EL VENDEDOR DISMINUYE EL STOCK (BAJAR STOCK)
    for (const item of items) {
      await this.productoService.disminuirStock(item.productoId, item.cantidad);
    }

    // Guardar pedido en la base de datos
    const pedidoCreado = await this.pedidoRepository.create(pedido);

    //Despachar notificaciones tras creación del pedido (asincrónico)
    await this.notificacionesService
      .despacharPorEstado(pedido, EstadoPedido.PENDIENTE)
      .catch((err) => console.error("Error al notificar pedido:", err));

    return pedidoCreado;
  }

  // Listar todos los pedidos
  async listarPedidos() {
    return await PedidoModel.find().populate({
      path: "items.productoId",
      select: "titulo fotos"
    });
  }

  async actualizarEstadoPedido(pedidoId, nuevoEstado, quien, motivo) {
    if (!mongoose.Types.ObjectId.isValid(pedidoId)) {
      throw new InvalidIdError('Pedido ID');
    }

    const pedidoDB = await this.pedidoRepository.findById(pedidoId);
    if (!pedidoDB) {
      throw new NotFoundError('Pedido', pedidoId);
    }

    // reconstruir instancia del dominio
    const pedido = await this.rehidratarPedido(pedidoDB);

    // No permitir cancelar un pedido ya cancelado
    if (pedido.estado === EstadoPedido.CANCELADO && nuevoEstado === EstadoPedido.CANCELADO) {
      throw new Error("El pedido ya fue cancelado previamente.");
    }

    //Notificaciones por cambio de estado
    await this.notificacionesService.despacharPorEstado(pedido, nuevoEstado);

    //Actualizar pedido en BD
    return await this.pedidoRepository.findByIdAndUpdateEstado(pedidoId, nuevoEstado, quien, motivo);
  }

  // Cancelar pedido
  async cancelarPedido(pedidoId, compradorId) {
    const pedido = await this.pedidoRepository.findById(pedidoId);
    if (!pedido) throw new NotFoundError('Pedido', pedidoId);

    // TODO: descomentar cuando se implemente autenticación
    /*
    if (pedido.compradorId.toString() !== compradorId.toString()) {
      throw new Error("No autorizado: solo el comprador puede cancelar su pedido");
    }*/

    if (pedido.estado === "ENVIADO") {
      throw new Error("El pedido ya fue enviado y no puede cancelarse");
    } else if (pedido.estado === "CANCELADO") {
      throw new Error("El pedido fue anteriormente cancelado");
    }

    //SI SE CANCELA EL PEDIDO, EL VENDEDOR RECUPERA EL STOCK (AUMENTAR STOCK)
    for (const item of pedido.items) {
      await this.productoService.aumentarStock(item.productoId, item.cantidad);
    }

    return await this.actualizarEstadoPedido(pedido._id, EstadoPedido.CANCELADO, compradorId, "Cancelación por el usuario");
  }

  // Obtener pedidos de un usuario
  async obtenerPedidosDeUsuario(usuarioId, orden = "desc") {
    return await this.pedidoRepository.findByCompradorId(usuarioId, orden);
  }

  async obtenerPedidosDeVendedor(vendedorId, orden = "desc") {
    return await this.pedidoRepository.findByVendedor(vendedorId, orden);
  }

  // Marcar pedido como enviado
  async marcarComoEnviado(pedidoId, vendedorId) {
    const pedido = await this.pedidoRepository.findById(pedidoId);
    if (!pedido) throw new NotFoundError('Pedido', pedidoId);

    // Validar que el vendedor esté en los productos de los items del pedido
    // Si el pedido tiene productos de múltiples vendedores,
    // obligás a que todos sean del vendedor actual.

    if (pedido.estado === "ENVIADO") {
      throw new Error("El pedido ya fue enviado");
    } else if (pedido.estado === "CANCELADO") {
      throw new Error("El pedido fue cancelado y no puede enviarse");
    }

    // Aumentar total vendido
    for (const item of pedido.items) {
      await this.productoService.aumentarCantidadVentas(item.productoId, item.cantidad);
    }

    return await this.actualizarEstadoPedido(pedido._id, EstadoPedido.ENVIADO, vendedorId, "Pedido marcado como enviado");
  }

  async marcarComoConfirmado(pedidoId, vendedorId) {
    const pedido = await this.pedidoRepository.findById(pedidoId);
    if (!pedido) throw new NotFoundError("Pedido", pedidoId);

    // Validación: solo se puede confirmar si está pendiente
    if (pedido.estado !== "PENDIENTE") {
      throw new Error("El pedido solo puede confirmarse si está en estado PENDIENTE");
    }

    // Actualizar estado
    return await this.actualizarEstadoPedido(
      pedido._id,
      EstadoPedido.CONFIRMADO,
      vendedorId,
      "Pedido confirmado"
    );
  }

  async rehidratarPedido(pedidoDb) {
    // Crear items con vendedorId obtenido de cada producto
    const itemsInstancia = await Promise.all(
      pedidoDb.items.map(async (item) => {
        const producto = await this.productoService.buscarProductoPorId(item.productoId);

        // Si encontramos el producto, obtenemos su vendedorId
        const vendedorId = producto ? (producto.vendedor?._id || producto.vendedor) : null;

        return new ItemPedido(
          item.productoId,
          item.cantidad,
          item.precioUnitario,
          vendedorId
        );
      })
    );

    // Crear instancia de pedido con items enriquecidos
    const pedido = new Pedido(
      pedidoDb.compradorId,
      itemsInstancia,
      pedidoDb.moneda,
      pedidoDb.direccionEntrega
    );

    pedido.id = pedidoDb._id;
    pedido.estado = pedidoDb.estado;
    pedido.historialEstados = pedidoDb.historialEstados ?? [];

    return pedido;
  }

}

