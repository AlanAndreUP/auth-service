import { UserRepository } from '@domain/repositories/UserRepository.interface';
import { User } from '@domain/entities/User.entity';
import { EmailService, LoginNotificationData, RegistroNotificationData } from '@application/services/Email.service';
import { AuthValidateRequest, AuthValidateResponse } from '@shared/types/response.types';
import { InstitutionCode } from '@domain/value-objects/InstitutionCode';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class ValidateAuthUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly jwtSecret: string
  ) {}

  async execute(request: AuthValidateRequest, ip: string, userAgent: string): Promise<AuthValidateResponse> {
    const { correo, contraseña, codigo_institucion } = request;

    // Buscar usuario existente
    const existingUser = await this.userRepository.findByEmail(correo);

    if (existingUser) {
      // Usuario existente - proceso de login
      const isValidPassword = await bcrypt.compare(contraseña, existingUser.contraseña);
      
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }

      if (existingUser.isDeleted()) {
        throw new Error('Usuario desactivado');
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: existingUser.id, 
          email: existingUser.correo,
          userType: existingUser.tipo_usuario,
          firebase_uid: existingUser.firebase_uid
        },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      // Enviar notificación de login
      try {
        const loginData: LoginNotificationData = {
          nombre: existingUser.nombre,
          correo: existingUser.correo,
          ip,
          userAgent,
          fechaLogin: new Date(),
          tipoUsuario: existingUser.tipo_usuario
        };
        
        await this.emailService.sendLoginExitoso(loginData);
      } catch (emailError) {
        console.error('Error enviando notificación de login:', emailError);
        // No interrumpir el flujo por error de email
      }

      return {
        isNewUser: false,
        userType: existingUser.tipo_usuario,
        userId: existingUser.id,
        token,
        nombre: existingUser.nombre,
        codigoInstitucion: existingUser.codigo_institucion,
        institucionNombre: this.getInstitutionName(existingUser.codigo_institucion)
      };
    } else {
      // Nuevo usuario - proceso de registro
      // Determinar tipo de usuario basado en el código de institución
      let tipoUsuario: 'tutor' | 'alumno' = 'alumno'; // Por defecto alumno
      let codigoInstitucionFinal: string | undefined;
      
      if (codigo_institucion && codigo_institucion.trim()) {
        try {
          const institutionCodeVO = InstitutionCode.create(codigo_institucion);
          tipoUsuario = institutionCodeVO.getAssociatedUserType();
          codigoInstitucionFinal = institutionCodeVO.value;
        } catch (error) {
          // Si el código es inválido, se mantiene como alumno
          console.warn('Código de institución inválido:', codigo_institucion);
        }
      }
      
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      
      const newUser = User.create(
        correo, // Usar correo como nombre por defecto en método tradicional
        correo,
        hashedPassword,
        tipoUsuario,
        undefined, // sin firebase_uid
        codigoInstitucionFinal
      );
      
      const savedUser = await this.userRepository.save(newUser);

      // Generar token JWT para nuevo usuario
      const token = jwt.sign(
        { 
          userId: savedUser.id, 
          email: savedUser.correo,
          userType: savedUser.tipo_usuario,
          firebase_uid: savedUser.firebase_uid
        },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      // Enviar notificación de registro
      try {
        const registroData: RegistroNotificationData = {
          nombre: savedUser.nombre,
          correo: savedUser.correo,
          ip,
          userAgent,
          fechaRegistro: new Date(),
          tipoUsuario: savedUser.tipo_usuario
        };
        
        await this.emailService.sendRegistroExitoso(registroData);
      } catch (emailError) {
        console.error('Error enviando notificación de registro:', emailError);
        // No interrumpir el flujo por error de email
      }

      return {
        isNewUser: true,
        userType: savedUser.tipo_usuario,
        userId: savedUser.id,
        token,
        nombre: savedUser.nombre,
        codigoInstitucion: savedUser.codigo_institucion,
        institucionNombre: this.getInstitutionName(savedUser.codigo_institucion)
      };
    }
  }

  private getInstitutionName(codigoInstitucion?: string): string {
    if (!codigoInstitucion) {
      return 'Sin institución';
    }
    
    try {
      const institutionCode = InstitutionCode.create(codigoInstitucion);
      return institutionCode.getInstitutionName();
    } catch {
      return 'Sin institución';
    }
  }
} 