import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express';
import { createPedidoRouter } from "./routes/pedidoRoutes.js";
import { PedidoRepository } from "./repositories/pedidoRepository.js";
import { PedidoService } from "./services/pedidoService.js";
import { PedidoController } from "./controllers/pedidoController.js";
import {ProductoRepository} from "./repositories/productoRepository.js";
import { createProductoRouter } from "./routes/productoRoutes.js";
import {ProductoService} from "./services/productoService.js";
import { createNotificacionesRouter } from "./routes/notificacionesRoutes.js";
import { NotificacionesRepository } from "./repositories/notificacionesRepository.js";
import { UsuarioRepository } from "./repositories/usuarioRepository.js";
import { NotificacionesService } from "./services/notificacionesService.js";
import { NotificacionesController } from "./controllers/notificacionesController.js";
import { UsuarioService } from "./services/usuarioService.js";
import { UsuarioController } from "./controllers/usuarioController.js";
import { connectDB } from "./config/database.js";
import { runMigrations } from "./config/migrations.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import { ProductoController } from "./controllers/productoController.js";
import { createUsuarioRouter } from "./routes/usuarioRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  }),
);

app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
}));

// Conectar a MongoDB
await connectDB();

// Ejecutar migraciones
await runMigrations();


// Health endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Instancias compartidas
//repository
const pedidoRepository = new PedidoRepository();
const productoRepository = new ProductoRepository();
const usuarioRepository = new UsuarioRepository();
const notificacionesRepository = new NotificacionesRepository();

//service
const productoService = new ProductoService(productoRepository, usuarioRepository);
const notificacionesService = new NotificacionesService(notificacionesRepository, usuarioRepository);
const pedidoService = new PedidoService(pedidoRepository, productoService, usuarioRepository, notificacionesService);
const usuarioService = new UsuarioService(usuarioRepository);

//controller
const productoController = new ProductoController(productoService);
const notificacionesController = new NotificacionesController(notificacionesService);
const pedidoController = new PedidoController(pedidoService);
const usuarioController = new UsuarioController(usuarioService);

// Usar router con controller inyectado
app.use("/pedidos", createPedidoRouter(pedidoController));
app.use("/productos", createProductoRouter(productoController));
app.use("/notificaciones", createNotificacionesRouter(notificacionesController));
app.use("/usuarios", createUsuarioRouter(usuarioController, productoController, pedidoController, notificacionesController));

const swaggerDocument = YAML.load(path.join(__dirname, "docs", "api-docs.yaml"));

// Configurar el servidor dinámicamente basado en el host y puerto
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
swaggerDocument.servers = [
  {
    url: `http://${HOST}:${PORT}`,
    description: 'Servidor de la aplicación'
  }
];

// Configuración de Swagger UI con opciones para evitar CORS
const swaggerOptions = {
  swaggerOptions: {
    requestInterceptor: (request) => {
      request.headers['Access-Control-Allow-Origin'] = '*';
      return request;
    },
    responseInterceptor: (response) => {
      return response;
    }
  }
};

// Servir Swagger UI en /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});
