import express from "express";
import { withAuth } from '../middleware/auth.js';

export function createNotificacionesRouter(notificacionesController) {
  const router = express.Router();

  router.patch("/:id/read", withAuth(), notificacionesController.marcarComoLeida);

  return router;
}