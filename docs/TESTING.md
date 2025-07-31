# Guía de Testing - Auth Service

## 📋 Índice

1. [Introducción](#introducción)
2. [Estructura de Testing](#estructura-de-testing)
3. [Tipos de Pruebas](#tipos-de-pruebas)
4. [Configuración](#configuración)
5. [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
6. [Ejecución de Pruebas](#ejecución-de-pruebas)
7. [Cobertura de Código](#cobertura-de-código)
8. [Mejores Prácticas](#mejores-prácticas)
9. [Troubleshooting](#troubleshooting)

## 🎯 Introducción

Esta guía documenta la estrategia de testing implementada en el microservicio de autenticación, siguiendo los principios de Domain-Driven Design (DDD) y Clean Architecture.

### Objetivos del Testing

- **Calidad del Código**: Asegurar que el código funcione correctamente
- **Refactoring Seguro**: Permitir cambios sin romper funcionalidad existente
- **Documentación Viva**: Los tests sirven como documentación del comportamiento esperado
- **Detección Temprana de Bugs**: Identificar problemas antes de llegar a producción

## 🏗️ Estructura de Testing

```
tests/
├── setup.ts                    # Configuración global de tests
├── helpers/
│   └── test-utils.ts          # Utilidades reutilizables
├── unit/                      # Pruebas unitarias
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── aggregates/
│   ├── application/
│   │   ├── use-cases/
│   │   └── services/
│   └── infrastructure/
│       ├── controllers/
│       ├── repositories/
│       └── middlewares/
├── integration/               # Pruebas de integración
│   ├── controllers/
│   ├── repositories/
│   └── services/
└── e2e/                      # Pruebas end-to-end
    ├── auth.e2e.test.ts
    └── workflows/
```

## 🧪 Tipos de Pruebas

### 1. Pruebas Unitarias (`tests/unit/`)

**Propósito**: Probar componentes individuales de forma aislada.

**Características**:
- Ejecución rápida (< 100ms por test)
- Sin dependencias externas
- Uso extensivo de mocks
- Cobertura del 90%+

**Ejemplo**:
```typescript
/**
 * @group Unit Tests
 * @group Domain
 * @group Value Objects
 */
describe('Email Value Object', () => {
  it('should create a valid email instance', () => {
    // Arrange
    const validEmail = 'test@example.com';
    
    // Act
    const email = new Email(validEmail);
    
    // Assert
    expect(email.value).toBe(validEmail);
  });
});
```

### 2. Pruebas de Integración (`tests/integration/`)

**Propósito**: Probar la interacción entre componentes.

**Características**:
- Prueban flujos completos
- Usan bases de datos de prueba
- Validan contratos entre capas
- Ejecución media (1-5s por test)

**Ejemplo**:
```typescript
/**
 * @group Integration Tests
 * @group Controllers
 * @group Auth
 */
describe('AuthController Integration Tests', () => {
  it('should return 200 and user data for valid user ID', async () => {
    // Arrange
    const userId = '507f1f77bcf86cd799439011';
    mockUserRepository.findById.mockResolvedValue(mockUser);

    // Act
    const response = await request(app)
      .get(`/api/auth/validate/${userId}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### 3. Pruebas End-to-End (`tests/e2e/`)

**Propósito**: Probar flujos completos del sistema.

**Características**:
- Prueban desde la API hasta la base de datos
- Simulan comportamiento real de usuarios
- Validan performance y concurrencia
- Ejecución lenta (5-30s por test)

**Ejemplo**:
```typescript
/**
 * @group E2E Tests
 * @group Authentication
 * @group Full Flow
 */
describe('Authentication E2E Tests', () => {
  it('should register and validate user successfully', async () => {
    // Arrange
    const userData = TestUtils.createUserData();

    // Act 1: Register
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Act 2: Validate
    const validateResponse = await request(app)
      .get(`/api/auth/validate/${registerResponse.body.data.id}`);

    // Assert
    expect(registerResponse.status).toBe(201);
    expect(validateResponse.status).toBe(200);
  });
});
```

## ⚙️ Configuración

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### Setup Global (`tests/setup.ts`)

```typescript
import dotenv from 'dotenv';

// Cargar variables de entorno para testing
dotenv.config({ path: '.env.test' });

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/auth-service-test';
});

afterEach(() => {
  jest.clearAllMocks();
});
```

## 📝 Convenciones de Nomenclatura

### Archivos de Test
- **Unit Tests**: `*.test.ts` o `*.spec.ts`
- **Integration Tests**: `*.integration.test.ts`
- **E2E Tests**: `*.e2e.test.ts`

### Estructura de Describe/It
```typescript
/**
 * @group [Tipo de Test]
 * @group [Capa/Componente]
 * @group [Funcionalidad]
 */
describe('[Componente] [Funcionalidad]', () => {
  /**
   * @test {[Clase/Método]}
   * @description [Descripción del comportamiento]
   */
  describe('[Método/Propiedad]', () => {
    it('should [comportamiento esperado] when [condición]', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Patrón AAA (Arrange-Act-Assert)
```typescript
it('should return user data when valid user ID is provided', async () => {
  // Arrange - Preparar datos y mocks
  const userId = '507f1f77bcf86cd799439011';
  mockUserRepository.findById.mockResolvedValue(mockUser);

  // Act - Ejecutar la acción a probar
  const result = await validateAuthUseCase.execute(userId);

  // Assert - Verificar el resultado
  expect(result).toEqual(expectedUserData);
  expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
});
```

## 🚀 Ejecución de Pruebas

### Comandos Disponibles

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con watch mode
npm test -- --watch

# Ejecutar pruebas específicas
npm test -- --testNamePattern="Email Value Object"

# Ejecutar pruebas por tipo
npm test -- --testPathPattern="unit"
npm test -- --testPathPattern="integration"
npm test -- --testPathPattern="e2e"

# Ejecutar pruebas con coverage
npm test -- --coverage

# Ejecutar pruebas en modo verbose
npm test -- --verbose
```

### Variables de Entorno para Testing

Crear archivo `.env.test`:
```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/auth-service-test
JWT_SECRET=test-secret-key
FIREBASE_PROJECT_ID=test-project
```

## 📊 Cobertura de Código

### Configuración de Cobertura

```javascript
collectCoverageFrom: [
  'src/**/*.ts',
  '!src/**/*.d.ts',
  '!src/index.ts',
  '!src/**/__tests__/**'
],
coverageDirectory: 'coverage',
coverageReporters: ['text', 'lcov', 'html'],
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### Interpretación de Cobertura

- **Statements**: Porcentaje de declaraciones ejecutadas
- **Branches**: Porcentaje de ramas de código ejecutadas
- **Functions**: Porcentaje de funciones ejecutadas
- **Lines**: Porcentaje de líneas ejecutadas

### Generar Reporte de Cobertura

```bash
npm test -- --coverage --coverageReporters=html
# Abrir coverage/lcov-report/index.html en el navegador
```

## ✅ Mejores Prácticas

### 1. Organización de Tests

- **Agrupar por funcionalidad**: Tests relacionados en el mismo describe
- **Usar describe anidados**: Para organizar casos de prueba
- **Nombres descriptivos**: Que expliquen qué se está probando

### 2. Mocks y Stubs

```typescript
// ✅ Bueno - Mock específico
const mockUserRepository = {
  findById: jest.fn().mockResolvedValue(mockUser)
};

// ❌ Malo - Mock genérico
jest.mock('@domain/repositories/UserRepository');
```

### 3. Datos de Prueba

```typescript
// ✅ Usar utilidades de test
const userData = TestUtils.createUserData({
  email: 'specific@example.com'
});

// ❌ Datos hardcodeados
const userData = {
  name: 'Test User',
  email: 'test@example.com'
  // ... más datos
};
```

### 4. Assertions

```typescript
// ✅ Assertions específicos
expect(result).toEqual(expectedUserData);
expect(mockRepository.findById).toHaveBeenCalledWith(userId);

// ❌ Assertions genéricos
expect(result).toBeTruthy();
```

### 5. Manejo de Errores

```typescript
// ✅ Probar errores específicos
await expect(useCase.execute(invalidData))
  .rejects
  .toThrow('Invalid email format');

// ❌ Solo verificar que hay error
await expect(useCase.execute(invalidData)).rejects.toThrow();
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Tests que fallan intermitentemente
```bash
# Ejecutar tests en modo serial
npm test -- --runInBand
```

#### 2. Problemas de timeout
```typescript
// Aumentar timeout para tests específicos
jest.setTimeout(10000);
```

#### 3. Problemas con MongoDB
```typescript
// Asegurar limpieza de base de datos
beforeEach(async () => {
  await TestUtils.cleanTestDatabase(mongoose);
});
```

#### 4. Problemas con mocks
```typescript
// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});
```

### Debugging

```bash
# Ejecutar un test específico en modo debug
npm test -- --testNamePattern="should create valid email" --verbose

# Ejecutar tests con console.log
npm test -- --verbose --no-coverage
```

## 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [DDD Testing Strategies](https://martinfowler.com/articles/microservice-testing/)

## 🤝 Contribución

Al agregar nuevos tests:

1. Sigue las convenciones de nomenclatura
2. Usa las utilidades de test existentes
3. Documenta casos edge y errores
4. Mantén la cobertura de código > 80%
5. Ejecuta todos los tipos de tests antes de hacer commit

---

**Nota**: Esta documentación debe mantenerse actualizada conforme evoluciona la estrategia de testing del proyecto. 