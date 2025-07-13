import { Router } from 'express';
import { AuthController } from '@infrastructure/controllers/Auth.controller';
import { ValidateAuthUseCase } from '@application/use-cases/ValidateAuth.usecase';
import { FirebaseAuthUseCase } from '@application/use-cases/FirebaseAuth.usecase';
import { MongoUserRepository } from '@infrastructure/repositories/MongoUser.repository';
import { FirebaseService } from '@application/services/Firebase.service';
import { EmailService } from '@application/services/Email.service';
import { authMiddleware, requireRole, AuthenticatedRequest } from '@infrastructure/middlewares/auth.middleware';

export function createAuthRoutes(): Router {
  const router = Router();
  
  // Dependencias
  const userRepository = new MongoUserRepository();
  const firebaseService = FirebaseService.getInstance();
  const emailService = new EmailService();
  const jwtSecret = process.env.JWT_SECRET || 'default-secret';
  
  // Casos de uso
  const validateAuthUseCase = new ValidateAuthUseCase(userRepository, emailService, jwtSecret);
  const firebaseAuthUseCase = new FirebaseAuthUseCase(userRepository, firebaseService, emailService, jwtSecret);
  
  // Controlador
  const authController = new AuthController(validateAuthUseCase, firebaseAuthUseCase);

  /**
   * @swagger
   * /auth/validate:
   *   post:
   *     tags: [Authentication]
   *     summary: Registro y login tradicional con código de institución
   *     description: |
   *       Valida un usuario existente o registra uno nuevo usando email y contraseña.
   *       El tipo de usuario se determina automáticamente por el código de institución:
   *       - Si `codigo_institucion` es "TUTOR": usuario será tutor
   *       - Si `codigo_institucion` es cualquier otro valor o está vacío: usuario será alumno
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - correo
   *               - contraseña
   *             properties:
   *               correo:
   *                 type: string
   *                 format: email
   *                 description: Email del usuario
   *                 example: "usuario@example.com"
   *               contraseña:
   *                 type: string
   *                 minLength: 6
   *                 description: Contraseña del usuario
   *                 example: "password123"
   *               codigo_institucion:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 20
   *                 description: Código de institución (opcional). "TUTOR" = tutor, otros = alumno
   *                 example: "TUTOR"
   *           examples:
   *             tutor:
   *               summary: Registro/Login de Tutor
   *               value:
   *                 correo: "tutor@example.com"
   *                 contraseña: "password123"
   *                 codigo_institucion: "TUTOR"
   *             alumno:
   *               summary: Registro/Login de Alumno
   *               value:
   *                 correo: "alumno@example.com"
   *                 contraseña: "password123"
   *                 codigo_institucion: "ESTUDIANTE"
   *             alumno_sin_codigo:
   *               summary: Registro/Login de Alumno (sin código)
   *               value:
   *                 correo: "alumno@example.com"
   *                 contraseña: "password123"
   *     responses:
   *       200:
   *         description: Usuario autenticado exitosamente (login)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       201:
   *         description: Usuario registrado exitosamente (registro)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/validate', authController.validate);

  /**
   * @swagger
   * /auth/firebase:
   *   post:
   *     tags: [Authentication]
   *     summary: Autenticación con Firebase y código de institución
   *     description: |
   *       Autentica o registra un usuario usando Firebase Authentication.
   *       El tipo de usuario se determina automáticamente por el código de institución:
   *       - Si `codigo_institucion` es "TUTOR": usuario será tutor
   *       - Si `codigo_institucion` es cualquier otro valor o está vacío: usuario será alumno
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - firebase_token
   *               - nombre
   *               - correo
   *             properties:
   *               firebase_token:
   *                 type: string
   *                 description: Token de Firebase ID
   *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN..."
   *               nombre:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *                 description: Nombre completo del usuario
   *                 example: "Juan Pérez"
   *               correo:
   *                 type: string
   *                 format: email
   *                 description: Email del usuario
   *                 example: "juan@example.com"
   *               codigo_institucion:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 20
   *                 description: Código de institución (opcional). "TUTOR" = tutor, otros = alumno
   *                 example: "TUTOR"
   *           examples:
   *             tutor:
   *               summary: Registro/Login de Tutor con Firebase
   *               value:
   *                 firebase_token: "eyJhbGciOiJSUzI1NiIs..."
   *                 nombre: "María González"
   *                 correo: "maria@example.com"
   *                 codigo_institucion: "TUTOR"
   *             alumno:
   *               summary: Registro/Login de Alumno con Firebase
   *               value:
   *                 firebase_token: "eyJhbGciOiJSUzI1NiIs..."
   *                 nombre: "Carlos López"
   *                 correo: "carlos@example.com"
   *                 codigo_institucion: "EST001"
   *     responses:
   *       200:
   *         description: Usuario autenticado exitosamente con Firebase (login)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FirebaseAuthResponse'
   *       201:
   *         description: Usuario registrado exitosamente con Firebase (registro)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FirebaseAuthResponse'
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/firebase', authController.firebaseAuth);

  // Rutas protegidas (requieren autenticación)
  /**
   * @swagger
   * /auth/profile/{userId}:
   *   get:
   *     tags: [Protected]
   *     summary: Obtiene el perfil de un usuario por ID
   *     description: Devuelve la información del usuario especificado por ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del usuario a consultar
   *         example: "abc123def456"
   *     responses:
   *       200:
   *         description: Perfil del usuario obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserProfile'
   *       400:
   *         description: ID de usuario requerido o inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Token de autorización requerido o inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Usuario no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/profile/:userId', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          data: null,
          message: 'ID de usuario requerido',
          status: 'error',
          error: {
            code: 'USER_ID_REQUIRED'
          }
        });
      }

      // Buscar el usuario en el repositorio
      const user = await userRepository.findByEmail(userId);
      
      if (!user) {
        return res.status(404).json({
          data: null,
          message: 'Usuario no encontrado',
          status: 'error',
          error: {
            code: 'USER_NOT_FOUND'
          }
        });
      }

      res.json({
        data: {
          user: {
            id: user.id,
            nombre: user.nombre,
            correo: user.correo,
            tipo_usuario: user.tipo_usuario,
            firebase_uid: user.firebase_uid,
            codigo_institucion: user.codigo_institucion,
            created_at: user.created_at,
            updated_at: user.updated_at
          },
          message: 'Perfil obtenido exitosamente'
        },
        message: 'Acceso autorizado',
        status: 'success'
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        data: null,
        message: 'Error interno del servidor',
        status: 'error',
        error: {
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  });

  // Ruta solo para tutores
  /**
   * @swagger
   * /auth/tutor-only:
   *   get:
   *     tags: [Protected]
   *     summary: Recurso exclusivo para tutores
   *     description: Endpoint que solo pueden acceder usuarios con rol de tutor
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Acceso autorizado como tutor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserProfile'
   *             example:
   *               data:
   *                 user:
   *                   userId: "abc123def456"
   *                   email: "tutor@example.com"
   *                   userType: "tutor"
   *                 message: "Recurso exclusivo para tutores"
   *               message: "Acceso autorizado como tutor"
   *               status: "success"
   *       401:
   *         description: Token de autorización requerido o inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Permisos insuficientes (no es tutor)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               data: null
   *               message: "No tienes permisos para acceder a este recurso"
   *               status: "error"
   *               error:
   *                 code: "INSUFFICIENT_PERMISSIONS"
   *                 details:
   *                   requiredRoles: ["tutor"]
   *                   userRole: "alumno"
   */
  router.get('/tutor-only', authMiddleware, requireRole(['tutor']), (req: AuthenticatedRequest, res) => {
    res.json({
      data: {
        user: req.user,
        message: 'Recurso exclusivo para tutores'
      },
      message: 'Acceso autorizado como tutor',
      status: 'success'
    });
  });

  // Ruta solo para alumnos
  /**
   * @swagger
   * /auth/student-only:
   *   get:
   *     tags: [Protected]
   *     summary: Recurso exclusivo para alumnos
   *     description: Endpoint que solo pueden acceder usuarios con rol de alumno
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Acceso autorizado como alumno
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserProfile'
   *             example:
   *               data:
   *                 user:
   *                   userId: "xyz789abc123"
   *                   email: "alumno@example.com"
   *                   userType: "alumno"
   *                 message: "Recurso exclusivo para alumnos"
   *               message: "Acceso autorizado como alumno"
   *               status: "success"
   *       401:
   *         description: Token de autorización requerido o inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Permisos insuficientes (no es alumno)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               data: null
   *               message: "No tienes permisos para acceder a este recurso"
   *               status: "error"
   *               error:
   *                 code: "INSUFFICIENT_PERMISSIONS"
   *                 details:
   *                   requiredRoles: ["alumno"]
   *                   userRole: "tutor"
   */
  router.get('/student-only', authMiddleware, requireRole(['alumno']), (req: AuthenticatedRequest, res) => {
    res.json({
      data: {
        user: req.user,
        message: 'Recurso exclusivo para alumnos'
      },
      message: 'Acceso autorizado como alumno',
      status: 'success'
    });
  });

  return router;
} 