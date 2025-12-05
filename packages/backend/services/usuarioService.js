export class UsuarioService {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async registrarUsuario(datosUsuario) {
    const { id, telefono, direccion, tipoUsuario } = datosUsuario;

    // Crear/actualizar usuario con el metadata
    const usuario = await this.usuarioRepository.create({
      id,
      telefono,
      direccion,
      tipoUsuario,
      activo: true,
      fechaRegistro: new Date().toISOString()
    });

    return usuario;
  }

  async obtenerUsuarioPorId(id) {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  }

  async obtenerUsuarioPorEmail(email) {
    return await this.usuarioRepository.findByEmail(email);
  }
}
