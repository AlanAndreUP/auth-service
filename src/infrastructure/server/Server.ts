import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { createAuthRoutes } from '@infrastructure/routes/auth.routes';
import { connectDatabase } from '@infrastructure/database/connection';
import { errorHandler, notFoundHandler } from '@infrastructure/middlewares/error.middleware';
import { swaggerSpec } from '@infrastructure/config/swagger.config';

export class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3003');
    
    this.middlewares();
    this.routes();
    this.connectDB();
  }

  private middlewares(): void {
    // Configurar trust proxy para rate limiting
    this.app.set('trust proxy', true);
    
    // Seguridad
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // máximo 100 requests por IP por ventana
      message: {
        data: null,
        message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
        status: 'error'
      },
      keyGenerator: (req) => {
        // Usar X-Forwarded-For si está disponible, sino usar la IP directa
        const forwardedFor = req.headers['x-forwarded-for']?.toString();
        return forwardedFor ? forwardedFor.split(',')[0].trim() : (req.ip || 'unknown');
      },
      skip: (req) => {
        // Saltar rate limiting para health checks
        return req.path === '/health';
      }
    });
    this.app.use(limiter);

    // Parsers
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    // Swagger documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Auth Service API Documentation',
      customfavIcon: 'https://swagger.io/favicon.ico'
    }));

    // Swagger JSON endpoint
    this.app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // Health check
    /**
     * @swagger
     * /health:
     *   get:
     *     tags: [Health]
     *     summary: Health check del servicio
     *     description: Verifica que el servicio de autenticación esté funcionando correctamente
     *     responses:
     *       200:
     *         description: Servicio funcionando correctamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HealthResponse'
     *             example:
     *               data:
     *                 service: "auth-service"
     *                 timestamp: "2024-01-01T00:00:00.000Z"
     *               message: "Servicio de autenticación funcionando correctamente"
     *               status: "success"
     */
    this.app.get('/health', (req, res) => {
      res.json({
        data: { service: 'auth-service', timestamp: new Date().toISOString() },
        message: 'Servicio de autenticación funcionando correctamente',
        status: 'success'
      });
    });

    // Auth routes
    this.app.use('/auth', createAuthRoutes());

    // 404 handler
    this.app.use('*', notFoundHandler);

    // Error handling middleware (debe ser el último)
    this.app.use(errorHandler);
  }

  private async connectDB(): Promise<void> {
    try {
      await connectDatabase();
      console.log('📊 Base de datos conectada exitosamente');
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error);
      process.exit(1);
    }
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`\n🚀 Servidor de autenticación corriendo en puerto ${this.port}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n📡 Endpoints disponibles:`);
      console.log(`   • Health Check: http://localhost:${this.port}/health`);
      console.log(`   • API Docs:     http://localhost:${this.port}/api-docs`);
      console.log(`   • Auth API:     http://localhost:${this.port}/auth`);
      console.log(`\n📚 Documentación Swagger disponible en:`);
      console.log(`   🔗 http://localhost:${this.port}/api-docs\n`);
    });
  }

  public getApp(): Application {
    return this.app;
  }
} 