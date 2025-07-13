import { Request, Response } from 'express';
import { ValidateAuthUseCase } from '@application/use-cases/ValidateAuth.usecase';
import { FirebaseAuthUseCase } from '@application/use-cases/FirebaseAuth.usecase';
import { ApiResponse, AuthValidateRequest, FirebaseAuthRequest, ErrorResponse } from '@shared/types/response.types';
import Joi from 'joi';

export class AuthController {
  constructor(
    private readonly validateAuthUseCase: ValidateAuthUseCase,
    private readonly firebaseAuthUseCase: FirebaseAuthUseCase
  ) {}

  private validateRequest = Joi.object({
    correo: Joi.string().email().required().messages({
      'string.email': 'El correo debe tener un formato válido',
      'any.required': 'El correo es requerido'
    }),
    contraseña: Joi.string().min(6).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
    tipo_usuario: Joi.string().valid('tutor', 'alumno').required().messages({
      'any.only': 'El tipo de usuario debe ser tutor o alumno',
      'any.required': 'El tipo de usuario es requerido'
    })
  });

  private validateFirebaseRequest = Joi.object({
    firebase_token: Joi.string().required().messages({
      'any.required': 'El token de Firebase es requerido'
    }),
    nombre: Joi.string().min(2).max(100).required().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede tener más de 100 caracteres',
      'any.required': 'El nombre es requerido'
    }),
    correo: Joi.string().email().required().messages({
      'string.email': 'El correo debe tener un formato válido',
      'any.required': 'El correo es requerido'
    }),
    tipo_usuario: Joi.string().valid('tutor', 'alumno').required().messages({
      'any.only': 'El tipo de usuario debe ser tutor o alumno',
      'any.required': 'El tipo de usuario es requerido'
    })
  });

  private getClientInfo(req: Request): { ip: string; userAgent: string } {
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    const userAgent = req.get('User-Agent') || 'Unknown';
    return { ip, userAgent };
  }

  validate = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar entrada
      const { error, value } = this.validateRequest.validate(req.body);
      
      if (error) {
        const errorResponse: ErrorResponse = {
          data: null,
          message: 'Datos de entrada inválidos',
          status: 'error',
          error: {
            code: 'VALIDATION_ERROR',
            details: error.details.map((detail: any) => detail.message)
          }
        };
        res.status(400).json(errorResponse);
        return;
      }

      const request: AuthValidateRequest = value;
      const { ip, userAgent } = this.getClientInfo(req);
      
      const result = await this.validateAuthUseCase.execute(request, ip, userAgent);

      let message = '';
      if (result.isNewUser) {
        message = result.userType === 'tutor' 
          ? 'Tutor registrado exitosamente' 
          : 'Alumno registrado exitosamente';
      } else {
        message = result.userType === 'tutor'
          ? 'Tutor autenticado exitosamente'
          : 'Alumno autenticado exitosamente';
      }

      const response: ApiResponse = {
        data: result,
        message,
        status: 'success'
      };

      res.status(result.isNewUser ? 201 : 200).json(response);
    } catch (error) {
      console.error('Error in validate endpoint:', error);
      
      const errorResponse: ErrorResponse = {
        data: null,
        message: error instanceof Error ? error.message : 'Error interno del servidor',
        status: 'error',
        error: {
          code: 'AUTH_ERROR'
        }
      };

      res.status(500).json(errorResponse);
    }
  };

  firebaseAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar entrada
      const { error, value } = this.validateFirebaseRequest.validate(req.body);
      
      if (error) {
        const errorResponse: ErrorResponse = {
          data: null,
          message: 'Datos de entrada inválidos',
          status: 'error',
          error: {
            code: 'VALIDATION_ERROR',
            details: error.details.map((detail: any) => detail.message)
          }
        };
        res.status(400).json(errorResponse);
        return;
      }

      const request: FirebaseAuthRequest = value;
      const { ip, userAgent } = this.getClientInfo(req);
      
      const result = await this.firebaseAuthUseCase.execute(request, ip, userAgent);

      let message = '';
      if (result.isNewUser) {
        message = result.userType === 'tutor' 
          ? 'Tutor registrado exitosamente con Firebase' 
          : 'Alumno registrado exitosamente con Firebase';
      } else {
        message = result.userType === 'tutor'
          ? 'Tutor autenticado exitosamente con Firebase'
          : 'Alumno autenticado exitosamente con Firebase';
      }

      const response: ApiResponse = {
        data: result,
        message,
        status: 'success'
      };

      res.status(result.isNewUser ? 201 : 200).json(response);
    } catch (error) {
      console.error('Error in firebaseAuth endpoint:', error);
      
      const errorResponse: ErrorResponse = {
        data: null,
        message: error instanceof Error ? error.message : 'Error interno del servidor',
        status: 'error',
        error: {
          code: 'FIREBASE_AUTH_ERROR'
        }
      };

      res.status(500).json(errorResponse);
    }
  };
} 