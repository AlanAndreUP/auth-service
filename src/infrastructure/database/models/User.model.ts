import mongoose, { Schema, Document } from 'mongoose';
import { TipoUsuario } from '@shared/types/response.types';

export interface IUserDocument extends Document {
  _id: string;
  nombre: string;
  correo: string;
  contraseña: string;
  tipo_usuario: TipoUsuario;
  firebase_uid?: string;
  codigo_institucion?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  ip_address?: string;
  user_agent?: string;
  deleted_at?: Date;
}

const UserSchema = new Schema<IUserDocument>({
  _id: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
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
  firebase_uid: {
    type: String,
    unique: true,
    sparse: true // Permite valores null y undefined sin conflicto con unique
  },
  codigo_institucion: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true // Permite valores null y undefined sin conflicto con unique si hay índice
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date,
    required: false
  },
  ip_address: {
    type: String,
    required: false
  },
  user_agent: {
    type: String,
    required: false
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
UserSchema.index({ firebase_uid: 1 });
UserSchema.index({ codigo_institucion: 1 });
UserSchema.index({ tipo_usuario: 1 });
UserSchema.index({ deleted_at: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema); 