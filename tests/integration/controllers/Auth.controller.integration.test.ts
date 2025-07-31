import request from 'supertest';
import express from 'express';
import { AuthController } from '@infrastructure/controllers/Auth.controller';
import { ValidateAuthUseCase } from '@application/use-cases/ValidateAuth.usecase';
import { UserRepository } from '@domain/repositories/UserRepository.interface';
import { User } from '@domain/entities/User.entity';
import { UserId } from '@domain/value-objects/UserId';
import { UserType } from '@domain/value-objects/UserType';

/**
 * @group Integration Tests
 * @group Controllers
 * @group Auth
 * @group API Endpoints
 */
describe('AuthController Integration Tests', () => {
  let app: express.Application;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let validateAuthUseCase: ValidateAuthUseCase;
  let authController: AuthController;

  beforeEach(() => {
    // Arrange - Setup Express app and dependencies
    app = express();
    app.use(express.json());

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    validateAuthUseCase = new ValidateAuthUseCase(mockUserRepository);
    authController = new AuthController(validateAuthUseCase);

    // Setup routes
    app.get('/api/auth/validate/:userId', (req, res) => 
      authController.validateAuth(req, res)
    );
  });

  /**
   * @test {AuthController} GET /api/auth/validate/:userId
   * @description Verifica que el endpoint de validación de autenticación funcione correctamente
   */
  describe('GET /api/auth/validate/:userId', () => {
    it('should return 200 and user data for valid user ID', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = new User(
        new UserId(userId),
        'John Doe',
        'john@example.com',
        new UserType('student'),
        'institution123'
      );

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .get(`/api/auth/validate/${userId}`)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          id: userId,
          name: 'John Doe',
          email: 'john@example.com',
          userType: 'student',
          institutionCode: 'institution123'
        }
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should return 404 when user is not found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      mockUserRepository.findById.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .get(`/api/auth/validate/${userId}`)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: 'User not found'
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should return 400 for invalid user ID format', async () => {
      // Arrange
      const invalidUserId = 'invalid-id';

      // Act
      const response = await request(app)
        .get(`/api/auth/validate/${invalidUserId}`)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid user ID format'
      });
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should return 500 when repository throws error', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const repositoryError = new Error('Database connection failed');
      mockUserRepository.findById.mockRejectedValue(repositoryError);

      // Act
      const response = await request(app)
        .get(`/api/auth/validate/${userId}`)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Database connection failed'
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  /**
   * @test {AuthController} Error Handling
   * @description Verifica que el controlador maneje correctamente los errores
   */
  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const unexpectedError = new Error('Unexpected error');
      mockUserRepository.findById.mockRejectedValue(unexpectedError);

      // Act
      const response = await request(app)
        .get(`/api/auth/validate/${userId}`)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Unexpected error'
      });
    });
  });
}); 