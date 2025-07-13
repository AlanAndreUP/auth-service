export class UserId {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('ID de usuario inválido');
    }
    this._value = value;
  }

  private isValid(id: string): boolean {
    if (!id || typeof id !== 'string') {
      return false;
    }

    const trimmed = id.trim();
    
    // Debe tener entre 10 y 50 caracteres
    if (trimmed.length < 10 || trimmed.length > 50) {
      return false;
    }

    // Solo debe contener caracteres alfanuméricos
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(trimmed)) {
      return false;
    }

    return true;
  }

  get value(): string {
    return this._value;
  }

  static create(value?: string): UserId {
    const id = value || this.generate();
    return new UserId(id);
  }

  static generate(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  equals(other: UserId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  // Métodos de dominio
  getShortId(): string {
    return this._value.substring(0, 8);
  }

  isTemporary(): boolean {
    // Los IDs temporales podrían tener un patrón específico
    return this._value.startsWith('temp_');
  }

  getCreationTimestamp(): number | null {
    // Si el ID contiene timestamp, extraerlo
    const timestampPart = this._value.match(/([0-9a-z]{6,})$/);
    if (timestampPart) {
      try {
        return parseInt(timestampPart[1], 36);
      } catch {
        return null;
      }
    }
    return null;
  }

  static createTemporary(): UserId {
    const tempId = `temp_${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;
    return new UserId(tempId);
  }

  static fromString(value: string): UserId {
    return new UserId(value);
  }
} 