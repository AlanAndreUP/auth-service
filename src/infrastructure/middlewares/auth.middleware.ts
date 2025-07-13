import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '@shared/types/response.types';
import { FirebaseService } from '@application/services/Firebase.service';
import { MongoUserRepository } from '@infrastructure/repositories/MongoUser.repository';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: 'tutor' | 'alumno';
  };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    // Validar token de Firebase
    const firebaseService = FirebaseService.getInstance();
    const userRepository = new MongoUserRepository();
    
    try {
      const decodedToken = await firebaseService.verifyIdToken(token);
      
      if (!decodedToken.uid || !decodedToken.email) {
        const errorResponse: ErrorResponse = {
          data: null,
          message: 'Token de Firebase inválido',
          status: 'error',
          error: {
            code: 'INVALID_FIREBASE_TOKEN'
          }
        };
        res.status(401).json(errorResponse);
        return;
      }

      // Buscar el usuario en la base de datos
      const user = await userRepository.findByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        const errorResponse: ErrorResponse = {
          data: null,
          message: 'Usuario no encontrado en la base de datos',
          status: 'error',
          error: {
            code: 'USER_NOT_FOUND'
          }
        };
        res.status(404).json(errorResponse);
        return;
      }

      req.user = {
        userId: user.id,
        email: user.correo,
        userType: user.tipo_usuario
      };

      next();
    } catch (firebaseError) {
      console.error('Error al verificar token de Firebase:', firebaseError);
      
      let errorMessage = 'Token de Firebase inválido';
      let errorCode = 'INVALID_FIREBASE_TOKEN';

      if (firebaseError instanceof Error) {
        if (firebaseError.message.includes('expired')) {
          errorMessage = 'Token de Firebase expirado';
          errorCode = 'FIREBASE_TOKEN_EXPIRED';
        } else if (firebaseError.message.includes('revoked')) {
          errorMessage = 'Token de Firebase revocado';
          errorCode = 'FIREBASE_TOKEN_REVOKED';
        }
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
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    
    const errorResponse: ErrorResponse = {
      data: null,
      message: 'Error interno del servidor',
      status: 'error',
      error: {
        code: 'INTERNAL_SERVER_ERROR'
      }
    };

    res.status(500).json(errorResponse);
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