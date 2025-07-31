import { InstitutionCode } from '../../../../src/domain/value-objects/InstitutionCode';

/**
 * @group Unit Tests
 * @group Domain
 * @group Value Objects
 * @group InstitutionCode
 */
describe('InstitutionCode Value Object', () => {
  /**
   * @test {InstitutionCode} Constructor
   * @description Verifica que el constructor de InstitutionCode valide correctamente los códigos de institución
   */
  describe('Constructor', () => {
    it('should create a valid institution code instance', () => {
      // Arrange
      const validCode = 'TEST001';
      
      // Act
      const institutionCode = new InstitutionCode(validCode);
      
      // Assert
      expect(institutionCode.value).toBe('TEST001');
    });

    it('should throw error for invalid institution code format', () => {
      // Arrange
      const invalidCodes = [
        '', // Empty
        'A', // Too short
        'A'.repeat(21), // Too long
        'TEST@001', // Invalid characters
        'TEST 001', // Spaces
        'test#001', // Invalid characters
        null,
        undefined
      ];

      // Act & Assert
      invalidCodes.forEach(invalidCode => {
        expect(() => new InstitutionCode(invalidCode as any)).toThrow('Código de institución inválido');
      });
    });

    it('should normalize code to uppercase', () => {
      // Arrange
      const mixedCaseCode = 'Test001';
      
      // Act
      const institutionCode = new InstitutionCode(mixedCaseCode);
      
      // Assert
      expect(institutionCode.value).toBe('TEST001');
    });

    it('should trim whitespace', () => {
      // Arrange
      const codeWithSpaces = '  TEST001  ';
      
      // Act
      const institutionCode = new InstitutionCode(codeWithSpaces);
      
      // Assert
      expect(institutionCode.value).toBe('TEST001');
    });
  });

  /**
   * @test {InstitutionCode} Static Methods
   * @description Verifica que los métodos estáticos funcionen correctamente
   */
  describe('Static Methods', () => {
    it('should create instance using static create method', () => {
      // Arrange
      const code = 'TEST001';
      
      // Act
      const institutionCode = InstitutionCode.create(code);
      
      // Assert
      expect(institutionCode.value).toBe('TEST001');
    });

    it('should create empty instance', () => {
      // Act
      const institutionCode = InstitutionCode.createEmpty();
      
      // Assert
      expect(institutionCode.value).toBe('ALUMNO');
    });

    it('should validate code correctly', () => {
      // Arrange
      const validCode = 'TEST001';
      const invalidCode = 'A';
      
      // Act & Assert
      expect(InstitutionCode.validateCode(validCode)).toBe(true);
      expect(InstitutionCode.validateCode(invalidCode)).toBe(false);
    });

    it('should get all valid tutor codes', () => {
      // Act
      const tutorCodes = InstitutionCode.getAllValidTutorCodes();
      
      // Assert
      expect(Array.isArray(tutorCodes)).toBe(true);
      expect(tutorCodes).toContain('TUTOR');
    });

    it('should validate tutor codes correctly', () => {
      // Arrange
      const validTutorCode = 'TUTOR';
      const invalidTutorCode = 'ALUMNO';
      
      // Act & Assert
      expect(InstitutionCode.isValidTutorCode(validTutorCode)).toBe(true);
      expect(InstitutionCode.isValidTutorCode(invalidTutorCode)).toBe(false);
    });

    it('should get user type from code correctly', () => {
      // Arrange
      const tutorCode = 'TUTOR';
      const alumnoCode = 'ALUMNO';
      
      // Act & Assert
      expect(InstitutionCode.getUserTypeFromCode(tutorCode)).toBe('tutor');
      expect(InstitutionCode.getUserTypeFromCode(alumnoCode)).toBe('alumno');
    });
  });

  /**
   * @test {InstitutionCode} Instance Methods
   * @description Verifica que los métodos de instancia funcionen correctamente
   */
  describe('Instance Methods', () => {
    it('should check if code is tutor code', () => {
      // Arrange
      const tutorCode = new InstitutionCode('TUTOR');
      const alumnoCode = new InstitutionCode('ALUMNO');
      
      // Act & Assert
      expect(tutorCode.isTutorCode()).toBe(true);
      expect(alumnoCode.isTutorCode()).toBe(false);
    });

    it('should check if code is alumno code', () => {
      // Arrange
      const tutorCode = new InstitutionCode('TUTOR');
      const alumnoCode = new InstitutionCode('ALUMNO');
      
      // Act & Assert
      expect(tutorCode.isAlumnoCode()).toBe(false);
      expect(alumnoCode.isAlumnoCode()).toBe(true);
    });

    it('should get associated user type', () => {
      // Arrange
      const tutorCode = new InstitutionCode('TUTOR');
      const alumnoCode = new InstitutionCode('ALUMNO');
      
      // Act & Assert
      expect(tutorCode.getAssociatedUserType()).toBe('tutor');
      expect(alumnoCode.getAssociatedUserType()).toBe('alumno');
    });

    it('should get institution name', () => {
      // Arrange
      const tutorCode = new InstitutionCode('TUTOR');
      const alumnoCode = new InstitutionCode('ALUMNO');
      
      // Act & Assert
      expect(tutorCode.getInstitutionName()).toBe('RutaSegura - Institución Principal');
      expect(alumnoCode.getInstitutionName()).toBe('Sin institución específica');
    });

    it('should get institution level', () => {
      // Arrange
      const tutorCode = new InstitutionCode('TUTOR');
      const alumnoCode = new InstitutionCode('ALUMNO');
      
      // Act & Assert
      expect(tutorCode.getInstitutionLevel()).toBe('premium');
      expect(alumnoCode.getInstitutionLevel()).toBe('basic');
    });
  });

  /**
   * @test {InstitutionCode} equals
   * @description Verifica que el método equals compare correctamente dos códigos de institución
   */
  describe('equals', () => {
    it('should return true for same institution codes', () => {
      // Arrange
      const code1 = new InstitutionCode('TEST001');
      const code2 = new InstitutionCode('TEST001');
      
      // Act
      const result = code1.equals(code2);
      
      // Assert
      expect(result).toBe(true);
    });

    it('should return false for different institution codes', () => {
      // Arrange
      const code1 = new InstitutionCode('TEST001');
      const code2 = new InstitutionCode('TEST002');
      
      // Act
      const result = code1.equals(code2);
      
      // Assert
      expect(result).toBe(false);
    });
  });

  /**
   * @test {InstitutionCode} toString
   * @description Verifica que el método toString retorne el valor del código
   */
  describe('toString', () => {
    it('should return institution code value as string', () => {
      // Arrange
      const codeValue = 'TEST001';
      const institutionCode = new InstitutionCode(codeValue);
      
      // Act
      const result = institutionCode.toString();
      
      // Assert
      expect(result).toBe('TEST001');
    });
  });
}); 