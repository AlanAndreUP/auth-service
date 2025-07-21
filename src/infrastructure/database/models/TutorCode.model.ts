import mongoose, { Schema, Document } from 'mongoose';

export interface ITutorCode extends Document {
  code: string;
  email: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

const TutorCodeSchema = new Schema<ITutorCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: String,
    required: false
  },
  usedAt: {
    type: Date,
    required: false
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
    required: false
  }
});

// Índices para mejorar el rendimiento
TutorCodeSchema.index({ code: 1 });
TutorCodeSchema.index({ email: 1 });
TutorCodeSchema.index({ isUsed: 1 });
TutorCodeSchema.index({ deleted_at: 1 });

export const TutorCodeModel = mongoose.model<ITutorCode>('TutorCode', TutorCodeSchema); 