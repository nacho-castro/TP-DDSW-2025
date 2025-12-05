import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import { createPedidoRouter } from "../../routes/pedidoRoutes.js";
import { PedidoController } from "../../controllers/pedidoController.js";
import { PedidoService } from "../../services/pedidoService.js";
import { ProductoService } from "../../services/productoService.js";
import { NotificacionesService } from "../../services/notificacionesService.js";
import { PedidoRepository } from "../../repositories/pedidoRepository.js";
import { ProductoRepository } from "../../repositories/productoRepository.js";
import { UsuarioRepository } from "../../repositories/usuarioRepository.js";
import { NotificacionesRepository } from "../../repositories/notificacionesRepository.js";
import { connect, closeDatabase, clearDatabase } from "../utils/mongoMemory.js";
import { TestDataFactory } from "../fixtures/testData.js";
import { Usuario } from "../../models/Usuario.js";
import { EstadoPedido } from "../../domain/pedido/enums.js";
import { describe, test, expect, beforeEach, beforeAll, afterAll, afterEach } from "@jest/globals";
import { generateMockToken, mockAuthMiddleware, mockRequireComprador, mockRequireVendedor } from "../utils/authHelper.js";

/**
 * Pedido API Integration Tests con BD en memoria
 */
let app;
let comprador;
let vendedor;
let producto;
let compradorToken;
let vendedorToken;

// Mock de UsuarioRepository para tests - usa Mongoose en lugar de Clerk
class MockUsuarioRepository {
  async findById(id) {
    return await Usuario.findById(id);
  }

  async findByEmail(email) {
    return await Usuario.findOne({ email });
  }

  async save(usuario) {
    const actualizado = await Usuario.findByIdAndUpdate(usuario._id, usuario, { new: true });
    return actualizado;
  }

  async create(usuarioData) {
    return await Usuario.create(usuarioData);
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const usuarios = await Usuario.find().skip(skip).limit(limit);
    const total = await Usuario.countDocuments();
    return {
      pagina: page,
      perPage: limit,
      totalColecciones: total,
      totalPaginas: Math.ceil(total / limit),
      data: usuarios
    };
  }

  async delete(id) {
    return await Usuario.findByIdAndRemove(id);
  }
}

// Conectar a BD en memoria antes de todas las pruebas
beforeAll(async () => {
  await connect();
  setupExpress();
});

// Limpiar BD después de cada test
afterEach(async () => {
  await clearDatabase();
});

// Desconectar después de todas las pruebas
afterAll(async () => {
  await closeDatabase();
});

function setupExpress() {
  app = express();
  app.use(bodyParser.json());

  // Crear instancias de repositorios (usar los reales con BD en memoria)
  const usuarioRepository = new MockUsuarioRepository();  // Usar mock que no necesita Clerk
  const productoRepository = new ProductoRepository();
  const pedidoRepository = new PedidoRepository();
  const notificacionesRepository = new NotificacionesRepository();

  // Crear servicios
  const productoService = new ProductoService(productoRepository, usuarioRepository);
  const notificacionesService = new NotificacionesService(
    notificacionesRepository,
    usuarioRepository
  );
  const pedidoService = new PedidoService(
    pedidoRepository,
    productoService,
    usuarioRepository,
    notificacionesService
  );

  // Crear controladores
  const pedidoController = new PedidoController(pedidoService);

  // Mock del notificacionesController (para rutas que lo requieren)
  const mockNotificacionesController = {
    obtenerNotificacionesNoLeidas: (req, res) => res.json([]),
    obtenerNotificacionesLeidas: (req, res) => res.json([])
  };

  // Mock del productoController (para rutas que lo requieren)
  const mockProductoController = {
    buscarProductoPorVendedor: (req, res) => res.json([])
  };

  // Crear un router con middlewares mock en lugar de usar el router real
  const pedidoRouter = express.Router();
  pedidoRouter.post("/", mockAuthMiddleware(), mockRequireComprador(), pedidoController.crearPedido);
  pedidoRouter.get("/vendedor", mockAuthMiddleware(), mockRequireVendedor(), pedidoController.historialPedidosVendedor);
  pedidoRouter.delete("/:pedidoId", mockAuthMiddleware(), mockRequireComprador(), pedidoController.cancelarPedido);
  pedidoRouter.patch("/:pedidoId/enviado", mockAuthMiddleware(), mockRequireVendedor(), pedidoController.marcarPedidoEnviado);
  pedidoRouter.patch("/:pedidoId/confirmar", mockAuthMiddleware(), mockRequireComprador(), pedidoController.marcarPedidoConfirmado);

  // Router para usuarios con rutas de pedidos autenticadas
  const usuarioRouter = express.Router();
  usuarioRouter.get("/pedidos", mockAuthMiddleware(), mockRequireComprador(), (req, res) => 
    pedidoController.historialPedidosUsuario(req, res)
  );

  // Montar routers
  app.use("/pedidos", pedidoRouter);
  app.use("/usuarios", usuarioRouter);
}

// Crear datos de prueba antes de cada test
beforeEach(async () => {
  // Crear usuarios en la BD
  const compradorData = TestDataFactory.createUsuario({
    nombre: "Juan Comprador",
    rol: "comprador"
  });
  comprador = await Usuario.create(compradorData);
  compradorToken = generateMockToken(comprador._id.toString(), 'comprador');

  const vendedorData = TestDataFactory.createUsuario({
    nombre: "María Vendedora",
    rol: "vendedor"
  });
  vendedor = await Usuario.create(vendedorData);
  vendedorToken = generateMockToken(vendedor._id.toString(), 'vendedor');

  // Crear producto en la BD
  const productoRepository = new ProductoRepository();
  const productoData = TestDataFactory.createProducto(vendedor, {
    stock: 50,
    precio: 5000
  });
  producto = await productoRepository.create(productoData);
});

describe("API Pedidos - Integration Tests", () => {
  describe("POST /pedidos - Crear pedido", () => {
    test("Crea un pedido exitosamente", async () => {
      const res = await request(app)
        .post("/pedidos")
        .set('Authorization', `Bearer ${compradorToken}`)
        .send({
          items: [
            {
              productoId: producto._id.toString(),
              cantidad: 2
            }
          ],
          moneda: "PESO_ARG",
          direccionEntrega: {
            calle: "Av. Corrientes",
            altura: 1234,
            codPostal: "1043",
            ciudad: "Buenos Aires",
            provincia: "Buenos Aires",
            pais: "Argentina"
          }
        })
        .expect(201);

      expect(res.body).toHaveProperty("pedidoId");
      expect(res.body).toHaveProperty("message", "Pedido creado con éxito");
    });

    test("Error si faltan campos obligatorios", async () => {
      const res = await request(app)
        .post("/pedidos")
        .set('Authorization', `Bearer ${compradorToken}`)
        .send({
          items: [],
          moneda: "PESO_ARG"
        })
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });
  });

  describe("DELETE /pedidos/:pedidoId - Cancelar pedido", () => {
    test("Cancela pedido exitosamente", async () => {
      // Crear un pedido
      const pedidoRepository = new PedidoRepository();
      const pedidoData = TestDataFactory.createPedido(comprador, {
        vendedorId: vendedor._id,
        items: [
          TestDataFactory.createItemPedido(producto._id, {
            cantidad: 2,
            vendedorId: vendedor._id
          })
        ]
      });
      const pedido = await pedidoRepository.create(pedidoData);

      const res = await request(app)
        .delete(`/pedidos/${pedido._id.toString()}`)
        .set('Authorization', `Bearer ${compradorToken}`)
        .send({ compradorId: comprador._id.toString() })
        .expect(200);

      expect(res.body).toHaveProperty("message", "Pedido cancelado con éxito");
    });

    test("Error al cancelar con comprador no autorizado", async () => {
      // Crear un pedido
      const pedidoRepository = new PedidoRepository();
      const pedidoData = TestDataFactory.createPedido(comprador, {
        vendedorId: vendedor._id
      });
      const pedido = await pedidoRepository.create(pedidoData);

      // Crear otro comprador
      const otraCompradora = await Usuario.create(
        TestDataFactory.createUsuario({ nombre: "Otro comprador" })
      );

      const otraCompradoraToken = generateMockToken(otraCompradora._id.toString(), 'comprador');

      const res = await request(app)
        .delete(`/pedidos/${pedido._id.toString()}`)
        .set('Authorization', `Bearer ${otraCompradoraToken}`)
        .send({ compradorId: otraCompradora._id.toString() })
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });
  });

  describe("GET /usuarios/pedidos - Obtener pedidos del usuario autenticado", () => {
    test("Obtener pedidos del usuario exitosamente", async () => {
      // Crear un pedido
      const pedidoRepository = new PedidoRepository();
      const pedidoData = TestDataFactory.createPedido(comprador, {
        vendedorId: vendedor._id,
        items: [
          TestDataFactory.createItemPedido(producto._id, {
            cantidad: 1,
            vendedorId: vendedor._id
          })
        ]
      });
      await pedidoRepository.create(pedidoData);

      const res = await request(app)
        .get("/usuarios/pedidos")
        .set('Authorization', `Bearer ${compradorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });

    test("Retorna lista vacía si usuario no tiene pedidos", async () => {
      const res = await request(app)
        .get("/usuarios/pedidos")
        .set('Authorization', `Bearer ${compradorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe("PATCH /pedidos/:pedidoId/enviado - Marcar como enviado", () => {
    test("Marca pedido como enviado exitosamente", async () => {
      // Crear un pedido en estado CONFIRMADO
      const pedidoRepository = new PedidoRepository();
      const pedidoData = TestDataFactory.createPedido(comprador, {
        vendedorId: vendedor._id,
        estado: EstadoPedido.CONFIRMADO,
        items: [
          TestDataFactory.createItemPedido(producto._id, {
            cantidad: 1,
            vendedorId: vendedor._id
          })
        ]
      });
      const pedido = await pedidoRepository.create(pedidoData);

      const res = await request(app)
        .patch(`/pedidos/${pedido._id.toString()}/enviado`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ vendedorId: vendedor._id.toString() })
        .expect(200);


      expect(res.body).toHaveProperty("estado", EstadoPedido.ENVIADO);
    });
  });
});
