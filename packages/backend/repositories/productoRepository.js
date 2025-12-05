import { Producto } from "../models/Producto.js";
import { Categoria } from "../models/Producto.js";
import mongoose from 'mongoose';

export class ProductoRepository {

    // ===== Crear o actualizar producto =====
    async save(producto) {
        try {
            if (producto._id) {
                // Actualizar producto existente
                const productoExistente = await Producto.findById(producto._id);
                if (!productoExistente) {
                    throw new Error(`Producto con ID ${producto._id} no encontrado`);
                }

                // Fusionar solo los campos enviados
                Object.assign(productoExistente, producto);

                // Guardar conservando los campos no enviados
                return await productoExistente.save();
            } else {
                // Crear nuevo producto
                const nuevoProducto = new Producto(producto);
                return await nuevoProducto.save();
            }
        } catch (error) {
            throw new Error(`Error al guardar producto: ${error.message}`);
        }
    }

    // ===== Crear producto =====
    async create(productoData) {
        try {
            const producto = new Producto(productoData);
            return await producto.save();
        } catch (error) {
            throw new Error(`Error al crear Producto: ${error.message}`);
        }
    }

    // ===== Actualizar producto por Id =====
    async updateById(id, datos) {
        try {
            return await Producto.findByIdAndUpdate(id, datos, { new: true, lean: true });
        } catch (error) {
            throw new Error(`Error al actualizar producto: ${error.message}`);
        }
    }

    // ===== Buscar producto por Id =====
    async findById(id) {
        try {
            return await Producto.findById(id).lean();
        } catch (error) {
            throw new Error(`Error al buscar producto: ${error.message}`);
        }
    }

    // ===== Eliminar producto =====
    async delete(id) {
        try {
            return await Producto.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Error al eliminar producto: ${error.message}`);
        }
    }

    // ===== Buscar todos con paginación + filtros + orden =====
    async findByPage(numeroPagina = 1, elementosXPagina = 10, filtros = {}, sortParam = null, vendedorId = null) {
        const skip = (numeroPagina - 1) * elementosXPagina;
        const query = buildQuery(filtros, vendedorId);
        const sortOptions = buildSort(sortParam);

        return await Producto.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(elementosXPagina)
            .lean();
    }

    // ===== Buscar por vendedor con filtros + paginación =====
    async findByVendedor(numeroPagina = 1, elementosXPagina = 10, filtros = {}, sortParam = null, vendedorId) {
        const skip = (numeroPagina - 1) * elementosXPagina;
        const query = buildQuery(filtros, vendedorId);
        const sortOptions = buildSort(sortParam);

        return await Producto.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(elementosXPagina)
            .lean();
    }

    // ===== Contadores =====
    async contarTodos(filtros = {}) {
        try {
            const query = buildQuery(filtros);
            return await Producto.countDocuments(query);
        } catch (error) {
            throw new Error(`Error al contar productos: ${error.message}`);
        }
    }

    async contarDeVendedor(vendedorId, filtros = {}) {
        try {
            const query = buildQuery(filtros, vendedorId);
            return await Producto.countDocuments(query);
        } catch (error) {
            throw new Error(`Error al contar productos del vendedor: ${error.message}`);
        }
    }

    // ===== Productos ordenados por ventas =====
    async productosOrdenadosPorVentas(productos) {
        const ids = productos.map(p => p._id);

        const resultados = await Pedido.aggregate([
            { $unwind: "$items" }, // desarma el array de items
            { $match: { "items.producto": { $in: ids } } }, // filtra los productos de interés
            {
                $group: {
                    _id: "$items.producto",      // agrupa por producto
                    totalVendido: { $sum: "$items.cantidad" }, // suma cantidades
                },
            },
            { $sort: { totalVendido: -1 } }, // orden descendente
        ]);

        return resultados.map(r => ({
            id: r._id,
            total: r.totalVendido,
        }));
    }

    // ===== Obtener todas las categorías =====
    async obtenerCategorias() {
        try {
            // Busca todas las categorías, devolviendo solo _id y nombre
            const categorias = await Categoria.find({}, { _id: 1, nombre: 1 }).lean();

            if (!categorias || categorias.length === 0) {
                throw new Error('No se encontraron categorías');
            }

            return categorias;
        } catch (error) {
            throw new Error(`Error al buscar categorías: ${error.message}`);
        }
    }

}

//funciones auxiliares para evitar repeticion al filtrar

//FILTROS
function buildQuery(filtros, vendedorId = null) {
    const query = {};
    if (vendedorId) query.vendedor = vendedorId;
    if (filtros.nombre) query.titulo = { $regex: filtros.nombre, $options: "i" };
    if (filtros.descripcion) query.descripcion = { $regex: filtros.descripcion, $options: "i" };
    if (filtros.categoria) {
        // Detecta automáticamente si es un ObjectId válido
        if (mongoose.isValidObjectId(filtros.categoria)) {
            query.categorias = { $in: [new mongoose.Types.ObjectId(filtros.categoria)] };
        } else {
            query.categorias = filtros.categoria;
        }
    }
    if (filtros.precioMin || filtros.precioMax) {
        query.precio = {};
        if (filtros.precioMin) query.precio.$gte = filtros.precioMin;
        if (filtros.precioMax) query.precio.$lte = filtros.precioMax;
    }
    return query;
}


//ORDENAMIENTO
function buildSort(sortParam) {
    switch (sortParam) {
        // Mapeo de posibles ordenamientos
        case 'precio_asc': return { precio: 1 };    //ASC
        case 'precio_desc': return { precio: -1 };  //DESC
        case 'mas_vendidos': return { totalVendido: -1 };
        default: return {};
    }
}
