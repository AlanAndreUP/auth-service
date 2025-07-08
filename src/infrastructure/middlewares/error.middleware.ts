import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '@shared/types/response.types';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error implements CustomError {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware de manejo de errores centralizad
 * Debe ser el último middleware en la cadena
 */
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log del error
  console.error('🚨 Error capturado:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Determinar código de estado
  let statusCode = error.statusCode || 500;
  let errorCode = error.code || 'INTERNAL_ERROR';
  let message = error.message || 'Error interno del servidor';
  let details = error.details;

  // Manejo específico de errores conocidos
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Datos de entrada inválidos';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID_FORMAT';
    message = 'Formato de ID inválido';
  } else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = 'Ya existe un registro con estos datos';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Token de autorización inválido';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Token de autorización expirado';
  }

  // En producción, no mostrar detalles técnicos
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Error interno del servidor';
    details = undefined;
  }

  const errorResponse: ErrorResponse = {
    data: null,
    message,
    status: 'error',
    error: {
      code: errorCode,
      ...(details && { details })
    }
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para capturar errores asíncronos
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Ruta ${req.originalUrl} no encontrada`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Manejador de errores no capturados
 */
export const handleUncaughtExceptions = (): void => {
  process.on('uncaughtException', (error: Error) => {
    console.error('💥 Excepción no capturada:', error);
    console.error('🛑 Cerrando aplicación...');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('💥 Promesa rechazada no manejada:', reason);
    console.error('En promise:', promise);
    console.error('🛑 Cerrando aplicación...');
    process.exit(1);
  });
}; 