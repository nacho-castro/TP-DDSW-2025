import mongoose from "mongoose";

const ItemPedidoSchema = new mongoose.Schema({
  productoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: true
  },
  cantidad: {
    type: Number,
    required: true
  },
  precioUnitario: {
    type: Number,
    required: true
  }
});

const HistorialEstadoSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ["PENDIENTE", "CONFIRMADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO", "CANCELADO"],
    required: true
  },
  quien: { type: String, required: true },
  motivo: { type: String }
});

const PedidoSchema = new mongoose.Schema({
  compradorId: {
    type: String,
    required: true,
    index: true
  },
  items: [ItemPedidoSchema],
  moneda: {
    type: String,
    enum: ["PESO_ARG", "DOLAR_USA", "REAL"],
    required: true
  },
  direccionEntrega: {
    type: Object,
    required: true
  },
  estado: {
    type: String,
    enum: ["PENDIENTE", "CONFIRMADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO", "CANCELADO"],
    default: "PENDIENTE"
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  historialEstados: [HistorialEstadoSchema]
});

export const PedidoModel = mongoose.model("Pedido", PedidoSchema);