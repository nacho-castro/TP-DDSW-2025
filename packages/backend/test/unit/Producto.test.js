import { Producto } from "../../domain/producto/Producto.js";
import { ProductoService } from "../../services/productoService.js";
import { jest } from '@jest/globals';
import mongoose from 'mongoose';

describe("Producto - pruebas", () => {
  let productoService;
  let mockRepo;
  let productos;

  beforeEach(() => {
    productos = [
      new Producto(1, { id: 101, nombre: "Vendedor Uno" }, "Camiseta Deportiva", "Camiseta de algodón", ["Ropa", "Deporte"], 3500, "ARS", 20, ["foto1.jpg"], true),
      new Producto(2, { id: 102, nombre: "Vendedor Dos" }, "Auriculares Bluetooth", "Auriculares inalámbricos", ["Electrónica", "Audio"], 12000, "ARS", 15, ["auriculares.jpg"], true),
      new Producto(3, { id: 103, nombre: "Vendedor Tres" }, "Libro de Programación", "Libro sobre JS moderno", ["Libros", "Educación"], 4500, "ARS", 0, ["libro.jpg"], false)
    ];

    mockRepo = {
      save: jest.fn(),
      delete: jest.fn().mockResolvedValue(true),
      findByPage: jest.fn().mockResolvedValue([]),
      contarTodos: jest.fn().mockResolvedValue(0),
      findByVendedor: jest.fn().mockResolvedValue([]),
      contarDeVendedor: jest.fn().mockResolvedValue(0),
      productosOrdenadosPorVentas: jest.fn().mockReturnValue([
        { id: 2, total: 300 },
        { id: 1, total: 200 },
        { id: 3, total: 100 }
      ]),
      orderByPrecioAsc: jest.fn((productos) => {
        return [...productos].sort((a, b) => a.precio - b.precio).map(p => ({ id: p.id }));
      }),
      orderByPrecioDesc: jest.fn((productos) => {
        return [...productos].sort((a, b) => b.precio - a.precio).map(p => ({ id: p.id }));
      })
    };
    productoService = new ProductoService(mockRepo);
  });

  test("Ordenar productos por precio ascendente", () => {
    const ordenados = productoService.ordernarPorPrecioAsc(productos);
    expect(ordenados.map(p => p.getId())).toEqual([1, 3, 2]);
  });

  test("Ordenar productos por precio descendente", () => {
    const ordenados = productoService.ordernarPorPrecioDesc(productos);
    expect(ordenados.map(p => p.getId())).toEqual([2, 3, 1]);
  });

  test("Ordenar productos por ventas", () => {
    const ordenados = productoService.ordernarPorVentas(productos);
    expect(ordenados.map(p => p.getId())).toEqual([2, 1, 3]);
  });

  test("Listar productos paginados", async () => {
    const mockData = [{ _id: "1" }, { _id: "2" }];
    mockRepo.findByPage.mockResolvedValueOnce(mockData);
    mockRepo.contarTodos.mockResolvedValueOnce(2);

    const result = await productoService.listarProductos(1, 10);
    expect(result.data).toEqual(mockData);
    expect(result.totalColecciones).toBe(2);
    expect(result.totalPaginas).toBe(1);
    expect(result.pagina).toBe(1);
    expect(result.perPage).toBe(10);
  });

  test("Eliminar producto", async () => {
    const productoId = new mongoose.Types.ObjectId();
    const eliminado = await productoService.eliminarProducto(productoId.toString());
    expect(eliminado).toBe(true);
  });

});