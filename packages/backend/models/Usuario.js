import mongoose from 'mongoose';

const UsuarioSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  nombre: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false,
    unique: false // Permite duplicados en tests
  },
  rol: {
    type: String,
    enum: ['comprador', 'vendedor', 'admin'],
    default: 'comprador'
  },
  tipoUsuario: {
    type: String,
    enum: ['comprador', 'vendedor'],
    default: 'comprador'
  },
  telefono: String,
  direccion: mongoose.Schema.Types.Mixed,
  activo: {
    type: Boolean,
    default: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const Usuario = mongoose.model('Usuario', UsuarioSchema);
