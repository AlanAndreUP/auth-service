import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ErrorResponse } from '@shared/types/response.types';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: 'tutor' | 'alumno';
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      const errorResponse: ErrorResponse = {
        data: null,
        message: 'Token de autorización requerido',
        status: 'error',
        error: {
          code: 'AUTHORIZATION_REQUIRED'
        }
      };
      res.status(401).json(errorResponse);
      return;
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    
    if (!token) {
      const errorResponse: ErrorResponse = {
        data: null,
        message: 'Token de autorización inválido',
        status: 'error',
        error: {
          code: 'INVALID_TOKEN_FORMAT'
        }
      };
      res.status(401).json(errorResponse);
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET no está configurado');
      const errorResponse: ErrorResponse = {
        data: null,
        message: 'Error de configuración del servidor',
        status: 'error',
        error: {
          code: 'SERVER_CONFIGURATION_ERROR'
        }
      };
      res.status(500).json(errorResponse);
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    
    if (!decoded.userId || !decoded.email || !decoded.userType) {
      const errorResponse: ErrorResponse = {
        data: null,
        message: 'Token de autorización inválido',
        status: 'error',
        error: {
          code: 'INVALID_TOKEN_PAYLOAD'
        }
      };
      res.status(401).json(errorResponse);
      return;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      userType: decoded.userType
    };

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    
    let errorMessage = 'Token de autorización inválido';
    let errorCode = 'INVALID_TOKEN';

    if (error instanceof jwt.TokenExpiredError) {
      errorMessage = 'Token de autorización expirado';
      errorCode = 'TOKEN_EXPIRED';
    } else if (error instanceof jwt.JsonWebTokenError) {
      errorMessage = 'Token de autorización malformado';
      errorCode = 'MALFORMED_TOKEN';
    }

    const errorResponse: ErrorResponse = {
      data: null,
      message: errorMessage,
      status: 'error',
      error: {
        code: errorCode
      }
    };

    res.status(401).json(errorResponse);
  }
};

export const requireRole = (allowedRoles: ('tutor' | 'alumno')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const errorResponse: ErrorResponse = {
        data: null,
        message: 'Usuario no autenticado',
        status: 'error',
        error: {
          code: 'USER_NOT_AUTHENTICATED'
        }
      };
      res.status(401).json(errorResponse);
      return;
    }

    if (!allowedRoles.includes(req.user.userType)) {
      const errorResponse: ErrorResponse = {
        data: null,
        message: 'No tienes permisos para acceder a este recurso',
        status: 'error',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: { requiredRoles: allowedRoles, userRole: req.user.userType }
        }
      };
      res.status(403).json(errorResponse);
      return;
    }

    next();
  };
}; 