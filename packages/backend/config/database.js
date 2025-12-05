import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Usar MONGODB_URI si está disponible, sino usar variables individuales
    const mongoURI = process.env.MONGODB_URI || (() => {
      const {
        MONGODB_HOST = process.env.MONGODB_HOST,
        MONGODB_PORT = process.env.MONGODB_PORT,
        MONGODB_DATABASE = process.env.MONGODB_DATABASE,
        MONGODB_USERNAME = process.env.MONGODB_USERNAME,
        MONGODB_PASSWORD = process.env.MONGODB_PASSWORD,
        MONGODB_AUTH_SOURCE = process.env.MONGODB_AUTH_SOURCE
      } = process.env;

      if (MONGODB_USERNAME && MONGODB_PASSWORD) {
        return `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=${MONGODB_AUTH_SOURCE}`;
      } else {
        return `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
      }
    })();

    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB desconectado');
  } catch (error) {
    console.error('Error desconectando MongoDB:', error.message);
  }
};