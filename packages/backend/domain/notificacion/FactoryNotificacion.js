import { EstadoPedido } from "../pedido/enums.js";
import { Notificacion } from "./Notificacion.js";

export class FactoryNotificacion {
  
  static crearNotificacion(pedido, estado) {
    try {
      switch (estado) {
        case EstadoPedido.PENDIENTE:
          return this.crearNotificacionPendiente(pedido);
          break;
        case EstadoPedido.CONFIRMADO:
          return this.crearNotificacionConfirmado(pedido);
          break;
        case EstadoPedido.ENVIADO:
          return this.crearNotificacionEnviado(pedido);
          break;
        case EstadoPedido.CANCELADO:
          return this.crearNotificacionCancelado(pedido);
          break;
        default:
          throw new Error("Estado desconocido para notificación");
      }
    } catch (error) {
      throw new Error(`Error al crear notificación: ${error.message}`);
    }
  }

  static crearNotificacionPendiente(pedido) {
    const notificaciones = [];

    //MENSAJE A COMPRADOR
    notificaciones.push(
      new Notificacion(
        pedido.compradorId, //destinatarioId
        `Se ha realizado la compra correctamente. Tu pedido está pendiente de confirmación. El vendedor lo revisará.`
      )
    );

    //MENSAJE A VENDEDORES
    for (const vendedorId of pedido.obtenerVendedoresIds()) {
      notificaciones.push(
        new Notificacion(
          vendedorId,
          `Se ha creado un nuevo pedido. Recuerda confirmarlo.`
        )
      );
    }
    return notificaciones;
  }

  static crearNotificacionConfirmado(pedido) {
    const notificaciones = [];

    //MENSAJE A COMPRADOR
    notificaciones.push(
      new Notificacion(
        pedido.compradorId, //destinatarioId
        `Felicidades, tu pedido ha sido confirmado! Te avisaremos cuando esté en camino.`
      )
    );

    //MENSAJE A VENDEDORES
    for (const vendedorId of pedido.obtenerVendedoresIds()) {
      notificaciones.push(
        new Notificacion(
          vendedorId,
          `El pedido ha sido confirmado. Recuerda preparar el envío.`
        )
      );
    }
    return notificaciones;
  }

  static crearNotificacionCancelado(pedido) {
    const notificaciones = [];

    notificaciones.push(
      new Notificacion(
        pedido.compradorId,
        `Tu pedido ha sido cancelado.`
      )
    );

    for (const vendedorId of pedido.obtenerVendedoresIds()) {
      notificaciones.push(
        new Notificacion(
          vendedorId,
          `El pedido fue cancelado por el comprador.`
        )
      );
    }
    return notificaciones;
  }

  static crearNotificacionEnviado(pedido) {
    const notificaciones = [];

    notificaciones.push(
      new Notificacion(
        pedido.compradorId,
        `¡Gracias por tu compra! Tu pedido está en camino.`
      )
    );

    for (const vendedorId of pedido.obtenerVendedoresIds()) {
      notificaciones.push(
        new Notificacion(
          vendedorId,
           `El pedido ha sido marcado como enviado.`
        )
      );
    }

    return notificaciones; 
  }

  static crearSegunEstadoPedido(estadoPedido) {
    return `El pedido pasó al estado: ${estadoPedido}`;
  }

  static crearInstanciaNotificacion(usuarioDestinoId, mensaje) {
    return new Notificacion(usuarioDestinoId, mensaje);
  }

  static obtenerProductosxCantidad(productos, cantidades) {
    const productosStr = [];
    for (let i = 0; i < productos.length; i++) {
      productosStr.push(`${productos[i].titulo} (x${cantidades[i]})`);
    }
    return productosStr;
  }
}
