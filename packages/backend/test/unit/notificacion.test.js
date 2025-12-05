import { Notificacion } from "../../domain/notificacion/Notificacion.js";
import { Usuario } from "../../domain/usuario/Usuario.js";

describe("Notificacion - pruebas básicas", () => {
  let usuario;

  beforeEach(() => {
    // Crear usuario
    usuario = new Usuario(2, "Pedro Cliente", "pedro@client.com", "0987654321", "cliente");
  });

  describe("Clase Notificacion", () => {
    test("Crear notificación correctamente", () => {
      const notificacion = new Notificacion(
        usuario.getId(),
        "Mensaje de prueba"
      );

      expect(notificacion.getId()).toBeNull(); // id es null hasta guardarse en BD
      expect(notificacion.getUsuarioDestino()).toBe(usuario.getId());
      expect(notificacion.getMensaje()).toBe("Mensaje de prueba");
      expect(notificacion.isLeida()).toBe(false);
      expect(notificacion.getFechaLeida()).toBeNull();
    });

    test("Marcar notificación como leída", () => {
      const notificacion = new Notificacion(
        usuario.getId(),
        "Mensaje de prueba"
      );

      expect(notificacion.isLeida()).toBe(false);
      expect(notificacion.getFechaLeida()).toBeNull();

      notificacion.marcarComoLeida();

      expect(notificacion.isLeida()).toBe(true);
      expect(notificacion.getFechaLeida()).toBeInstanceOf(Date);
    });

    test("Verificar fecha de alta", () => {
      const antes = Date.now();
      const notificacion = new Notificacion(
        usuario.getId(),
        "Mensaje de prueba"
      );
      const despues = Date.now();

      expect(notificacion.getFechaAlta()).toBeGreaterThanOrEqual(antes);
      expect(notificacion.getFechaAlta()).toBeLessThanOrEqual(despues);
      expect(typeof notificacion.getFechaAlta()).toBe('number');
    });
  });
});
