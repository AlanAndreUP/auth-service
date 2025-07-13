import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Auth Service API',
    version: '1.0.0',
    description: 'Microservicio de autenticación con TypeScript, Express, MongoDB y arquitectura Hexagonal',
    contact: {
      name: 'Equipo de Desarrollo',
      email: 'dev@example.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Servidor de desarrollo'
    },
    {
      url: 'https://api.example.com',
      description: 'Servidor de producción'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido del endpoint /auth/validate o /auth/firebase'
      }
    },
    schemas: {
      AuthValidateRequest: {
        type: 'object',
        required: ['correo', 'contraseña', 'tipo_usuario'],
        properties: {
          correo: {
            type: 'string',
            format: 'email',
            description: 'Correo electrónico del usuario',
            example: 'usuario@example.com'
          },
          contraseña: {
            type: 'string',
            minLength: 6,
            description: 'Contraseña del usuario (mínimo 6 caracteres)',
            example: 'password123'
          },
          tipo_usuario: {
            type: 'string',
            enum: ['tutor', 'alumno'],
            description: 'Tipo de usuario en el sistema',
            example: 'tutor'
          }
        }
      },
      FirebaseAuthRequest: {
        type: 'object',
        required: ['firebase_token', 'nombre', 'correo', 'tipo_usuario'],
        properties: {
          firebase_token: {
            type: 'string',
            description: 'Token de Firebase ID obtenido del cliente',
            example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN...'
          },
          nombre: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            description: 'Nombre completo del usuario',
            example: 'Juan Pérez'
          },
          correo: {
            type: 'string',
            format: 'email',
            description: 'Correo electrónico del usuario (debe coincidir con el del token)',
            example: 'juan@example.com'
          },
          tipo_usuario: {
            type: 'string',
            enum: ['tutor', 'alumno'],
            description: 'Tipo de usuario en el sistema',
            example: 'alumno'
          }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              isNewUser: {
                type: 'boolean',
                description: 'Indica si es un usuario nuevo (registro) o existente (login)',
                example: true
              },
              userType: {
                type: 'string',
                enum: ['tutor', 'alumno'],
                description: 'Tipo de usuario',
                example: 'tutor'
              },
              userId: {
                type: 'string',
                description: 'ID único del usuario',
                example: 'abc123def456'
              },
              token: {
                type: 'string',
                description: 'Token JWT para autenticación',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
              },
              nombre: {
                type: 'string',
                description: 'Nombre del usuario',
                example: 'Juan Pérez'
              }
            }
          },
          message: {
            type: 'string',
            description: 'Mensaje descriptivo del resultado',
            example: 'Tutor registrado exitosamente'
          },
          status: {
            type: 'string',
            enum: ['success'],
            description: 'Estado de la respuesta',
            example: 'success'
          }
        }
      },
      FirebaseAuthResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              isNewUser: {
                type: 'boolean',
                description: 'Indica si es un usuario nuevo (registro) o existente (login)',
                example: true
              },
              userType: {
                type: 'string',
                enum: ['tutor', 'alumno'],
                description: 'Tipo de usuario',
                example: 'alumno'
              },
              userId: {
                type: 'string',
                description: 'ID único del usuario',
                example: 'abc123def456'
              },
              token: {
                type: 'string',
                description: 'Token JWT para autenticación',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
              },
              nombre: {
                type: 'string',
                description: 'Nombre completo del usuario',
                example: 'Juan Pérez'
              },
              correo: {
                type: 'string',
                format: 'email',
                description: 'Correo del usuario',
                example: 'juan@example.com'
              },
              firebase_uid: {
                type: 'string',
                description: 'UID del usuario en Firebase',
                example: 'firebase_uid_12345'
              }
            }
          },
          message: {
            type: 'string',
            description: 'Mensaje descriptivo del resultado',
            example: 'Alumno registrado exitosamente con Firebase'
          },
          status: {
            type: 'string',
            enum: ['success'],
            description: 'Estado de la respuesta',
            example: 'success'
          }
        }
      },
      UserProfile: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  userId: {
                    type: 'string',
                    description: 'ID del usuario',
                    example: 'abc123def456'
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'Correo del usuario',
                    example: 'usuario@example.com'
                  },
                  userType: {
                    type: 'string',
                    enum: ['tutor', 'alumno'],
                    description: 'Tipo de usuario',
                    example: 'tutor'
                  }
                }
              },
              message: {
                type: 'string',
                description: 'Mensaje adicional',
                example: 'Perfil obtenido exitosamente'
              }
            }
          },
          message: {
            type: 'string',
            description: 'Mensaje de la respuesta',
            example: 'Acceso autorizado'
          },
          status: {
            type: 'string',
            enum: ['success'],
            example: 'success'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'null',
            description: 'Siempre null en respuestas de error'
          },
          message: {
            type: 'string',
            description: 'Descripción del error',
            example: 'Token de autorización requerido'
          },
          status: {
            type: 'string',
            enum: ['error'],
            description: 'Estado de error',
            example: 'error'
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Código de error específico',
                example: 'AUTHORIZATION_REQUIRED'
              },
              details: {
                type: 'object',
                description: 'Detalles adicionales del error (opcional)'
              }
            }
          }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              service: {
                type: 'string',
                description: 'Nombre del servicio',
                example: 'auth-service'
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Timestamp del health check',
                example: '2024-01-01T00:00:00.000Z'
              }
            }
          },
          message: {
            type: 'string',
            description: 'Estado del servicio',
            example: 'Servicio de autenticación funcionando correctamente'
          },
          status: {
            type: 'string',
            enum: ['success'],
            example: 'success'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoints relacionados con autenticación y autorización'
    },
    {
      name: 'Health',
      description: 'Endpoints de monitoreo y salud del servicio'
    },
    {
      name: 'Protected',
      description: 'Endpoints que requieren autenticación'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/infrastructure/routes/*.ts', 
    './src/infrastructure/server/*.ts',
    './dist/infrastructure/routes/*.js',
    './dist/infrastructure/server/*.js'
  ],
};

export const swaggerSpec = swaggerJSDoc(options); 