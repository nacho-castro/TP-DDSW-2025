import express from "express";
import { withAuth, requireComprador, requireVendedor } from "../middleware/auth.js";

export function createPedidoRouter(pedidoController) {
  const router = express.Router();

  router.post("/", withAuth(), requireComprador(), pedidoController.crearPedido);
  router.get("/vendedor", withAuth(), requireVendedor(), pedidoController.historialPedidosVendedor);
  router.delete("/:pedidoId", withAuth(), requireComprador(), pedidoController.cancelarPedido);
  router.patch("/:pedidoId/enviado", withAuth(), requireVendedor(), pedidoController.marcarPedidoEnviado);
  router.patch("/:pedidoId/confirmar", withAuth(), requireComprador(), pedidoController.marcarPedidoConfirmado);

  return router;
}
