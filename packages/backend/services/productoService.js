import mongoose from 'mongoose';
import { InvalidIdError, NotFoundError } from '../errors/AppError.js';

export class ProductoService {
    constructor(productoRepository, usuarioRepository) {
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Representa la capa de servicio para Productos.
    // Se encarga de aplicar reglas de negocio, paginar resultados
    // y delegar las operaciones de BD al repository.

    // ===== Crear producto nuevo =====
    async crearProducto(productoData, usuarioId) {
        // Verificar que el usuario existe
        const usuario = await this.usuarioRepository.findById(usuarioId);
        if (!usuario) {
            throw new NotFoundError('Usuario', usuarioId);
        }

        return this.productoRepository.create({
            ...productoData,
            vendedor: usuarioId
        });
    }

    // ===== Actualizar producto =====
    async actualizarProducto(id, datos) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new InvalidIdError('Producto ID');
        }

        const producto = await this.productoRepository.findById(id);
        if (!producto) {
            throw new NotFoundError('Producto', id);
        }

        const productoConId = { ...datos, _id: id };
        return await this.productoRepository.save(productoConId);
    }

    // ===== Buscar todos los productos con filtros y paginación =====
    async listarProductos(page, limit, filtros, sortParam, vendedorId = null) {
        try {
            const numeroPagina = Math.max(Number(page), 1)
            const elementosXPagina = Math.min(Math.max(Number(limit), 1), 100)

            // Promise.all ejecuta en paralelo dos operaciones:
            //  1) Traer los productos de la página solicitada.
            //  2) Contar el total de productos que cumplen los filtros.
            //
            // El uso de "await" permite esperar a que ambas promesas se resuelvan
            // antes de continuar, de modo que "productos" y "total"
            // contienen los resultados reales (no promesas).

            const [productos, total] = await Promise.all([
                this.productoRepository.findByPage(numeroPagina, elementosXPagina, filtros, sortParam, vendedorId),
                this.productoRepository.contarTodos(filtros, vendedorId),
            ]);

            const totalPaginas = Math.ceil(total / elementosXPagina)

            return {
                pagina: numeroPagina,           // Página actual
                perPage: elementosXPagina,      // Cantidad de elementos por página
                totalColecciones: total,        // Total de registros que cumplen los filtros
                totalPaginas: totalPaginas,     // Total de páginas disponibles
                data: productos                 // Lista de productos de esta página
            }

        } catch (error) {
            throw new Error(`Error al buscar productos: ${error.message}`);
        }
    }

    // ===== Buscar productos de un vendedor con filtros y paginación =====
    async buscarProductosVendedor(page, limit, filtros, sortParam, vendedorId) {
        // Verificar que el usuario existe
        const usuario = await this.usuarioRepository.findById(vendedorId);
        if (!usuario) {
            throw new NotFoundError('Usuario', vendedorId);
        }

        try {
            const numeroPagina = Math.max(Number(page), 1)
            const elementosXPagina = Math.min(Math.max(Number(limit), 1), 100)

            const [productos, total] = await Promise.all([
                this.productoRepository.findByVendedor(numeroPagina, elementosXPagina, filtros, sortParam, vendedorId),
                this.productoRepository.contarDeVendedor(vendedorId, filtros),
            ]);

            const totalPaginas = Math.ceil(total / elementosXPagina)

            return {
                pagina: numeroPagina,
                perPage: elementosXPagina,
                totalColecciones: total,
                totalPaginas: totalPaginas,
                data: productos
            }

        } catch (error) {
            throw new Error(`Error al buscar productos del vendedor: ${error.message}`);
        }

    }

    ordernarPorPrecioAsc(productos) {
        const idOrdenado = this.productoRepository.orderByPrecioAsc(productos);
        const productosOrdenados = new Array(productos.length);

        for (let i = 0; i < productosOrdenados.length; i++) {
            productosOrdenados[i] = productos.find(p => p.getId() === idOrdenado[i].id);
        }

        return productosOrdenados;
    }

    ordernarPorPrecioDesc(productos) {
        const idOrdenado = this.productoRepository.orderByPrecioDesc(productos);
        const productosOrdenados = new Array(productos.length);

        for (let i = 0; i < productosOrdenados.length; i++) {
            productosOrdenados[i] = productos.find(p => p.getId() === idOrdenado[i].id);
        }

        return productosOrdenados;
    }

    ordernarPorVentas(productos) {
        const idOrdenado = this.productoRepository.productosOrdenadosPorVentas(productos);
        const productosOrdenados = new Array(productos.length);

        for (let i = 0; i < productosOrdenados.length; i++) {
            productosOrdenados[i] = productos.find(p => p.getId() === idOrdenado[i].id);
        }

        return productosOrdenados;
    }

    async eliminarProducto(productoId) {
        if (!mongoose.Types.ObjectId.isValid(productoId)) {
            throw new InvalidIdError('Producto ID');
        }

        try {
            return await this.productoRepository.delete(productoId);
        } catch (error) {
            throw new Error(`Error al eliminar producto: ${error.message}`);
        }
    }

    async aumentarStock(productoId, cantidad) {
        if (!mongoose.Types.ObjectId.isValid(productoId)) {
            throw new InvalidIdError('Producto ID');
        }

        try {
            const producto = await this.productoRepository.findById(productoId);
            if (!producto) throw new Error('Producto no encontrado');

            producto.stock = (producto.stock || 0) + cantidad;

            await this.productoRepository.save(producto);
            return producto;
        } catch (error) {
            throw new Error(`Error al aumentar stock: ${error.message}`);
        }
    }

    async disminuirStock(productoId, cantidad) {
        if (!mongoose.Types.ObjectId.isValid(productoId)) {
            throw new InvalidIdError('Producto ID');
        }

        try {
            const producto = await this.productoRepository.findById(productoId);
            if (!producto) throw new Error('Producto no encontrado');

            producto.stock = Math.max(0, (producto.stock || 0) - cantidad);

            await this.productoRepository.save(producto);
            return producto;
        } catch (error) {
            throw new Error(`Error al reducir stock: ${error.message}`);
        }
    }

    async aumentarCantidadVentas(productoId, cantidad) {
        if (!mongoose.Types.ObjectId.isValid(productoId)) {
            throw new InvalidIdError('Producto ID');
        }

        try {
            const producto = await this.productoRepository.findById(productoId);
            if (!producto) throw new Error('Producto no encontrado');

            producto.totalVendido = (producto.totalVendido || 0) + cantidad;

            await this.productoRepository.save(producto);
            return producto;
        } catch (error) {
            throw new Error(`Error al aumentar total vendido: ${error.message}`);
        }
    }

    async tieneStockSuficiente(productoId, cantidad){
        if (!mongoose.Types.ObjectId.isValid(productoId)) {
            throw new InvalidIdError('Producto ID');
        }

        try {
            const producto = await this.productoRepository.findById(productoId);
            if (!producto) throw new Error('Producto no encontrado');
            return producto.stock >= cantidad;
        } catch (error) {
            throw new Error(`Error al validar stock: ${error.message}`);
        }
    }

    async buscarPrecioUnitario(productoId){
        if (!mongoose.Types.ObjectId.isValid(productoId)) {
            throw new InvalidIdError('Producto ID');
        }

        try {
            const producto = await this.productoRepository.findById(productoId);
            if (!producto) throw new Error('Producto no encontrado');
            return producto.precio;
        } catch (error) {
            throw new Error(`Error al buscar precio: ${error.message}`);
        }
    }

    async buscarProductoPorId(productoId){
        if (!mongoose.Types.ObjectId.isValid(productoId)) {
            throw new InvalidIdError('Producto ID');
        }

        try {
            const producto = await this.productoRepository.findById(productoId);
            if (!producto) throw new Error('Producto no encontrado');
            return producto;
        } catch (error) {
            throw new Error(`Error al buscar producto: ${error.message}`);
        }
    }

    async obtenerCategorias(){
        try {
            const categorias = await this.productoRepository.obtenerCategorias();
            if (!categorias) throw new Error('Categorias no encontradas');
            return categorias;
        } catch (error) {
            throw new Error(`Error al buscar categorias: ${error.message}`);
        }
    }
}