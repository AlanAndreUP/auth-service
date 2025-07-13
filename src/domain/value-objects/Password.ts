import bcrypt from 'bcryptjs';

export class Password {
  private readonly _hashedValue: string;

  private constructor(hashedValue: string) {
    this._hashedValue = hashedValue;
  }

  static async create(plainPassword: string): Promise<Password> {
    if (!this.isValid(plainPassword)) {
      throw new Error('Contraseña no cumple con los requisitos de seguridad');
    }
    
    const hashedValue = await bcrypt.hash(plainPassword, 10);
    return new Password(hashedValue);
  }

  static fromHash(hashedValue: string): Password {
    if (!hashedValue) {
      throw new Error('Hash de contraseña no puede estar vacío');
    }
    return new Password(hashedValue);
  }

  private static isValid(password: string): boolean {
    if (!password || password.length < 6) {
      return false;
    }
    
    // Validaciones de seguridad
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Al menos 3 de los 4 tipos de caracteres
    const typesCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;
    
    return typesCount >= 3;
  }

  async verify(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this._hashedValue);
  }

  get hashedValue(): string {
    return this._hashedValue;
  }

  equals(other: Password): boolean {
    return this._hashedValue === other._hashedValue;
  }

  // Métodos de dominio
  static getStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (password.length < 6) return 'weak';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const typesCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;
    
    if (typesCount >= 3 && password.length >= 8) return 'strong';
    if (typesCount >= 2 && password.length >= 6) return 'medium';
    return 'weak';
  }

  static generateTemporary(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
} 