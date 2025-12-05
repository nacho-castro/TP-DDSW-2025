import express from 'express';
import { withAuth, requireVendedor } from "../middleware/auth.js";

export function createProductoRouter(productoController) {
    const router = express.Router();

    router.post("/", withAuth(), requireVendedor(), (req, res) => productoController.crearProducto(req, res));
    router.get("/", (req, res) => productoController.listarProductos(req, res));
    router.put("/:id", withAuth(), requireVendedor(), (req, res) => productoController.actualizarProducto(req, res));
    router.delete("/:id", withAuth(), requireVendedor(), (req, res) => productoController.eliminarProducto(req, res));
    router.get("/categorias", (req, res) => productoController.obtenerCategorias(req, res));

    return router;
}