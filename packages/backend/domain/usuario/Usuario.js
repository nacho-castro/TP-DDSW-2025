export class Usuario {
  id
  nombre
  email
  telefono
  tipoUsuario
  fechaAlta

  constructor(id, nombre, email, telefono, tipoUsuario) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.telefono = telefono;
    this.tipoUsuario = tipoUsuario;
    this.fechaAlta = new Date();
  }

  getNombre() {
    return this.nombre;
  }

  getId() {
    return this.id;
  }

  //Por ahora no usados pero los agrego para futuras funcionalidades:
  getEmail() { return this.email; }
  getTelefono() { return this.telefono; }
  getTipoUsuario() { return this.tipoUsuario; }
  getFechaAlta() { return this.fechaAlta; }
}