import mongoose, { Schema, Document } from 'mongoose';
import { TipoUsuario } from '@shared/types/response.types';

export interface IUserDocument extends Document {
  _id: string;
  correo: string;
  contraseña: string;
  tipo_usuario: TipoUsuario;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

const UserSchema = new Schema<IUserDocument>({
  _id: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  contraseña: {
    type: String,
    required: true
  },
  tipo_usuario: {
    type: String,
    enum: ['tutor', 'alumno'],
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date,
    default: undefined
  }
}, {
  _id: false, // Desactivar auto-generación de _id
  timestamps: false // Usar nuestros propios campos de tiempo
});

// Índices
UserSchema.index({ correo: 1 });
UserSchema.index({ tipo_usuario: 1 });
UserSchema.index({ deleted_at: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema); 