import { Router } from 'express';
import { AuthController } from '@infrastructure/controllers/Auth.controller';
import { ValidateAuthUseCase } from '@application/use-cases/ValidateAuth.usecase';
import { MongoUserRepository } from '@infrastructure/repositories/MongoUser.repository';
import { authMiddleware, requireRole, AuthenticatedRequest } from '@infrastructure/middlewares/auth.middleware';

export function createAuthRoutes(): Router {
  const router = Router();
  
  // Dependencias
  const userRepository = new MongoUserRepository();
  const validateAuthUseCase = new ValidateAuthUseCase(
    userRepository,
    process.env.JWT_SECRET || 'default-secret'
  );
  const authController = new AuthController(validateAuthUseCase);

  // Rutas públicas
  /**
   * @swagger
   * /auth/validate:
   *   post:
   *     tags: [Authentication]
   *     summary: Valida usuario y maneja registro/login
   *     description: |
   *       Endpoint principal para autenticación que:
   *       - **Registra** un nuevo usuario si no existe
   *       - **Autentica** un usuario existente si ya está registrado
   *       
   *       Devuelve un token JWT válido para ambos casos.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AuthValidateRequest'
   *           examples:
   *             tutor:
   *               summary: Registro/Login de Tutor
   *               value:
   *                 correo: "tutor@example.com"
   *                 contraseña: "password123"
   *                 tipo_usuario: "tutor"
   *             alumno:
   *               summary: Registro/Login de Alumno
   *               value:
   *                 correo: "alumno@example.com"
   *                 contraseña: "password123"
   *                 tipo_usuario: "alumno"
   *     responses:
   *       201:
   *         description: Usuario registrado exitosamente (nuevo usuario)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthValidateResponse'
   *             example:
   *               data:
   *                 isNewUser: true
   *                 userType: "tutor"
   *                 userId: "abc123def456"
   *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *               message: "Tutor registrado exitosamente"
   *               status: "success"
   *       200:
   *         description: Usuario autenticado exitosamente (usuario existente)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthValidateResponse'
   *             example:
   *               data:
   *                 isNewUser: false
   *                 userType: "tutor"
   *                 userId: "abc123def456"
   *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *               message: "Tutor autenticado exitosamente"
   *               status: "success"
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               data: null
   *               message: "Datos de entrada inválidos"
   *               status: "error"
   *               error:
   *                 code: "VALIDATION_ERROR"
   *                 details: ["El correo debe tener un formato válido"]
   *       401:
   *         description: Credenciales inválidas
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