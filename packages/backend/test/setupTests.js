import { connect, closeDatabase, clearDatabase } from './utils/mongoMemory.js';

// Levantar la base en memoria antes de todas las pruebas
beforeAll(async () => {
  try {
    await connect();
  } catch (err) {
    console.error('\nFailed to start mongodb-memory-server. This commonly happens when the system is missing OpenSSL 1.1 (libcrypto.so.1.1).');
    console.error('If you are on Debian/Ubuntu you can install it with:');
    console.error('  sudo apt-get update && sudo apt-get install -y libssl1.1');
    console.error('On systems without libssl1.1 available, consider running tests inside a docker image that provides it.');
    console.error('Original error:', err.message || err);
    throw err; // fail fast so CI shows the real issue
  }
});

// Limpiar la base después de cada prueba
afterEach(async () => {
  await clearDatabase();
});

// Cerrar la conexión al terminar
afterAll(async () => {
  await closeDatabase();
});
