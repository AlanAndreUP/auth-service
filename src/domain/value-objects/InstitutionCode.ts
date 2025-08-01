export class InstitutionCode {
  private readonly _value: string;
  private static readonly VALID_TUTOR_CODES = ['TUTOR']; // Fallback hardcoded
  
  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Código de institución inválido');
    }
    this._value = value.trim().toUpperCase();
  }

  private isValid(code: string): boolean {
    if (!code || typeof code !== 'string') {
      return false;
    }

    const trimmed = code.trim();
    
    // Debe tener entre 2 y 20 caracteres
    if (trimmed.length < 2 || trimmed.length > 20) {
      return false;
    }

    // Solo debe contener letras, números y guiones
    const codeRegex = /^[A-Za-z0-9-_]+$/;
    if (!codeRegex.test(trimmed)) {
      return false;
    }

    return true;
  }

  get value(): string {
    return this._value;
  }

  static create(value: string): InstitutionCode {
    return new InstitutionCode(value);
  }

  static createEmpty(): InstitutionCode {
    return new InstitutionCode('ALUMNO');
  }

  equals(other: InstitutionCode): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  // Métodos de dominio
  isTutorCode(): boolean {
    return InstitutionCode.VALID_TUTOR_CODES.includes(this._value);
  }

  isAlumnoCode(): boolean {
    return !this.isTutorCode();
  }

  getAssociatedUserType(): 'tutor' | 'alumno' {
    return this.isTutorCode() ? 'tutor' : 'alumno';
  }

  getInstitutionName(): string {
    // Por ahora hardcoded, en el futuro se consultará el servicio de institución
    switch (this._value) {
      case 'TUTOR':
        return 'RutaSegura - Institución Principal';
      default:
        return 'Sin institución específica';
    }
  }

  getInstitutionLevel(): 'premium' | 'standard' | 'basic' {
    // Por ahora hardcoded, en el futuro se consultará el servicio de institución
    switch (this._value) {
      case 'TUTOR':
        return 'premium';
      default:
        return 'basic';
    }
  }

  static validateCode(code: string): boolean {
    try {
      new InstitutionCode(code);
      return true;
    } catch {
      return false;
    }
  }

  static getAllValidTutorCodes(): string[] {
    return [...InstitutionCode.VALID_TUTOR_CODES];
  }

  // Método para verificar si el código es válido para tutores
  static isValidTutorCode(code: string): boolean {
    try {
      const institutionCode = new InstitutionCode(code);
      return institutionCode.isTutorCode();
    } catch {
      return false;
    }
  }

  // Método para obtener el tipo de usuario basado en el código
  static getUserTypeFromCode(code: string): 'tutor' | 'alumno' {
    try {
      const institutionCode = new InstitutionCode(code);
      return institutionCode.getAssociatedUserType();
    } catch {
      return 'alumno'; // Por defecto alumno si el código es inválido
    }
  }

  // Métodos estáticos para validar códigos de tutor usando el repositorio
  static async isValidTutorCodeFromDB(code: string, tutorCodeRepository: any): Promise<boolean> {
    try {
      const tutorCode = await tutorCodeRepository.findByCode(code);
      return tutorCode !== null && !tutorCode.isUsed;
    } catch (error) {
      console.error('Error validando código de tutor desde DB:', error);
      // Fallback a validación local
      return InstitutionCode.isValidTutorCode(code);
    }
  }

  static async getUserTypeFromCodeWithDB(code: string, tutorCodeRepository: any): Promise<'tutor' | 'alumno'> {
    try {
      const isValidTutorCode = await InstitutionCode.isValidTutorCodeFromDB(code, tutorCodeRepository);
      return isValidTutorCode ? 'tutor' : 'alumno';
    } catch (error) {
      console.error('Error obteniendo tipo de usuario desde DB:', error);
      // Fallback a validación local
      return InstitutionCode.getUserTypeFromCode(code);
    }
  }

  static async markTutorCodeAsUsed(code: string, userId: string, tutorCodeRepository: any): Promise<void> {
    try {
      const tutorCode = await tutorCodeRepository.findByCode(code);
      if (tutorCode && !tutorCode.isUsed) {
        const updatedCode = tutorCode.markAsUsed(userId);
        await tutorCodeRepository.update(updatedCode);
      }
    } catch (error) {
      console.error('Error marcando código de tutor como usado:', error);
      // No lanzar error para no afectar el flujo de registro
    }
  }
} 