import { Email } from '../../../../src/domain/value-objects/Email';

/**
 * @group Unit Tests
 * @group Domain
 * @group Value Objects
 * @group Email
 */
describe('Email Value Object', () => {
  /**
   * @test {Email} Constructor
   * @description Verifica que el constructor de Email valide correctamente las direcciones de email
   */
  describe('Constructor', () => {
    it('should create a valid email instance', () => {
      // Arrange
      const validEmail = 'test@example.com';
      
      // Act
      const email = new Email(validEmail);
      
      // Assert
      expect(email.value).toBe(validEmail);
    });

    it('should throw error for invalid email format', () => {
      // Arrange
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        '',
        '   '
      ];

      // Act & Assert
      invalidEmails.forEach(invalidEmail => {
        expect(() => new Email(invalidEmail)).toThrow('Email inválido');
      });
    });

    it('should normalize email to lowercase', () => {
      // Arrange
      const mixedCaseEmail = 'Test@Example.COM';
      
      // Act
      const email = new Email(mixedCaseEmail);
      
      // Assert
      expect(email.value).toBe('test@example.com');
    });
  });

  /**
   * @test {Email} toString
   * @description Verifica que el método toString retorne el valor del email
   */
  describe('toString', () => {
    it('should return email value as string', () => {
      // Arrange
      const emailValue = 'test@example.com';
      const email = new Email(emailValue);
      
      // Act
      const result = email.toString();
      
      // Assert
      expect(result).toBe(emailValue);
    });
  });

  /**
   * @test {Email} equals
   * @description Verifica que el método equals compare correctamente dos emails
   */
  describe('equals', () => {
    it('should return true for same email values', () => {
      // Arrange
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      
      // Act
      const result = email1.equals(email2);
      
      // Assert
      expect(result).toBe(true);
    });

    it('should return false for different email values', () => {
      // Arrange
      const email1 = new Email('test1@example.com');
      const email2 = new Email('test2@example.com');
      
      // Act
      const result = email1.equals(email2);
      
      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing with null', () => {
      // Arrange
      const email = new Email('test@example.com');
      
      // Act & Assert
      expect(() => email.equals(null as any)).toThrow();
    });
  });
}); 