import { PedidoModel } from "../models/PedidoModel.js";

export class PedidoRepository {

  async save(pedido) {
    try {
      if (pedido._id) {
        // Actualizar pedido existente
        return await PedidoModel.findByIdAndUpdate(
          pedido._id,
          pedido,
          { new: true, lean: true }
        );
      } else {
        // Crear nuevo pedido
        const pedidoNuevo = new PedidoModel(pedido);
        return await pedidoNuevo.save();
      }
    } catch (error) {
      throw new Error(`Error al guardar pedido: ${error.message}`);
    }
  }

  async create(pedidoData) {
    try {
      const pedido = new PedidoModel(pedidoData);
      return await pedido.save();
    } catch (error) {
      throw new Error(`Error al crear Pedido: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await PedidoModel.find().lean();
    } catch (error) {
      throw new Error(`Error al buscar pedidos: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await PedidoModel.findById(id)
        .populate({
          path: "items.productoId",
          select: "titulo fotos precio vendedor"
        })
        .lean(false);

    } catch (error) {
      throw new Error(`Error al buscar pedido: ${error.message}`);
    }
  }

  async updateById(id, datos) {
    try {
      return await PedidoModel.findByIdAndUpdate(id, datos, { new: true, lean: true });
    } catch (error) {
      throw new Error(`Error al actualizar pedido: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await PedidoModel.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error al eliminar pedido: ${error.message}`);
    }
  }

  async findByIdAndUpdateEstado(pedidoId, nuevoEstado, quien, motivo = null) {
    try {
      // Validación básica
      if (!pedidoId) throw new Error("ID de pedido no proporcionado");
      if (!nuevoEstado) throw new Error("Nuevo estado no proporcionado");

      // Construir el cambio de estado para historialEstados
      const cambio = {
        fecha: new Date(),
        estado: nuevoEstado,
        quien: quien,
        motivo: motivo
      };

      // Actualización: cambia estado y registra historial
      const updatedPedido = await PedidoModel.findByIdAndUpdate(
        pedidoId,
        {
          $set: { estado: nuevoEstado },
          $push: { historialEstados: cambio }
        },
        {
          new: true,          // Devuelve el documento actualizado
          lean: true,         // Devuelve objeto plano (no documento Mongoose)
          runValidators: true // Aplica validaciones del schema
        }
      );

      if (!updatedPedido) {
        throw new Error(`No se encontró el pedido con ID ${pedidoId}`);
      }

      return updatedPedido;
    } catch (error) {
      throw new Error(`Error al actualizar estado del pedido: ${error.message}`);
    }
  }

  async findByCompradorId(usuarioId, orden = "desc") {
    try {
      return await PedidoModel.find({ compradorId: usuarioId })
        .populate({
          path: "items.productoId",
          select: "titulo fotos"
        })
        .sort({ fechaCreacion: orden === "asc" ? 1 : -1 })
        .lean();
    } catch (error) {
      throw new Error(`Error al buscar pedidos del usuario: ${error.message}`);
    }
  }

  async findByVendedor(vendedorId, orden = "desc") {
    try {
      const pedidos = await PedidoModel.aggregate([
        {
          $lookup: {
            from: "productos",
            localField: "items.productoId",
            foreignField: "_id",
            as: "productosInfo"
          }
        },
        {
          $addFields: {
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    {
                      productoId: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$productosInfo",
                              cond: { $eq: ["$$this._id", "$$item.productoId"] }
                            }
                          },
                          0
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $addFields: {
            items: {
              $filter: {
                input: "$items",
                cond: { $eq: ["$$this.productoId.vendedor", vendedorId] }
              }
            }
          }
        },
        {
          $match: {
            "items.0": { $exists: true }
          }
        },
        {
          $sort: {
            fechaCreacion: orden === "asc" ? 1 : -1
          }
        },
        {
          $project: {
            productosInfo: 0
          }
        }
      ]);

      return pedidos;
    } catch (error) {
      throw new Error(`Error al buscar pedidos del vendedor: ${error.message}`);
    }
  }
}