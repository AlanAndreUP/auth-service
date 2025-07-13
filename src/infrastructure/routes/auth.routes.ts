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
   *     summary: Valida usuario desde Firebase y maneja registro/login tradicional
   *     description: Valida un usuario existente o registra uno nuevo usando email y contraseña
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - correo
   *               - contraseña
   *               - tipo_usuario
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
   *               tipo_usuario:
   *                 type: string
   *                 enum: [tutor, alumno]
   *                 description: Tipo de usuario
   *                 example: "tutor"
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
   *     summary: Autenticación con Firebase
   *     description: Autentica o registra un usuario usando Firebase Authentication
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
   *               - tipo_usuario
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
   *               tipo_usuario:
   *                 type: string
   *                 enum: [tutor, alumno]
   *                 description: Tipo de usuario
   *                 example: "alumno"
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
   * /auth/profile:
   *   get:
   *     tags: [Protected]
   *     summary: Obtiene el perfil del usuario autenticado
   *     description: Devuelve la información del usuario actualmente autenticado
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil del usuario obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserProfile'
   *       401:
   *         description: Token de autorización requerido o inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               missing_token:
   *                 summary: Token faltante
   *                 value:
   *                   data: null
   *                   message: "Token de autorización requerido"
   *                   status: "error"
   *                   error:
   *                     code: "AUTHORIZATION_REQUIRED"
   *               invalid_token:
   *                 summary: Token inválido
   *                 value:
   *                   data: null
   *                   message: "Token de autorización inválido"
   *                   status: "error"
   *                   error:
   *                     code: "INVALID_TOKEN"
   *               expired_token:
   *                 summary: Token expirado
   *                 value:
   *                   data: null
   *                   message: "Token de autorización expirado"
   *                   status: "error"
   *                   error:
   *                     code: "TOKEN_EXPIRED"
   */
  router.get('/profile', authMiddleware, (req: AuthenticatedRequest, res) => {
    res.json({
      data: {
        user: req.user,
        message: 'Perfil obtenido exitosamente'
      },
      message: 'Acceso autorizado',
      status: 'success'
    });
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