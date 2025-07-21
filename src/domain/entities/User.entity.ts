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
    public readonly is_active: boolean = true,
    public readonly created_at: Date = new Date(),
    public readonly updated_at: Date = new Date(),
    public readonly last_login?: Date,
    public readonly ip_address?: string,
    public readonly user_agent?: string,
    public readonly deleted_at?: Date
  ) {}

  static create(
    nombre: string,
    correo: string,
    contraseña: string,
    tipo_usuario: TipoUsuario,
    firebase_uid?: string,
    codigo_institucion?: string,
    id?: string,
    is_active: boolean = true,
    created_at?: Date,
    updated_at?: Date,
    last_login?: Date,
    ip_address?: string,
    user_agent?: string,
    deleted_at?: Date
  ): User {
    return new User(
      id || this.generateId(),
      nombre,
      correo,
      contraseña,
      tipo_usuario,
      firebase_uid,
      codigo_institucion,
      is_active,
      created_at ?? new Date(),
      updated_at ?? new Date(),
      last_login,
      ip_address,
      user_agent,
      deleted_at
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
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
      last_login: this.last_login,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      deleted_at: this.deleted_at
    };
  }
} 