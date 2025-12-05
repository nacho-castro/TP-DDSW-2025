import { describe, test, expect } from '@jest/globals';
import { ItemPedido } from '../../domain/pedido/ItemPedido.js';
import { ValidationError } from '../../errors/AppError.js';

describe('ItemPedido - entidad y validaciones', () => {
  test('instancia válida y getters funcionan', () => {
    const item = new ItemPedido('prod-1', 3, 10, 'vend-1');

    expect(item.getProductoId()).toBe('prod-1');
    expect(item.getCantidad()).toBe(3);
    expect(item.getPrecioUnitario()).toBe(10);
    expect(item.vendedorId).toBe('vend-1');
  });

  test('subTotal calcula cantidad * precioUnitario', () => {
    const item = new ItemPedido('prod-2', 4, 7.5);
    expect(item.subTotal()).toBeCloseTo(30);
  });

  test('lanza ValidationError si productoId es nulo o vacío', () => {
    expect(() => new ItemPedido(null, 1, 5)).toThrow(ValidationError);
    expect(() => new ItemPedido('', 1, 5)).toThrow(ValidationError);
  });

  test('lanza ValidationError si cantidad es inválida', () => {
    expect(() => new ItemPedido('prod-4', 0, 5)).toThrow(ValidationError);
    expect(() => new ItemPedido('prod-4', -1, 5)).toThrow(ValidationError);
    expect(() => new ItemPedido('prod-4', NaN, 5)).toThrow(ValidationError);
  });

  test('lanza ValidationError si precioUnitario es inválido', () => {
    expect(() => new ItemPedido('prod-5', 1, 0)).toThrow(ValidationError);
    expect(() => new ItemPedido('prod-5', 1, -10)).toThrow(ValidationError);
    expect(() => new ItemPedido('prod-5', 1, NaN)).toThrow(ValidationError);
  });
});
