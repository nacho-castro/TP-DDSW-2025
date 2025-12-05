import express from 'express';
import { withAuth, requireComprador, requireVendedor } from '../middleware/auth.js';

export function createUsuarioRouter(usuarioController, productoController, pedidoController, notificacionesController) {
    const router = express.Router();

    router.post("/registro", withAuth({ requireRegistration: false }), usuarioController.registrarUsuario);
    router.get("/productos", withAuth(), requireVendedor(), (req, res) => productoController.buscarProductoPorVendedor(req, res));
    router.get("/pedidos", withAuth(), requireComprador(), pedidoController.historialPedidosUsuario);
    router.get("/notificaciones/no-leidas", withAuth(), notificacionesController.obtenerNotificacionesNoLeidas);
    router.get("/notificaciones/leidas", withAuth(), notificacionesController.obtenerNotificacionesLeidas);

    return router;
}