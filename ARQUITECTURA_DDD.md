# 🏗️ Arquitectura DDD - Microservicio de Autenticación

## Introducción

Este documento describe la implementación de **Domain-Driven Design (DDD)** en el microservicio de autenticación, incluyendo **Value Objects**, **Domain Events**, **Agregados** y **Domain Services**.

## 📋 Estructura del Dominio

### 1. **Value Objects** (Objetos de Valor)

Los Value Objects encapsulan datos y comportamiento sin identidad propia:

#### `Email`
- **Propósito**: Validar y manejar direcciones de correo electrónico
- **Características**:
  - Validación de formato RFC 5322
  - Normalización (lowercase, trim)
  - Extracción de dominio y parte local
  - Detección de emails desechables
  - Validación de dominio específico

#### `Password`
- **Propósito**: Manejar contraseñas de forma segura
- **Características**:
  - Validación de fortaleza (mayúsculas, minúsculas, números, símbolos)
  - Hashing automático con bcrypt
  - Verificación de contraseñas
  - Generación de contraseñas temporales
  - Análisis de fortaleza

#### `UserName`
- **Propósito**: Validar y normalizar nombres de usuario
- **Características**:
  - Validación de longitud (2-100 caracteres)
  - Normalización (capitalización, espacios)
  - Extracción de iniciales, nombre y apellido
  - Detección de nombres comunes/restringidos
  - Generación de nombres para mostrar

#### `UserType`
- **Propósito**: Encapsular tipos de usuario y permisos
- **Características**:
  - Validación de tipos ('tutor', 'alumno')
  - Métodos de verificación (isTutor, isAlumno)
  - Gestión de permisos por tipo
  - Configuración de notificaciones por defecto
  - Límites de archivos por tipo

#### `UserId`
- **Propósito**: Identificadores únicos para usuarios
- **Características**:
  - Generación automática alfanumérica
  - Validación de formato
  - Extracción de timestamp
  - Soporte para IDs temporales
  - Versión corta para mostrar

#### `FirebaseUID`
- **Propósito**: Identificadores de Firebase Authentication
- **Características**:
  - Validación específica de Firebase UIDs
  - Detección de tipo de proveedor
  - Identificación de usuarios anónimos
  - Validación de longitud y formato

#### `IPAddress`
- **Propósito**: Validar y analizar direcciones IP
- **Características**:
  - Soporte IPv4 e IPv6
  - Detección de IPs privadas/públicas
  - Identificación de localhost
  - Cálculo de red
  - Validación de formato

#### `UserAgent`
- **Propósito**: Analizar User-Agent strings
- **Características**:
  - Extracción de navegador y versión
  - Detección de sistema operativo
  - Clasificación de dispositivo (mobile, tablet, desktop)
  - Detección de bots
  - Análisis de confiabilidad

### 2. **Domain Events** (Eventos de Dominio)

Los Domain Events representan algo significativo que ocurrió en el dominio:

#### `UserRegistered`
- **Cuando**: Un usuario se registra exitosamente
- **Datos**: userId, name, email, userType, firebaseUID, ipAddress, userAgent, registrationMethod
- **Comportamiento**: 
  - Notificación a tutor si es alumno
  - Verificación de dispositivo confiable
  - Contexto completo de registro

#### `UserLoggedIn`
- **Cuando**: Un usuario inicia sesión
- **Datos**: userId, name, email, userType, firebaseUID, ipAddress, userAgent, loginMethod
- **Comportamiento**:
  - Análisis de seguridad
  - Detección de logins sospechosos
  - Contexto de seguridad con nivel de riesgo

#### `EmailNotificationSent`
- **Cuando**: Se envía una notificación por email
- **Datos**: userId, recipientEmail, emailType, subject, success, errorMessage
- **Comportamiento**:
  - Lógica de reintentos
  - Categorización de errores
  - Delays diferenciados por tipo

### 3. **Agregados** (Aggregates)

Los Agregados son el corazón de DDD, encapsulando entidades y value objects:

#### `UserAggregate`
- **Raíz del Agregado**: Encapsula toda la lógica de usuario
- **Responsabilidades**:
  - Creación de usuarios (email y Firebase)
  - Autenticación con eventos de dominio
  - Gestión de contraseñas
  - Actualización de datos
  - Vinculación con Firebase
  - Desactivación/reactivación
  - Gestión de permisos

- **Factory Methods**:
  - `createWithEmail()`: Registro tradicional
  - `createWithFirebase()`: Registro con Firebase

- **Métodos de Comportamiento**:
  - `authenticate()`: Autenticación con contraseña
  - `authenticateWithFirebase()`: Autenticación Firebase
  - `changePassword()`: Cambio de contraseña
  - `updateName()`: Actualización de nombre
  - `updateEmail()`: Actualización de email
  - `linkFirebaseUID()`: Vinculación Firebase
  - `deactivate()`: Desactivación
  - `reactivate()`: Reactivación

## 🔄 Flujo de Eventos

### Registro de Usuario
```
1. UserAggregate.createWithEmail() o createWithFirebase()
2. Genera evento UserRegistered
3. EmailService escucha evento
4. Envía correo de bienvenida
5. Genera evento EmailNotificationSent
```

### Login de Usuario
```
1. UserAggregate.authenticate() o authenticateWithFirebase()
2. Genera evento UserLoggedIn
3. EmailService escucha evento
4. Envía notificación de login
5. Genera evento EmailNotificationSent
```

## 🎯 Beneficios de esta Arquitectura

### 1. **Separación de Responsabilidades**
- Value Objects: Validación y comportamiento de datos
- Domain Events: Comunicación entre boundarios
- Agregados: Consistencia transaccional

### 2. **Testabilidad**
- Value Objects son inmutables y fáciles de testear
- Domain Events permiten testing de comportamiento
- Agregados encapsulan lógica compleja

### 3. **Flexibilidad**
- Fácil agregar nuevos Value Objects
- Nuevos Domain Events para funcionalidades
- Extensible sin romper código existente

### 4. **Mantenibilidad**
- Código expresivo y legible
- Reglas de negocio centralizadas
- Cambios aislados en boundaries

## 🚀 Uso Recomendado

### Crear Usuario
```typescript
// Con email
const user = await UserAggregate.createWithEmail(
  UserName.create("Juan Pérez"),
  Email.create("juan@example.com"),
  "password123",
  UserType.createAlumno(),
  IPAddress.create("192.168.1.100"),
  UserAgent.create("Mozilla/5.0...")
);

// Con Firebase
const user = await UserAggregate.createWithFirebase(
  UserName.create("Juan Pérez"),
  Email.create("juan@example.com"),
  UserType.createAlumno(),
  FirebaseUID.create("firebase_uid_123"),
  IPAddress.create("192.168.1.100"),
  UserAgent.create("Mozilla/5.0...")
);
```

### Autenticación
```typescript
// Autenticación tradicional
const isValid = await user.authenticate(
  "password123",
  IPAddress.create("192.168.1.100"),
  UserAgent.create("Mozilla/5.0...")
);

// Autenticación Firebase
user.authenticateWithFirebase(
  IPAddress.create("192.168.1.100"),
  UserAgent.create("Mozilla/5.0...")
);
```

### Procesar Eventos
```typescript
// Obtener eventos generados
const events = user.getDomainEvents();

// Procesar cada evento
for (const event of events) {
  await eventDispatcher.dispatch(event);
}

// Limpiar eventos después del procesamiento
user.clearDomainEvents();
```

## 🔧 Próximos Pasos

1. **Domain Services**: Servicios para lógica compleja
2. **Repositories mejorados**: Interfaces para agregados
3. **Specifications**: Patrones de consulta
4. **Event Sourcing**: Persistencia de eventos
5. **CQRS**: Separación de comandos y consultas

## 📖 Recursos

- [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)
- [Implementing Domain-Driven Design](https://www.amazon.com/Implementing-Domain-Driven-Design-Vaughn-Vernon/dp/0321834577)
- [DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf)

---

Esta arquitectura proporciona una base sólida para el crecimiento del microservicio de autenticación siguiendo las mejores prácticas de DDD. 