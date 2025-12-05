import { describe, test, expect, beforeEach } from "@jest/globals";
import { FactoryNotificacion } from "../../domain/notificacion/FactoryNotificacion.js";
import { Notificacion } from "../../domain/notificacion/Notificacion.js";
import { EstadoPedido } from "../../domain/pedido/enums.js";
import { Pedido } from "../../domain/pedido/Pedido.js";
import { ItemPedido } from "../../domain/pedido/ItemPedido.js";

describe("FactoryNotificacion - Creación de notificaciones por estado", () => {
  let pedidoMock;

  beforeEach(() => {
    // Crear un pedido mock con múltiples vendedores
    const items = [
      new ItemPedido("prod-1", 2, 100, "vendedor-001"),
      new ItemPedido("prod-2", 1, 200, "vendedor-002"),
      new ItemPedido("prod-3", 3, 50, "vendedor-001")
    ];
    
    pedidoMock = new Pedido(
      "comprador-123",
      items,
      "ARS",
      { calle: "Calle Principal", altura: 123, codPostal: "1234", ciudad: "CABA", provincia: "CABA", pais: "Argentina" }
    );
  });

  // ========================
  // Tests de crearNotificacion
  // ========================
  describe("crearNotificacion()", () => {
    test("retorna array de notificaciones para estado CONFIRMADO", () => {
      const notificaciones = FactoryNotificacion.crearNotificacion(pedidoMock, EstadoPedido.CONFIRMADO);
      expect(Array.isArray(notificaciones)).toBe(true);
      expect(notificaciones.length).toBeGreaterThan(0);
    });

    test("retorna array de notificaciones para estado ENVIADO", () => {
      const notificaciones = FactoryNotificacion.crearNotificacion(pedidoMock, EstadoPedido.ENVIADO);
      expect(Array.isArray(notificaciones)).toBe(true);
      expect(notificaciones.length).toBeGreaterThan(0);
    });

    test("retorna array de notificaciones para estado CANCELADO", () => {
      const notificaciones = FactoryNotificacion.crearNotificacion(pedidoMock, EstadoPedido.CANCELADO);
      expect(Array.isArray(notificaciones)).toBe(true);
      expect(notificaciones.length).toBeGreaterThan(0);
    });

    test("lanza error para estado desconocido", () => {
      expect(() => {
        FactoryNotificacion.crearNotificacion(pedidoMock, "ESTADO_DESCONOCIDO");
      }).toThrow();
    });
  });

  // ========================
  // Tests de crearNotificacionConfirmado
  // ========================
  describe("crearNotificacionConfirmado()", () => {
    test("crea notificación para el comprador", () => {
      const notificaciones = FactoryNotificacion.crearNotificacionConfirmado(pedidoMock);
      const notificacionComprador = notificaciones.find(n => n.usuarioDestinoId === "comprador-123");
      expect(notificacionComprador).toBeDefined();
      expect(notificacionComprador).toBeInstanceOf(Notificacion);
    });

    test("crea notificaciones para todos los vendedores", () => {
      const notificaciones = FactoryNotificacion.crearNotificacionConfirmado(pedidoMock);
      const vendedores = pedidoMock.obtenerVendedoresIds();
      
      for (const vendedorId of vendedores) {
        const notificacionVendedor = notificaciones.find(n => n.usuarioDestinoId === vendedorId);
        expect(notificacionVendedor).toBeDefined();
      }
    });

    test("total de notificaciones = comprador + vendedores únicos", () => {
      const notificaciones = FactoryNotificacion.crearNotificacionConfirmado(pedidoMock);
      const vendedoresUnicos = pedidoMock.obtenerVendedoresIds().length;
      // 1 para comprador + n para vendedores
      expect(notificaciones).toHaveLength(vendedoresUnicos + 1);
    });
  });
});
