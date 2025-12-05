export class Producto {
  id
  vendedor
  titulo
  descripcion
  categorias
  precio
  moneda
  stock
  totalVendido
  fotos
  activo

  constructor(
    id,
    vendedor,
    titulo,
    descripcion,
    categorias,
    precio,
    moneda,
    stock,
    fotos,
    activo,
  ) {
    this.id = id;
    this.vendedor = vendedor; // Usuario
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.categorias = categorias; // Categoria
    this.precio = precio;
    this.moneda = moneda; // Moneda
    this.stock = stock;
    this.totalVendido = 0;
    this.fotos = fotos || [];
    this.activo = activo;
  }

  estaDisponible(cantidad) {
    return this.stock >= cantidad;
  }

  reducirStock(cantidad) {
    if (this.estaDisponible(cantidad)) {
      this.stock -= cantidad;
    } else {
      throw new Error("Stock insuficiente");
    }
  }

  aumentarStock(cantidad) {
    this.stock += cantidad;
  }

  aumentarVendido(cantidad) {
    this.totalVendido += cantidad;
  }

  agregarFoto(foto) {
    this.fotos.push(foto);
  }

  getVendedor() {
    return this.vendedor;
  }

  getTitulo() {
    return this.titulo;
  }

  //No usados pero los agrego para futuras funcionalidades:
  getId() { return this.id; }
  getDescripcion() { return this.descripcion; }
  getCategorias() { return this.categorias; }
  getPrecio() { return this.precio; }
  getMoneda() { return this.moneda; }
  getStock() { return this.stock; }
  getTotalVendido() { return this.totalVendido; }
  getFotos() { return this.fotos; }
  isActivo() { return this.activo; }
}
