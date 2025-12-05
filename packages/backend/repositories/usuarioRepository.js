import { clerk } from '../middleware/auth.js';

export class UsuarioRepository {

  /**
   * Convierte un usuario de Clerk a formato compatible con nuestra app
   */
  _mapClerkUserToAppUser(clerkUser) {
    const metadata = clerkUser.publicMetadata || {};

    return {
      _id: clerkUser.id,
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      nombre: clerkUser.fullName || clerkUser.firstName || '',
      telefono: metadata.telefono || '',
      direccion: metadata.direccion || {},
      tipoUsuario: metadata.tipoUsuario || '',
      activo: metadata.activo !== false,
      fechaRegistro: metadata.fechaRegistro || clerkUser.createdAt,
      imageUrl: clerkUser.imageUrl
    };
  }

  async findById(id) {
    try {
      const clerkUser = await clerk.users.getUser(id);
      return this._mapClerkUserToAppUser(clerkUser);
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  async findByEmail(email) {
    try {
      const users = await clerk.users.getUserList({
        emailAddress: [email]
      });

      if (users.length === 0) {
        return null;
      }

      return this._mapClerkUserToAppUser(users[0]);
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  async save(usuario) {
    try {
      const userId = usuario._id || usuario.id;

      // Actualizar metadata del usuario
      const updatedUser = await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          telefono: usuario.telefono,
          direccion: usuario.direccion,
          tipoUsuario: usuario.tipoUsuario,
          activo: usuario.activo !== false,
          fechaRegistro: usuario.fechaRegistro
        }
      });

      return this._mapClerkUserToAppUser(updatedUser);
    } catch (error) {
      throw new Error(`Error al guardar usuario: ${error.message}`);
    }
  }

  async create(usuarioData) {
    try {
      // En Clerk, los usuarios se crean automáticamente al registrarse
      // Este método actualiza el metadata después del registro
      const userId = usuarioData._id || usuarioData.id;

      const updatedUser = await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          telefono: usuarioData.telefono,
          direccion: usuarioData.direccion,
          tipoUsuario: usuarioData.tipoUsuario,
          activo: true,
          fechaRegistro: new Date().toISOString()
        }
      });

      return this._mapClerkUserToAppUser(updatedUser);
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const clerkUsers = await clerk.users.getUserList({
        limit,
        offset
      });

      // Filtrar solo usuarios activos
      const usuarios = clerkUsers
        .map(user => this._mapClerkUserToAppUser(user))
        .filter(user => user.activo);

      // Nota: Clerk no devuelve el total, así que esto es una aproximación
      const totalPages = Math.ceil(usuarios.length / limit);

      return {
        pagina: page,
        perPage: limit,
        totalColecciones: usuarios.length,
        totalPaginas: totalPages,
        data: usuarios
      };
    } catch (error) {
      throw new Error(`Error al listar usuarios: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      // Soft delete - marcar como inactivo en metadata
      const updatedUser = await clerk.users.updateUserMetadata(id, {
        publicMetadata: {
          activo: false
        }
      });

      return this._mapClerkUserToAppUser(updatedUser);
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }
}
