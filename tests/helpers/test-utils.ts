import { User } from '@domain/entities/User.entity';
import { UserId } from '@domain/value-objects/UserId';
import { UserType } from '@domain/value-objects/UserType';
import { Email } from '@domain/value-objects/Email';

/**
 * @group Test Helpers
 * @group Utilities
 * @description Utilidades comunes para testing que pueden ser reutilizadas en diferentes tipos de pruebas
 */
export class TestUtils {
  /**
   * Crea un usuario de prueba con datos válidos
   * @param overrides - Datos opcionales para sobrescribir los valores por defecto
   * @returns Instancia de User con datos de prueba
   */
  static createMockUser(overrides: Partial<User> = {}): User {
    const defaultUser = new User(
      new UserId('507f1f77bcf86cd799439011'),
      'Test User',
      'test@example.com',
      new UserType('student'),
      'TEST001'
    );

    return Object.assign(defaultUser, overrides);
  }

  /**
   * Crea datos de usuario válidos para requests HTTP
   * @param overrides - Datos opcionales para sobrescribir los valores por defecto
   * @returns Objeto con datos de usuario para testing
   */
  static createUserData(overrides: Record<string, any> = {}): Record<string, any> {
    const defaultData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'securePassword123',
      userType: 'student',
      institutionCode: 'TEST001'
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * Crea datos de usuario inválidos para testing de validación
   * @returns Array de objetos con datos inválidos
   */
  static createInvalidUserData(): Record<string, any>[] {
    return [
      {
        name: '',
        email: 'test@example.com',
        password: 'securePassword123',
        userType: 'student',
        institutionCode: 'TEST001',
        description: 'Empty name'
      },
      {
        name: 'Test User',
        email: 'invalid-email',
        password: 'securePassword123',
        userType: 'student',
        institutionCode: 'TEST001',
        description: 'Invalid email format'
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
        userType: 'student',
        institutionCode: 'TEST001',
        description: 'Password too short'
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: 'securePassword123',
        userType: 'invalid-type',
        institutionCode: 'TEST001',
        description: 'Invalid user type'
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: 'securePassword123',
        userType: 'student',
        institutionCode: '',
        description: 'Empty institution code'
      }
    ];
  }

  /**
   * Genera un ID de MongoDB válido para testing
   * @returns String con formato de ObjectId válido
   */
  static generateValidObjectId(): string {
    return '507f1f77bcf86cd799439011';
  }

  /**
   * Genera un array de IDs de MongoDB válidos
   * @param count - Número de IDs a generar
   * @returns Array de strings con ObjectIds válidos
   */
  static generateValidObjectIds(count: number): string[] {
    const baseId = '507f1f77bcf86cd79943901';
    return Array.from({ length: count }, (_, index) => {
      const suffix = (index + 1).toString().padStart(1, '0');
      return baseId + suffix;
    });
  }

  /**
   * Crea un mock de repository con métodos básicos
   * @returns Mock de repository con métodos jest.fn()
   */
  static createMockRepository() {
    return {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
  }

  /**
   * Simula un delay para testing de timeouts
   * @param ms - Milisegundos a esperar
   * @returns Promise que se resuelve después del delay
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Crea un error simulado para testing
   * @param message - Mensaje del error
   * @param statusCode - Código de estado HTTP (opcional)
   * @returns Error con propiedades adicionales
   */
  static createTestError(message: string, statusCode?: number): Error & { statusCode?: number } {
    const error = new Error(message) as Error & { statusCode?: number };
    if (statusCode) {
      error.statusCode = statusCode;
    }
    return error;
  }

  /**
   * Valida que una respuesta HTTP tenga la estructura correcta
   * @param response - Objeto de respuesta de supertest
   * @param expectedStatus - Código de estado HTTP esperado
   * @param expectedSuccess - Valor esperado para success
   */
  static validateApiResponse(response: any, expectedStatus: number, expectedSuccess: boolean): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(expectedSuccess);
    
    if (expectedSuccess) {
      expect(response.body).toHaveProperty('data');
    } else {
      expect(response.body).toHaveProperty('error');
    }
  }

  /**
   * Limpia la base de datos de prueba
   * @param mongoose - Instancia de mongoose
   */
  static async cleanTestDatabase(mongoose: any): Promise<void> {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
} 