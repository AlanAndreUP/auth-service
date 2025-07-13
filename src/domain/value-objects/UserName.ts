export class UserName {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Nombre de usuario inválido');
    }
    this._value = this.normalize(value);
  }

  private isValid(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }

    const trimmed = name.trim();
    
    // Validaciones básicas
    if (trimmed.length < 2 || trimmed.length > 100) {
      return false;
    }

    // No debe contener solo espacios
    if (trimmed.replace(/\s+/g, '').length === 0) {
      return false;
    }

    // No debe contener caracteres especiales peligrosos
    const dangerousChars = /[<>\"'&]/;
    if (dangerousChars.test(trimmed)) {
      return false;
    }

    return true;
  }

  private normalize(name: string): string {
    return name.trim()
      .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Primera letra de cada palabra en mayúscula
  }

  get value(): string {
    return this._value;
  }

  get initials(): string {
    return this._value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }

  get firstName(): string {
    return this._value.split(' ')[0];
  }

  get lastName(): string {
    const parts = this._value.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  equals(other: UserName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(value: string): UserName {
    return new UserName(value);
  }

  // Métodos de dominio
  isCommonName(): boolean {
    const commonNames = ['admin', 'administrator', 'test', 'user', 'guest', 'root'];
    return commonNames.includes(this._value.toLowerCase());
  }

  getDisplayName(maxLength: number = 30): string {
    if (this._value.length <= maxLength) {
      return this._value;
    }
    return this._value.substring(0, maxLength - 3) + '...';
  }

  containsWord(word: string): boolean {
    return this._value.toLowerCase().includes(word.toLowerCase());
  }
} 