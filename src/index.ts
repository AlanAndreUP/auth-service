import dotenv from 'dotenv';
import { Server } from '@infrastructure/server/Server';
import { handleUncaughtExceptions } from '@infrastructure/middlewares/error.middleware';

// Cargar variables de entorno
dotenv.config();

// Configurar manejo de excepciones no capturadas
handleUncaughtExceptions();

// Validar variables de entorno requeridas
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingEnvVars);
  process.exit(1);
}

// Iniciar servidor
const server = new Server();
server.start();

// Manejo graceful de cierre
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT recibido. Cerrando servidor...');
  process.exit(0);
}); 