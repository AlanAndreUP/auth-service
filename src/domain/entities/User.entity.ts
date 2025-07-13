import { TipoUsuario } from '@shared/types/response.types';

export class User {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly correo: string,
    public readonly contraseña: string,
    public readonly tipo_usuario: TipoUsuario,
    public readonly firebase_uid?: string,
    public readonly codigo_institucion?: string,
    public readonly created_at: Date = new Date(),
    public readonly updated_at: Date = new Date(),
    public readonly deleted_at?: Date
  ) {}

  static create(
    nombre: string,
    correo: string,
    contraseña: string,
    tipo_usuario: TipoUsuario,
    firebase_uid?: string,
    codigo_institucion?: string,
    id?: string
  ): User {
    return new User(
      id || this.generateId(),
      nombre,
      correo,
      contraseña,
      tipo_usuario,
      firebase_uid,
      codigo_institucion
    );
  }

  static generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  isDeleted(): boolean {
    return this.deleted_at !== undefined;
  }

  isTutor(): boolean {
    return this.tipo_usuario === 'tutor';
  }

  isAlumno(): boolean {
    return this.tipo_usuario === 'alumno';
  }

  hasInstitutionCode(): boolean {
    return this.codigo_institucion !== undefined && this.codigo_institucion !== null;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      correo: this.correo,
      tipo_usuario: this.tipo_usuario,
      firebase_uid: this.firebase_uid,
      codigo_institucion: this.codigo_institucion,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }
} 