export class FirebaseUID {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Firebase UID inválido');
    }
    this._value = value;
  }

  private isValid(uid: string): boolean {
    if (!uid || typeof uid !== 'string') {
      return false;
    }

    const trimmed = uid.trim();
    
    // Firebase UIDs tienen longitud típica de 28 caracteres
    if (trimmed.length < 20 || trimmed.length > 35) {
      return false;
    }

    // Solo debe contener caracteres alfanuméricos, guiones y guiones bajos
    const firebaseUidRegex = /^[a-zA-Z0-9_-]+$/;
    if (!firebaseUidRegex.test(trimmed)) {
      return false;
    }

    return true;
  }

  get value(): string {
    return this._value;
  }

  static create(value: string): FirebaseUID {
    return new FirebaseUID(value);
  }

  equals(other: FirebaseUID): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  // Métodos de dominio
  getShortId(): string {
    return this._value.substring(0, 8);
  }

  isAnonymous(): boolean {
    // Los usuarios anónimos de Firebase suelen tener un patrón específico
    return this._value.length === 28 && this._value.startsWith('anonymous_');
  }

  getProvider(): 'email' | 'google' | 'facebook' | 'anonymous' | 'unknown' {
    // Esta lógica podría mejorar basándose en patrones reales de Firebase
    if (this.isAnonymous()) {
      return 'anonymous';
    }
    
    // Patrones comunes (estos son ejemplos, los patrones reales pueden variar)
    if (this._value.includes('google')) {
      return 'google';
    }
    
    if (this._value.includes('facebook')) {
      return 'facebook';
    }
    
    // Por defecto asumimos email/password
    return 'email';
  }

  isTemporary(): boolean {
    return this.isAnonymous() || this._value.startsWith('temp_');
  }

  static fromString(value: string): FirebaseUID {
    return new FirebaseUID(value);
  }

  // Método para validar sin crear instancia
  static isValidUID(uid: string): boolean {
    try {
      new FirebaseUID(uid);
      return true;
    } catch {
      return false;
    }
  }
} 