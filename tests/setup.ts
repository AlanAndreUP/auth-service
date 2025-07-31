import dotenv from 'dotenv';

// Cargar variables de entorno para testing
dotenv.config({ path: '.env.test' });

// Configuración global para tests
beforeAll(() => {
  // Configurar variables de entorno por defecto para tests
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-service-test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
  process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'test-project';
});

// Limpiar después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

// Configuración global de timeout
jest.setTimeout(10000); 