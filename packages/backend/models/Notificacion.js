import mongoose from 'mongoose';

const notificacionSchema = new mongoose.Schema({
  usuarioDestinoId: {
    type: String,
    required: true,
    index: true
  },
  mensaje: {
    type: String,
    required: true,
    trim: true
  },
  leida: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaLectura: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índice compuesto para consultas frecuentes
notificacionSchema.index({ usuarioDestinoId: 1, leida: 1 });
notificacionSchema.index({ usuarioDestinoId: 1, fechaCreacion: -1 });

export const Notificacion = mongoose.model('Notificacion', notificacionSchema);