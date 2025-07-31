# Auth Service - Microservicio de Autenticación

Microservicio de autenticación construido con TypeScript, Express y MongoDB, siguiendo los principios de Domain-Driven Design (DDD) y Clean Architecture.

## 🚀 Características

- **Arquitectura DDD**: Separación clara de dominios, aplicación e infraestructura
- **Autenticación con Firebase**: Integración completa con Firebase Auth
- **Base de datos MongoDB**: Persistencia de datos con Mongoose
- **Validación robusta**: Validación de datos con Joi
- **Documentación automática**: Swagger/OpenAPI
- **Testing completo**: Pruebas unitarias, de integración y E2E
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Logging estructurado**: Trazabilidad completa de operaciones

## 📋 Prerrequisitos

- Node.js 18+
- MongoDB 6+
- Docker (opcional)

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd auth-service
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos**
```bash
# Asegúrate de que MongoDB esté ejecutándose
mongod
```

## 🧪 Testing

### Configuración de Testing

1. **Configurar variables de entorno para testing**
```bash
cp env.test.example .env.test
# Editar .env.test con configuraciones de prueba
```

2. **Ejecutar pruebas**
```bash
# Todas las pruebas
npm test
npm test -- --testPathPattern="unit" --verbose

# Pruebas unitarias
npm run test:unit

# Pruebas de integración
npm run test:integration

# Pruebas E2E
npm run test:e2e

# Con cobertura de código
npm run test:coverage

# Modo watch
npm run test:watch
```

### Tipos de Pruebas

- **Unit Tests**: Pruebas de componentes individuales
- **Integration Tests**: Pruebas de interacción entre componentes
- **E2E Tests**: Pruebas de flujos completos del sistema

Para más detalles, consulta la [Guía de Testing](docs/TESTING.md).

## 🚀 Desarrollo

### Comandos disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run start        # Ejecutar en producción

# Testing
npm test             # Ejecutar todas las pruebas
npm run test:watch   # Modo watch para desarrollo
npm run test:coverage # Con reporte de cobertura

# Linting
npm run lint         # Verificar código
npm run lint:fix     # Corregir problemas automáticamente

# Documentación
npm run docs:generate # Generar documentación Swagger
npm run docs:serve   # Servir documentación
```

### Estructura del proyecto

```
src/
├── domain/           # Lógica de dominio (entidades, value objects)
├── application/      # Casos de uso y servicios de aplicación
├── infrastructure/   # Implementaciones técnicas (DB, HTTP, etc.)
└── shared/          # Código compartido entre capas

tests/
├── unit/            # Pruebas unitarias
├── integration/     # Pruebas de integración
├── e2e/            # Pruebas end-to-end
└── helpers/        # Utilidades de testing
```

## 📚 Documentación

- [Arquitectura DDD](ARQUITECTURA_DDD.md)
- [Guía de Testing](docs/TESTING.md)
- [API Documentation](http://localhost:3001/api-docs) (cuando el servidor esté ejecutándose)

## 🔧 Configuración

### Variables de Entorno

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/auth-service

# JWT
JWT_SECRET=your-secret-key

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Email
RESEND_API_KEY=your-resend-api-key

# Servidor
PORT=3001
NODE_ENV=development
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t auth-service .

# Ejecutar contenedor
docker run -p 3001:3001 auth-service
```

## 📊 Monitoreo

El servicio incluye:
- Logging estructurado
- Métricas de performance
- Health checks
- Rate limiting

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de contribución

- Sigue las convenciones de código establecidas
- Asegúrate de que todas las pruebas pasen
- Mantén la cobertura de código > 80%
- Documenta nuevos endpoints y funcionalidades

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Revisar la documentación
- Consultar los logs del servidor

---

**Nota**: Este es un microservicio de autenticación diseñado para ser parte de una arquitectura de microservicios más grande. Asegúrate de configurar correctamente las variables de entorno y dependencias antes de ejecutar en producción.
