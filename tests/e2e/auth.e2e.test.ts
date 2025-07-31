import request from 'supertest';
import { Server } from '@infrastructure/server/Server';
import mongoose from 'mongoose';

/**
 * @group E2E Tests
 * @group Authentication
 * @group Full Flow
 * @group API Endpoints
 */
describe('Authentication E2E Tests', () => {
  let server: Server;
  let app: any;

  beforeAll(async () => {
    // Arrange - Setup test database and server
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/auth-service-e2e-test';
    process.env.JWT_SECRET = 'e2e-test-secret';

    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Start server
    server = new Server();
    app = server.getApp();
  });

  afterAll(async () => {
    // Cleanup - Close database connection and server
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await server.stop();
  });

  beforeEach(async () => {
    // Clean database before each test
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  });

  /**
   * @test {Authentication} Complete User Registration and Validation Flow
   * @description Verifica el flujo completo de registro y validación de usuario
   */
  describe('Complete User Registration and Validation Flow', () => {
    it('should register a new user and validate authentication successfully', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'securePassword123',
        userType: 'student',
        institutionCode: 'TEST001'
      };

      // Act 1: Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/);

      // Assert 1: Registration successful
      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data).toHaveProperty('id');
      expect(registerResponse.body.data.email).toBe(userData.email);

      const userId = registerResponse.body.data.id;

      // Act 2: Validate authentication
      const validateResponse = await request(app)
        .get(`/api/auth/validate/${userId}`)
        .expect('Content-Type', /json/);

      // Assert 2: Validation successful
      expect(validateResponse.status).toBe(200);
      expect(validateResponse.body.success).toBe(true);
      expect(validateResponse.body.data).toEqual({
        id: userId,
        name: userData.name,
        email: userData.email,
        userType: userData.userType,
        institutionCode: userData.institutionCode
      });
    });

    it('should handle duplicate email registration gracefully', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'securePassword123',
        userType: 'student',
        institutionCode: 'TEST001'
      };

      // Act 1: First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Act 2: Duplicate registration
      const duplicateResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/);

      // Assert: Duplicate registration should fail
      expect(duplicateResponse.status).toBe(409);
      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error).toContain('Email already exists');
    });
  });

  /**
   * @test {Authentication} Error Scenarios
   * @description Verifica el manejo de errores en diferentes escenarios
   */
  describe('Error Scenarios', () => {
    it('should return 400 for invalid registration data', async () => {
      // Arrange
      const invalidUserData = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: wrong email format
        password: '123', // Invalid: too short password
        userType: 'invalid-type', // Invalid: unsupported user type
        institutionCode: '' // Invalid: empty institution code
      };

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should return 404 for non-existent user validation', async () => {
      // Arrange
      const nonExistentUserId = '507f1f77bcf86cd799439011';

      // Act
      const response = await request(app)
        .get(`/api/auth/validate/${nonExistentUserId}`)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      // Arrange
      const invalidUserId = 'invalid-id-format';

      // Act
      const response = await request(app)
        .get(`/api/auth/validate/${invalidUserId}`)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid user ID format');
    });
  });

  /**
   * @test {Authentication} Performance Tests
   * @description Verifica el rendimiento de los endpoints críticos
   */
  describe('Performance Tests', () => {
    it('should handle multiple concurrent user validations', async () => {
      // Arrange
      const userData = {
        name: 'Performance Test User',
        email: 'performance@example.com',
        password: 'securePassword123',
        userType: 'student',
        institutionCode: 'PERF001'
      };

      // Register user first
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      const userId = registerResponse.body.data.id;

      // Act: Make multiple concurrent requests
      const concurrentRequests = Array.from({ length: 10 }, () =>
        request(app)
          .get(`/api/auth/validate/${userId}`)
          .expect(200)
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const endTime = Date.now();

      // Assert
      expect(responses).toHaveLength(10);
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Performance assertion: All requests should complete within 2 seconds
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
}); 