import { z } from "zod";

export class ProductoController {
  constructor(productoService) {
    this.productoService = productoService;
  }

  async crearProducto(req, res) {
    try {
      const body = ProductoSchema.parse(req.body);
      const { ...productoData } = body;
      const usuarioId = req.userId;

      const productoCreado = await this.productoService.crearProducto(productoData, usuarioId);

      if (!productoCreado) {
        return res.status(204).send();
      }
      res.status(201).json(productoCreado);

    } catch (err) {
      if (err?.issues) {
        return res.status(400).json({
          error: "Error de validación",
          detalles: err.issues
        });
      }
      res.status(500).json({ error: err.message });
    }
  }

  // GET: todos los productos paginados
  async listarProductos(req, res) {
    try {
      const { page = 1, limit = 10, nombre, descripcion, categoria, precioMin, precioMax, sort, vendedorId } = req.query;

      const filtros = {
        nombre,
        descripcion,
        categoria,
        precioMin: precioMin ? Number(precioMin) : undefined,
        precioMax: precioMax ? Number(precioMax) : undefined
      };

      const productosPaginados = await this.productoService.listarProductos(page, limit, filtros, sort, vendedorId);

      if (!productosPaginados || productosPaginados.length === 0) {
        return res.status(204).send();
      }
      res.status(200).json(productosPaginados);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async buscarProductoPorVendedor(req, res) {
    try {
      const { page = 1, limit = 10, nombre, descripcion, categoria, precioMin, precioMax, sort } = req.query;
      const vendedorId = req.userId;

      const filtros = {
        nombre,
        descripcion,
        categoria,
        precioMin: precioMin ? Number(precioMin) : undefined,
        precioMax: precioMax ? Number(precioMax) : undefined
      };

      const productosPaginados = await this.productoService.buscarProductosVendedor(page, limit, filtros, sort, vendedorId);

      if (!productosPaginados || productosPaginados.length === 0) {
        return res.status(204).send();
      }
      res.status(200).json(productosPaginados);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // PUT: Actualizar producto
  async actualizarProducto(req, res) {
    try {
      const datos = ProductoUpdateSchema.parse(req.body);
      const { id } = req.params;

      const productoActualizado = await this.productoService.actualizarProducto(id, datos);

      if (!productoActualizado) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.status(200).json(productoActualizado);

    } catch (err) {
      if (err?.issues) {
        return res.status(400).json({
          error: "Error de validación",
          detalles: err.issues
        });
      }
      res.status(500).json({ error: err.message });
    }
  }

  //DELETE producto by Id
  async eliminarProducto(req, res) {
    try {
      const { id } = req.params;
      const eliminado = await this.productoService.eliminarProducto(id);

      if (!eliminado) return res.status(404).json({ message: "Producto no encontrado" });

      res.status(200).json({ message: "Producto eliminado correctamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // GET: categorias
  async obtenerCategorias(req, res) {
    try {
      const categorias = await this.productoService.obtenerCategorias();

      if (!categorias || categorias.length === 0) {
        return res.status(204).send();
      }
      res.status(200).json(categorias);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
}

export const ProductoSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio"),
  descripcion: z.string().min(1, "La descripción es obligatoria"),
  precio: z.number().positive("El precio debe ser un número positivo"),
  moneda: z.enum(["DOLAR_USA", "PESO_ARG", "REAL"], {
    message: "Moneda inválida",
  }),
  stock: z.number().int().nonnegative("El stock debe ser un número entero positivo o cero"),
  categorias: z.array(
    z.string().regex(/^[a-fA-F0-9]{24}$/, "Cada categoría debe ser un ObjectId válido")
  )
    .optional(),
  fotos: z.array(z.string().url("Debe ser una URL válida")).optional(),
  activo: z.boolean().optional(),
});

// Schema de actualización (PUT / PATCH)
export const ProductoUpdateSchema = ProductoSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Debe proporcionar al menos un campo para actualizar",
  }
);