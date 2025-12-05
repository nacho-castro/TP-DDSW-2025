import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { Pedido } from "../../domain/pedido/Pedido.js";
import { EstadoPedido } from "../../domain/pedido/enums.js";
import { ItemPedido } from "../../domain/pedido/ItemPedido.js";

// Factory de items usando la clase real ItemPedido
const item = (productoId, cantidad, precioUnitario, vendedorId = "vendedor-001") =>
  new ItemPedido(productoId, cantidad, precioUnitario, vendedorId);

describe("Pedido - pruebas unitarias de dominio", () => {
  let pedido;

  beforeEach(() => {
    const items = [
      item(1, 2, 100, "vendedor-001"), // subtotal = 200
      item(2, 3, 50, "vendedor-002")   // subtotal = 150
    ];

    pedido = new Pedido(
      "comprador-123",
      items,
      "ARS",
      { calle: "Calle 123", altura: 456, codPostal: "1234", ciudad: "Buenos Aires", provincia: "CABA", pais: "Argentina" }
    );
  });

  // ========================
  // Tests de calcularTotal
  // ========================
  describe("calcularTotal()", () => {
    test("suma correctamente los subtotales de todos los items", () => {
      expect(pedido.calcularTotal()).toBe(350);
    });

    test("retorna 0 para un pedido sin items", () => {
      const pedidoVacio = new Pedido("comprador-123", [], "ARS", {});
      expect(pedidoVacio.calcularTotal()).toBe(0);
    });

    test("suma correctamente con un único item", () => {
      const singleItemPedido = new Pedido(
        "comprador-123",
        [item(1, 5, 100, "vendedor-001")],
        "ARS",
        {}
      );
      expect(singleItemPedido.calcularTotal()).toBe(500);
    });
  });

  // ========================
  // Tests de obtenerVendedoresIds
  // ========================
  describe("obtenerVendedoresIds()", () => {
    test("retorna un array de IDs de vendedores únicos", () => {
      const vendedores = pedido.obtenerVendedoresIds();
      expect(vendedores).toHaveLength(2);
      expect(vendedores).toContain("vendedor-001");
      expect(vendedores).toContain("vendedor-002");
    });

    test("filtra vendedores duplicados", () => {
      const itemsDuplicados = [
        item(1, 2, 100, "vendedor-001"),
        item(2, 3, 50, "vendedor-001"),
        item(3, 1, 200, "vendedor-002")
      ];
      const pedidoDuplicado = new Pedido("comprador-123", itemsDuplicados, "ARS", {});
      const vendedores = pedidoDuplicado.obtenerVendedoresIds();
      expect(vendedores).toHaveLength(2);
    });

    test("retorna array vacío si no hay vendedorId en los items", () => {
      const itemsSinVendedor = [
        new ItemPedido(1, 2, 100)
      ];
      const pedidoSinVendedor = new Pedido("comprador-123", itemsSinVendedor, "ARS", {});
      const vendedores = pedidoSinVendedor.obtenerVendedoresIds();
      expect(vendedores).toHaveLength(0);
    });
  });

  // ========================
  // Tests de Getters
  // ========================
  describe("Getters", () => {
    test("getId() retorna null antes de ser persistido", () => {
      expect(pedido.getId()).toBeNull();
    });

    test("getCompradorId() retorna el ID del comprador", () => {
      expect(pedido.getCompradorId()).toBe("comprador-123");
    });

    test("getItems() retorna todos los items", () => {
      expect(pedido.getItems()).toHaveLength(2);
    });

    test("getDireccionEntrega() retorna la dirección", () => {
      expect(pedido.getDireccionEntrega()).toHaveProperty("calle", "Calle 123");
    });

    test("getEstado() retorna estado PENDIENTE por defecto", () => {
      expect(pedido.getEstado()).toBe(EstadoPedido.PENDIENTE);
    });

    test("getFechaCreacion() retorna una fecha válida", () => {
      const fecha = pedido.getFechaCreacion();
      expect(fecha).toBeInstanceOf(Date);
    });

    test("getHistorialEstados() retorna array vacío al inicio", () => {
      expect(pedido.getHistorialEstados()).toHaveLength(0);
    });

    test("getMoneda() retorna la moneda del pedido", () => {
      expect(pedido.getMoneda()).toBe("ARS");
    });
  });

  // ========================
  // Tests de toJSONResumen
  // ========================
  describe("toJSONResumen()", () => {
    test("retorna objeto JSON con estructura correcta", () => {
      const json = pedido.toJSONResumen();
      expect(json).toHaveProperty("id");
      expect(json).toHaveProperty("items");
      expect(json).toHaveProperty("estado");
      expect(json).toHaveProperty("direccionEntrega");
      expect(json).toHaveProperty("compradorId");
      expect(json).toHaveProperty("fechaCreacion");
      expect(json).toHaveProperty("total");
    });

    test("incluye todos los items en el resumen", () => {
      const json = pedido.toJSONResumen();
      expect(json.items).toHaveLength(2);
      expect(json.items[0]).toHaveProperty("productoId");
      expect(json.items[0]).toHaveProperty("cantidad");
      expect(json.items[0]).toHaveProperty("precioUnitario");
    });

    test("calcula el total correctamente en el resumen", () => {
      const json = pedido.toJSONResumen();
      expect(json.total).toBe(350);
    });
  });

  // ========================
  // Tests de inicialización
  // ========================
  describe("Inicialización", () => {
    test("inicializa con estado PENDIENTE", () => {
      expect(pedido.estado).toBe(EstadoPedido.PENDIENTE);
    });

    test("inicializa con fechaCreacion como Date", () => {
      expect(pedido.fechaCreacion).toBeInstanceOf(Date);
    });

    test("inicializa con historialEstados vacío", () => {
      expect(pedido.historialEstados).toEqual([]);
    });

    test("inicializa con id null", () => {
      expect(pedido.id).toBeNull();
    });

    test("convierte items a array si se recibe array", () => {
      const items = [item(1, 2, 100)];
      const p = new Pedido("comp-1", items, "ARS", {});
      expect(Array.isArray(p.items)).toBe(true);
    });
  });
});
