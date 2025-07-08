import { TipoUsuario } from '@shared/types/response.types';

export class User {
  constructor(
    public readonly id: string,
    public readonly correo: string,
    public readonly contraseña: string,
    public readonly tipo_usuario: TipoUsuario,
    public readonly created_at: Date = new Date(),
    public readonly updated_at: Date = new Date(),
    public readonly deleted_at?: Date
  ) {}

  static create(
    correo: string,
    contraseña: string,
    tipo_usuario: TipoUsuario,
    id?: string
  ): User {
    return new User(
      id || this.generateId(),
      correo,
      contraseña,
      tipo_usuario
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

  toJSON() {
    return {
      id: this.id,
      correo: this.correo,
      tipo_usuario: this.tipo_usuario,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }
} 