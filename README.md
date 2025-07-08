# 🔐 Auth Service - Microservicio de Autenticación

Microservicio de autenticación construido con **TypeScript**, **Express**, **MongoDB** y arquitectura **Hexagonal** siguiendo principios de **DDD**.

## 🚀 Características

- ✅ Registro y login de usuarios (Tutor/Alumno)
- ✅ Validación con Firebase Auth
- ✅ JWT para autenticación
- ✅ Arquitectura Hexagonal (Puertos y Adaptadores)
- ✅ Domain-Driven Design (DDD)
- ✅ Validación de datos con Joi
- ✅ Rate limiting
- ✅ Seguridad con Helmet
- ✅ MongoDB con Mongoose

## 📋 Estructura del Proyecto

```
src/
├── domain/                 # Capa de dominio
│   ├── entities/          # Entidades del dominio
│   └── repositories/      # Interfaces de repositorios
├── application/           # Capa de aplicación
│   └── use-cases/        # Casos de uso
├── infrastructure/        # Capa de infraestructura
│   ├── controllers/      # Controladores HTTP
│   ├── repositories/     # Implementaciones de repositorios
│   ├── database/         # Modelos y conexión DB
│   ├── routes/          # Definición de rutas
│   └── server/          # Configuración del servidor
└── shared/               # Tipos y utilidades compartidas
    └── types/           # Definiciones de tipos
```

## 🔧 Instalación y Uso

### Prerrequisitos
- Node.js 18+
- MongoDB
- npm o yarn

### Instalación
```bash
npm install
```

### Variables de Entorno
Crear archivo `.env` basado en `.env.example`:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/auth_service
JWT_SECRET=tu-jwt-secreto-super-seguro-aqui
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## 📚 Documentación de la API

La API cuenta con documentación interactiva generada con **Swagger/OpenAPI 3.0**:

🔗 **Swagger UI**: `http://localhost:3001/api-docs`
📄 **JSON Schema**: `http://localhost:3001/api-docs.json`

### Características de la documentación:
- ✅ Interfaz interactiva para probar endpoints
- ✅ Ejemplos de requests y responses
- ✅ Esquemas de validación detallados
- ✅ Autenticación JWT integrada
- ✅ Códigos de error explicados

## 📡 API Endpoints

### POST `/auth/validate`
Valida usuario desde Firebase y maneja registro/login.

**Request Body:**
```json
{
  "correo": "usuario@example.com",
  "contraseña": "password_hasheado_de_firebase",
  "tipo_usuario": "tutor" | "alumno"
}
```

**Response (Registro):**
```json
{
  "data": {
    "isNewUser": true,
    "userType": "tutor",
    "userId": "user_id_generado",
    "token": "jwt_token"
  },
  "message": "Tutor registrado exitosamente",
  "status": "success"
}
```

**Response (Login):**
```json
{
  "data": {
    "isNewUser": false,
    "userType": "tutor",
    "userId": "user_id_existente",
    "token": "jwt_token"
  },
  "message": "Tutor autenticado exitosamente",
  "status": "success"
}
```

### GET `/health`
Health check del servicio.

**Response:**
```json
{
  "data": {
    "service": "auth-service",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "message": "Servicio de autenticación funcionando correctamente",
  "status": "success"
}
```

## 🐳 Docker

### Construir imagen
```bash
docker build -t auth-service .
```

### Ejecutar contenedor
```bash
docker run -p 3001:3001 --env-file .env auth-service
```

## 🔐 Seguridad

- **Rate Limiting**: 100 requests por IP cada 15 minutos
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para dominios específicos
- **JWT**: Tokens con expiración de 24 horas
- **Bcrypt**: Hash de contraseñas con salt

## 🗄️ Base de Datos

### Modelo de Usuario
```typescript
{
  _id: string;
  correo: string;
  contraseña: string; // Hasheada con bcrypt
  tipo_usuario: 'tutor' | 'alumno';
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

### Índices
- `correo` (único)
- `tipo_usuario`
- `deleted_at`

## 🧪 Testing

```bash
npm test
```

## 🚀 Despliegue

Este microservicio está diseñado para desplegarse en AWS con:
- **Kong API Gateway** para enrutamiento
- **MongoDB Atlas** para base de datos
- **Docker** para contenerización

## 📝 Notas

- Todos los otros microservicios deben validar tokens JWT contra este servicio
- El frontend maneja la autenticación inicial con Firebase
- Este servicio almacena y valida usuarios en la base de datos propia # auth-service
