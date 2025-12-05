import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import { createNotificacionesRouter } from "../../routes/notificacionesRoutes.js";
import { NotificacionesController } from "../../controllers/notificacionesController.js";
import { NotificacionesService } from "../../services/notificacionesService.js";
import { PedidoController } from "../../controllers/pedidoController.js";
import { PedidoService } from "../../services/pedidoService.js";
import { ProductoService } from "../../services/productoService.js";
import { ProductoController } from "../../controllers/productoController.js";
import { NotificacionesRepository } from "../../repositories/notificacionesRepository.js";
import { UsuarioRepository } from "../../repositories/usuarioRepository.js";
import { PedidoRepository } from "../../repositories/pedidoRepository.js";
import { ProductoRepository } from "../../repositories/productoRepository.js";
import { connect, closeDatabase, clearDatabase } from "../utils/mongoMemory.js";
import { TestDataFactory } from "../fixtures/testData.js";
import { Usuario } from "../../models/Usuario.js";
import mongoose from "mongoose";
import { describe, test, expect, beforeEach, beforeAll, afterAll, afterEach } from "@jest/globals";
import { generateMockToken, mockAuthMiddleware } from "../utils/authHelper.js";

/**
 * Notificaciones API Integration Tests con BD en memoria
 */
let app;
let usuario;
let usuarioToken;
let notificacionesRepository;
let usuarioRepository;

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

function setupExpress() {
  app = express();
  app.use(bodyParser.json());

  // Crear instancias de repositorios GLOBALES para compartirlas con los tests
  notificacionesRepository = new NotificacionesRepository();
  usuarioRepository = new MockUsuarioRepository();  // Usar mock que no necesita Clerk
  const pedidoRepository = new PedidoRepository();
  const productoRepository = new ProductoRepository();

  // Crear servicios
  const notificacionesService = new NotificacionesService(
    notificacionesRepository,
    usuarioRepository
  );
  const productoService = new ProductoService(productoRepository, usuarioRepository);
  const pedidoService = new PedidoService(
    pedidoRepository,
    productoService,
    usuarioRepository,
    notificacionesService
  );

  // Crear controladores
  const notificacionesController = new NotificacionesController(notificacionesService);
  const productoController = new ProductoController(productoService);
  const pedidoController = new PedidoController(pedidoService);

  // Router para usuarios (rutas autenticadas)
  const usuarioRouter = express.Router();
  usuarioRouter.get("/pedidos", mockAuthMiddleware(), (req, res) => 
    pedidoController.historialPedidosUsuario(req, res)
  );
  usuarioRouter.get("/notificaciones/no-leidas", mockAuthMiddleware(), (req, res) => 
    notificacionesController.obtenerNotificacionesNoLeidas(req, res)
  );
  usuarioRouter.get("/notificaciones/leidas", mockAuthMiddleware(), (req, res) => 
    notificacionesController.obtenerNotificacionesLeidas(req, res)
  );

  // Router de notificaciones con middleware mock
  const notificacionesRouter = express.Router();
  notificacionesRouter.patch("/:id/read", mockAuthMiddleware(), (req, res) => 
    notificacionesController.marcarComoLeida(req, res)
  );

  // Montar routers
  app.use("/usuarios", usuarioRouter);
  app.use("/notificaciones", notificacionesRouter);
}

// Crear datos de prueba antes de cada test
beforeEach(async () => {
  const usuarioData = TestDataFactory.createUsuario({
    nombre: "Juan Usuario"
  });
  usuario = await Usuario.create(usuarioData);
  usuarioToken = generateMockToken(usuario._id.toString(), 'comprador');
});

describe("API Notificaciones - Integration Tests (BD Real)", () => {
  describe("GET /usuarios/notificaciones/no-leidas", () => {
    test("Retorna lista vacía cuando no hay notificaciones no leídas", async () => {
      const res = await request(app)
        .get("/usuarios/notificaciones/no-leidas")
        .set('Authorization', `Bearer ${usuarioToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    test("Retorna notificaciones no leídas del usuario", async () => {
      // Crear notificaciones no leídas usando el repositorio global
      const notif1 = TestDataFactory.createNotificacion(usuario, {
        leida: false,
        titulo: "Pedido confirmado"
      });
      const notif2 = TestDataFactory.createNotificacion(usuario, {
        leida: false,
        titulo: "Pedido enviado"
      });

      await notificacionesRepository.create(notif1);
      await notificacionesRepository.create(notif2);

      const res = await request(app)
        .get("/usuarios/notificaciones/no-leidas")
        .set('Authorization', `Bearer ${usuarioToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].leida).toBe(false);
    });
  });

  describe("GET /usuarios/notificaciones/leidas", () => {
    test("Retorna lista vacía cuando no hay notificaciones leídas", async () => {
      const res = await request(app)
        .get("/usuarios/notificaciones/leidas")
        .set('Authorization', `Bearer ${usuarioToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    test("Retorna notificaciones leídas del usuario", async () => {
      // Crear notificaciones leídas usando el repositorio global
      const notif1 = TestDataFactory.createNotificacion(usuario, {
        leida: true,
        titulo: "Pedido entregado"
      });
      const notif2 = TestDataFactory.createNotificacion(usuario, {
        leida: true,
        titulo: "Pago confirmado"
      });

      await notificacionesRepository.create(notif1);
      await notificacionesRepository.create(notif2);

      const res = await request(app)
        .get("/usuarios/notificaciones/leidas")
        .set('Authorization', `Bearer ${usuarioToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].leida).toBe(true);
    });
  });

  describe("PATCH /notificaciones/:id/read", () => {
    test("Marcar notificación como leída con éxito", async () => {
      // Crear una notificación no leída
      const notificacionesRepository = new NotificacionesRepository();
      const notif = TestDataFactory.createNotificacion(usuario, {
        leida: false
      });
      const notifCreada = await notificacionesRepository.create(notif);

      const res = await request(app)
        .patch(`/notificaciones/${notifCreada._id.toString()}/read`)
        .set('Authorization', `Bearer ${usuarioToken}`)
        .expect(200);


      expect(res.body.notificacion.leida).toBe(true);
    });

    test("Error con ID de notificación inválido", async () => {
      const res = await request(app)
        .patch("/notificaciones/invalid-id/read")
        .set('Authorization', `Bearer ${usuarioToken}`)
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    test("Error cuando la notificación no existe", async () => {
      const notifIdInexistente = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/notificaciones/${notifIdInexistente}/read`)
        .set('Authorization', `Bearer ${usuarioToken}`)
        .expect(404);

      expect(res.body).toHaveProperty("error");
    });

    test("Error al intentar marcar como leída una notificación ya leída", async () => {
      // Crear una notificación leída
      const notificacionesRepository = new NotificacionesRepository();
      const notif = TestDataFactory.createNotificacion(usuario, {
        leida: true
      });
      const notifCreada = await notificacionesRepository.create(notif);

      const res = await request(app)
        .patch(`/notificaciones/${notifCreada._id.toString()}/read`)
        .set('Authorization', `Bearer ${usuarioToken}`)
        .expect(409);

      expect(res.body).toHaveProperty("error");
    });
  });
});
