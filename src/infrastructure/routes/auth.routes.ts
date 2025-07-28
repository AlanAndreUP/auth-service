import { Router } from 'express';
import { AuthController } from '@infrastructure/controllers/Auth.controller';
import { ValidateAuthUseCase } from '@application/use-cases/ValidateAuth.usecase';
import { FirebaseAuthUseCase } from '@application/use-cases/FirebaseAuth.usecase';
import { MongoUserRepository } from '@infrastructure/repositories/MongoUser.repository';
import { MongoTutorCodeRepository } from '@infrastructure/repositories/MongoTutorCode.repository';
import { TutorCode } from '@domain/entities/TutorCode.entity';
import { FirebaseService } from '@application/services/Firebase.service';
import { EmailService } from '@application/services/Email.service';
import { authMiddleware, requireRole, AuthenticatedRequest } from '@infrastructure/middlewares/auth.middleware';
import { AppointmentService } from '@application/services/Appointment.service';
import { ChatService } from '@application/services/Chat.service';
import { GeminiTriajeService } from '@application/services/GeminiTriaje.service';
import { GetAlumnosWithTriajeUseCase } from '@application/use-cases/GetAlumnosWithTriaje.usecase';

export function createAuthRoutes(): Router {
  const router = Router();
  
  // Dependencias
  const userRepository = new MongoUserRepository();
  const tutorCodeRepository = new MongoTutorCodeRepository();
  const firebaseService = FirebaseService.getInstance();
  const emailService = new EmailService();
  const jwtSecret = process.env.JWT_SECRET || 'default-secret';
  
  // Casos de uso
  const validateAuthUseCase = new ValidateAuthUseCase(userRepository, emailService, jwtSecret);
  const firebaseAuthUseCase = new FirebaseAuthUseCase(userRepository, firebaseService, emailService, jwtSecret);
  // Servicios y caso de uso para triaje
  const appointmentService = new AppointmentService();
  const chatService = new ChatService();
  const geminiTriajeService = new GeminiTriajeService();
  const getAlumnosWithTriajeUseCase = new GetAlumnosWithTriajeUseCase(
    userRepository,
    appointmentService,
    chatService,
    geminiTriajeService
  );
  
  // Controlador
  const authController = new AuthController(validateAuthUseCase, firebaseAuthUseCase, getAlumnosWithTriajeUseCase);

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


  // Endpoint público para obtener todos los usuarios
  /**
   * @swagger
   * /auth/users:
   *   get:
   *     tags: [Public]
   *     summary: Obtiene todos los usuarios
   *     description: |
   *       Devuelve una lista de todos los usuarios registrados.
   *       Solo incluye información básica: ID, nombre y correo.
   *       Este endpoint es público y no requiere autenticación.
   *     responses:
   *       200:
   *         description: Lista de usuarios obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     users:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             description: ID único del usuario
   *                             example: "abc123def456"
   *                           nombre:
   *                             type: string
   *                             description: Nombre del usuario
   *                             example: "Juan Pérez"
   *                           correo:
   *                             type: string
   *                             format: email
   *                             description: Correo electrónico del usuario
   *                             example: "juan@example.com"
   *                           tipo_usuario:
   *                             type: string
   *                             enum: [tutor, alumno]
   *                             description: Tipo de usuario
   *                             example: "tutor"
   *                     total:
   *                       type: integer
   *                       description: Número total de usuarios
   *                       example: 10
   *                 message:
   *                   type: string
   *                   example: "Usuarios obtenidos exitosamente"
   *                 status:
   *                   type: string
   *                   example: "success"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/users', (req, res) => authController.getAlumnosWithTriaje(req, res));

  // Endpoint público para obtener todos los tutores
  /**
   * @swagger
   * /auth/tutors:
   *   get:
   *     tags: [Public]
   *     summary: Obtiene todos los tutores
   *     description: |
   *       Devuelve una lista de todos los usuarios con rol de tutor.
   *       Solo incluye información básica: ID, nombre y correo.
   *       Este endpoint es público y no requiere autenticación.
   *     responses:
   *       200:
   *         description: Lista de tutores obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     tutors:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             description: ID único del tutor
   *                             example: "tutor001"
   *                           nombre:
   *                             type: string
   *                             description: Nombre del tutor
   *                             example: "María González"
   *                           correo:
   *                             type: string
   *                             format: email
   *                             description: Correo electrónico del tutor
   *                             example: "maria@example.com"
   *                     total:
   *                       type: integer
   *                       description: Número total de tutores
   *                       example: 5
   *                 message:
   *                   type: string
   *                   example: "Tutores obtenidos exitosamente"
   *                 status:
   *                   type: string
   *                   example: "success"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/tutors', async (req, res) => {
    try {
      const tutors = await userRepository.findAllTutors();
      
      const tutorsList = tutors.map((tutor: any) => ({
        id: tutor.id,
        nombre: tutor.nombre,
        correo: tutor.correo
      }));

      res.json({
        data: {
          tutors: tutorsList,
          total: tutorsList.length
        },
        message: 'Tutores obtenidos exitosamente',
        status: 'success'
      });
    } catch (error) {
      console.error('Error al obtener todos los tutores:', error);
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

  // Endpoint público para obtener usuario por ID
  /**
   * @swagger
   * /auth/user/{userId}:
   *   get:
   *     tags: [Public]
   *     summary: Obtiene un usuario por ID
   *     description: |
   *       Devuelve la información de un usuario específico por su ID.
   *       Solo incluye información básica: ID, nombre y correo.
   *       Este endpoint es público y no requiere autenticación.
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
   *         description: Usuario obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           description: ID único del usuario
   *                           example: "abc123def456"
   *                         nombre:
   *                           type: string
   *                           description: Nombre del usuario
   *                           example: "Juan Pérez"
   *                         correo:
   *                           type: string
   *                           format: email
   *                           description: Correo electrónico del usuario
   *                           example: "juan@example.com"
   *                         tipo_usuario:
   *                           type: string
   *                           enum: [tutor, alumno]
   *                           description: Tipo de usuario
   *                           example: "tutor"
   *                 message:
   *                   type: string
   *                   example: "Usuario obtenido exitosamente"
   *                 status:
   *                   type: string
   *                   example: "success"
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
  router.get('/user/:userId', async (req, res) => {
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

      const user = await userRepository.findById(userId);
      
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
            tipo_usuario: user.tipo_usuario
          }
        },
        message: 'Usuario obtenido exitosamente',
        status: 'success'
      });
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
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

  // Endpoint público para crear códigos de tutores
  /**
   * @swagger
   * /auth/tutor-codes:
   *   post:
   *     tags: [Public]
   *     summary: Crea códigos de tutores
   *     description: |
   *       Crea códigos únicos para tutores y los envía por email.
   *       Este endpoint es público y no requiere autenticación.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - emails
   *             properties:
   *               emails:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: email
   *                 description: Lista de emails para generar códigos
   *                 example: ["tutor1@example.com", "tutor2@example.com"]
   *     responses:
   *       201:
   *         description: Códigos de tutores creados exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     codes:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             description: ID del código
   *                             example: "code001"
   *                           code:
   *                             type: string
   *                             description: Código generado
   *                             example: "ABC12345"
   *                           email:
   *                             type: string
   *                             format: email
   *                             description: Email del tutor
   *                             example: "tutor1@example.com"
   *                     total:
   *                       type: integer
   *                       description: Número de códigos creados
   *                       example: 2
   *                 message:
   *                   type: string
   *                   example: "Códigos de tutores creados y enviados exitosamente"
   *                 status:
   *                   type: string
   *                   example: "success"
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
  router.post('/tutor-codes', async (req, res) => {
    try {
      const { emails } = req.body;
      
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({
          data: null,
          message: 'Lista de emails requerida',
          status: 'error',
          error: {
            code: 'EMAILS_REQUIRED'
          }
        });
      }

      const createdCodes = [];

      for (const email of emails) {
        try {
          // Generar código único
          const code = await tutorCodeRepository.generateUniqueCode();
          
          // Crear entidad del código
          const tutorCode = TutorCode.create(code, email);
          
          // Guardar en base de datos
          const savedCode = await tutorCodeRepository.save(tutorCode);
          
          // Enviar email con el código
          await emailService.sendTutorCodeEmail(email, code);
          
          createdCodes.push({
            id: savedCode.id,
            code: savedCode.code,
            email: savedCode.email
          });
        } catch (error) {
          console.error(`Error procesando email ${email}:`, error);
          // Continuar con el siguiente email
        }
      }

      res.status(201).json({
        data: {
          codes: createdCodes,
          total: createdCodes.length
        },
        message: 'Códigos de tutores creados y enviados exitosamente',
        status: 'success'
      });
    } catch (error) {
      console.error('Error al crear códigos de tutores:', error);
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

  // Endpoint público para enviar códigos de tutores por email
  /**
   * @swagger
   * /auth/tutor-codes/send:
   *   post:
   *     tags: [Public]
   *     summary: Envía códigos de tutores por email
   *     description: |
   *       Envía códigos de tutores existentes a emails específicos.
   *       Este endpoint es público y no requiere autenticación.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - emails
   *             properties:
   *               emails:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: email
   *                 description: Lista de emails para enviar códigos
   *                 example: ["tutor1@example.com", "tutor2@example.com"]
   *     responses:
   *       200:
   *         description: Códigos enviados exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     sent:
   *                       type: integer
   *                       description: Número de códigos enviados
   *                       example: 2
   *                     failed:
   *                       type: integer
   *                       description: Número de emails que fallaron
   *                       example: 0
   *                 message:
   *                   type: string
   *                   example: "Códigos de tutores enviados exitosamente"
   *                 status:
   *                   type: string
   *                   example: "success"
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
  router.post('/tutor-codes/send', async (req, res) => {
    try {
      const { emails } = req.body;
      
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({
          data: null,
          message: 'Lista de emails requerida',
          status: 'error',
          error: {
            code: 'EMAILS_REQUIRED'
          }
        });
      }

      let sentCount = 0;
      let failedCount = 0;

      for (const email of emails) {
        try {
          // Buscar códigos no utilizados para este email
          const codes = await tutorCodeRepository.findByEmail(email);
          const unusedCodes = codes.filter(code => !code.isUsed);
          
          if (unusedCodes.length > 0) {
            // Enviar el primer código no utilizado
            const codeToSend = unusedCodes[0];
            await emailService.sendTutorCodeEmail(email, codeToSend.code);
            sentCount++;
          } else {
            // No hay códigos disponibles, crear uno nuevo
            const code = await tutorCodeRepository.generateUniqueCode();
            const tutorCode = TutorCode.create(code, email);
            await tutorCodeRepository.save(tutorCode);
            await emailService.sendTutorCodeEmail(email, code);
            sentCount++;
          }
        } catch (error) {
          console.error(`Error enviando código a ${email}:`, error);
          failedCount++;
        }
      }

      res.json({
        data: {
          sent: sentCount,
          failed: failedCount
        },
        message: 'Códigos de tutores enviados exitosamente',
        status: 'success'
      });
    } catch (error) {
      console.error('Error al enviar códigos de tutores:', error);
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
  router.get('/profile/:userId', async (req: AuthenticatedRequest, res) => {
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
      const user = await userRepository.findById(userId);
      console.log(user);
      
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

  // Endpoint público para obtener usuarios por rol
  /**
   * @swagger
   * /auth/users/{userType}:
   *   get:
   *     tags: [Public]
   *     summary: Obtiene lista de usuarios por tipo
   *     description: |
   *       Devuelve una lista de usuarios filtrados por tipo (tutor o alumno).
   *       Solo incluye información básica: nombre y correo.
   *       Este endpoint es público y no requiere autenticación.
   *     parameters:
   *       - in: path
   *         name: userType
   *         required: true
   *         schema:
   *           type: string
   *           enum: [tutor, alumno]
   *         description: Tipo de usuario a consultar
   *         example: "tutor"
   *     responses:
   *       200:
   *         description: Lista de usuarios obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     users:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             description: ID único del usuario
   *                             example: "abc123def456"
   *                           nombre:
   *                             type: string
   *                             description: Nombre del usuario
   *                             example: "Juan Pérez"
   *                           correo:
   *                             type: string
   *                             format: email
   *                             description: Correo electrónico del usuario
   *                             example: "juan@example.com"
   *                     total:
   *                       type: integer
   *                       description: Número total de usuarios encontrados
   *                       example: 5
   *                     userType:
   *                       type: string
   *                       description: Tipo de usuario consultado
   *                       example: "tutor"
   *                 message:
   *                   type: string
   *                   example: "Usuarios obtenidos exitosamente"
   *                 status:
   *                   type: string
   *                   example: "success"
   *             examples:
   *               tutores:
   *                 summary: Lista de tutores
   *                 value:
   *                   data:
   *                     users:
   *                       - id: "tutor001"
   *                         nombre: "María González"
   *                         correo: "maria@example.com"
   *                       - id: "tutor002"
   *                         nombre: "Carlos López"
   *                         correo: "carlos@example.com"
   *                     total: 2
   *                     userType: "tutor"
   *                   message: "Usuarios obtenidos exitosamente"
   *                   status: "success"
   *               alumnos:
   *                 summary: Lista de alumnos
   *                 value:
   *                   data:
   *                     users:
   *                       - id: "alumno001"
   *                         nombre: "Ana García"
   *                         correo: "ana@example.com"
   *                       - id: "alumno002"
   *                         nombre: "Luis Rodríguez"
   *                         correo: "luis@example.com"
   *                       - id: "alumno003"
   *                         nombre: "Sofia Martínez"
   *                         correo: "sofia@example.com"
   *                     total: 3
   *                     userType: "alumno"
   *                   message: "Usuarios obtenidos exitosamente"
   *                   status: "success"
   *       400:
   *         description: Tipo de usuario inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               data: null
   *               message: "Tipo de usuario inválido. Debe ser 'tutor' o 'alumno'"
   *               status: "error"
   *               error:
   *                 code: "INVALID_USER_TYPE"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/users/type/:userType', async (req, res) => {
    try {
      const { userType } = req.params;
      
      // Validar que el tipo de usuario sea válido
      if (!['tutor', 'alumno'].includes(userType)) {
        return res.status(400).json({
          data: null,
          message: "Tipo de usuario inválido. Debe ser 'tutor' o 'alumno'",
          status: 'error',
          error: {
            code: 'INVALID_USER_TYPE'
          }
        });
      }

      // Buscar usuarios por tipo en el repositorio
      const users = await userRepository.findByUserType(userType as 'tutor' | 'alumno');
      
      // Mapear ID, nombre y correo
      const usersList = users.map((user: any) => ({
        id: user.id,
        nombre: user.nombre,
        correo: user.correo
      }));

      res.json({
        data: {
          users: usersList,
          total: usersList.length,
          userType: userType
        },
        message: 'Usuarios obtenidos exitosamente',
        status: 'success'
      });
    } catch (error) {
      console.error('Error al obtener usuarios por tipo:', error);
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

  return router;
} 