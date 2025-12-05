export class UsuarioController {
  constructor(usuarioService) {
    this.usuarioService = usuarioService;
  }

  registrarUsuario = async (req, res) => {
    try {
      const { telefono, direccion, tipoUsuario } = req.body;
      const userId = req.userId;

      if (!telefono || !direccion || !tipoUsuario) {
        return res.status(400).json({
          error: 'Datos incompletos',
          message: 'Todos los campos son requeridos: telefono, direccion, tipoUsuario'
        });
      }

      if (!['comprador', 'vendedor'].includes(tipoUsuario)) {
        return res.status(400).json({
          error: 'Tipo de usuario inválido',
          message: 'El tipoUsuario debe ser "comprador" o "vendedor"'
        });
      }

      // Validar estructura de dirección
      if (!direccion.calle || !direccion.ciudad || !direccion.codigoPostal) {
        return res.status(400).json({
          error: 'Datos incompletos',
          message: 'La dirección debe incluir: calle, ciudad y codigoPostal'
        });
      }

      // Usar el servicio para crear/actualizar el usuario
      const usuario = await this.usuarioService.registrarUsuario({
        id: userId,
        telefono,
        direccion,
        tipoUsuario
      });

      return res.status(200).json({
        message: 'Registro completado exitosamente',
        usuario: {
          id: usuario.id,
          tipoUsuario: usuario.tipoUsuario
        }
      });
    } catch (error) {
      console.error('Error en registrarUsuario:', error);

      return res.status(500).json({
        error: 'Error interno',
        message: 'Error al completar el registro'
      });
    }
  };
}
