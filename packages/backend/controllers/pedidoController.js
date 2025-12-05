import { z, ZodError } from "zod";

export class PedidoController {
  constructor(pedidoService) {
    this.pedidoService = pedidoService;
  }

  crearPedido = async (req, res) => {
    try {
      const body = crearPedidoSchema.parse(req.body);
      const { items, moneda, direccionEntrega } = body;
      const compradorId = req.userId;

      const pedido = await this.pedidoService.crearPedido(compradorId, items, moneda, direccionEntrega);
      res.status(201).json({
        message: "Pedido creado con éxito",
        pedidoId: pedido.id,
      });

    } catch (err) {
        if (err?.issues) {
          return res.status(400).json({
            error: "Error de validación",
            detalles: err.issues
          });
        }
        res.status(500).json({ error: err.message });
    }
  };


  cancelarPedido = async (req, res) => {
    try {
      const { pedidoId } = req.params;
      const compradorId = req.userId;
      const pedido = await this.pedidoService.cancelarPedido(pedidoId, compradorId);
      res.json({
        message: "Pedido cancelado con éxito",
        pedido: pedido.id,
        estado: pedido.estado
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  historialPedidosUsuario = async (req, res) => {
    try {
      const usuarioId = req.userId;
      const orden = req.query.orden === "asc" ? "asc" : "desc";

      const pedidos = await this.pedidoService.obtenerPedidosDeUsuario(usuarioId, orden);
      res.json(pedidos);

    } catch (err) {
      console.error("Error en historialPedidosUsuario:", err.message);
      res.status(400).json({ error: err.message });
    }

  };

  historialPedidosVendedor = async (req, res) => {
    try {
      const vendedorId = req.userId;
      const orden = req.query.orden === "asc" ? "asc" : "desc";

      const pedidos = await this.pedidoService.obtenerPedidosDeVendedor(vendedorId, orden);

      res.json(pedidos);

    } catch (err) {
      console.error("Error en historialPedidosVendedor:", err.message);
      res.status(400).json({ error: err.message });
    }

  };

  marcarPedidoEnviado = async (req, res) => {
    try {
      const { pedidoId } = req.params;
      const vendedorId = req.userId;
      const pedido = await this.pedidoService.marcarComoEnviado(pedidoId, vendedorId);
      res.json({
        message: "Pedido marcado como enviado",
        pedido: pedido.id,
        estado: pedido.estado
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  marcarPedidoConfirmado = async (req, res) => {
    try {
      const { pedidoId } = req.params;
      const vendedorId = req.userId;
      const pedido = await this.pedidoService.marcarComoConfirmado(pedidoId, vendedorId);

      res.json({
        message: "Pedido confirmado correctamente",
        pedido: pedido.id,
        estado: pedido.estado
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
}

const direccionSchema = z.object({
  calle: z.string({ required_error: "La calle es obligatoria" }).min(1, "La calle es obligatoria"),
  altura: z.number().int().positive(),
  codPostal: z.string().min(1, "El código postal es obligatorio"),
  ciudad: z.string().min(1, "La ciudad es obligatoria"),
  provincia: z.string().min(1, "La provincia es obligatoria"),
  pais: z.string().min(1, "El país es obligatorio"),
  piso: z.string().optional(),
  departamento: z.string().optional(),
  lat: z.number().refine(v => v >= -90 && v <= 90, "Latitud inválida").optional(),
  lon: z.number().refine(v => v >= -180 && v <= 180, "Longitud inválida").optional()
});

export const crearPedidoSchema = z.object({
  items: z.array(
    z.object({
      productoId: z.string().regex(/^[a-fA-F0-9]{24}$/, "productoId debe ser un ObjectId válido"),
      cantidad: z.number().int().positive("Cantidad debe ser positiva"),
    })
  ).min(1, "Debe incluir al menos un item"),
  moneda: z.enum(["DOLAR_USA", "PESO_ARG", "REAL"], { message: "Moneda inválida" }),
  direccionEntrega: direccionSchema
});