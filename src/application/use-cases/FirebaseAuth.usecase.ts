import { UserRepository } from '@domain/repositories/UserRepository.interface';
import { User } from '@domain/entities/User.entity';
import { FirebaseService } from '@application/services/Firebase.service';
import { EmailService, LoginNotificationData, RegistroNotificationData } from '@application/services/Email.service';
import { FirebaseAuthRequest, FirebaseAuthResponse } from '@shared/types/response.types';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class FirebaseAuthUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly firebaseService: FirebaseService,
    private readonly emailService: EmailService,
    private readonly jwtSecret: string
  ) {}

  async execute(request: FirebaseAuthRequest, ip: string, userAgent: string): Promise<FirebaseAuthResponse> {
    const { firebase_token, nombre, correo, tipo_usuario } = request;

    // Verificar token de Firebase
    const decodedToken = await this.firebaseService.verifyIdToken(firebase_token);
    
    if (decodedToken.email !== correo) {
      throw new Error('El correo del token no coincide con el correo proporcionado');
    }

    // Buscar usuario por Firebase UID
    let existingUser = await this.userRepository.findByFirebaseUid(decodedToken.uid);

    if (!existingUser) {
      // Verificar si existe un usuario con el mismo correo (migración)
      existingUser = await this.userRepository.findByEmail(correo);
      
      if (existingUser) {
        // Actualizar usuario existente con Firebase UID
        const updatedUser = User.create(
          existingUser.nombre,
          existingUser.correo,
          existingUser.contraseña,
          existingUser.tipo_usuario,
          decodedToken.uid,
          existingUser.id
        );
        
        await this.userRepository.update(updatedUser);
        existingUser = updatedUser;
      }
    }

    if (existingUser) {
      // Usuario existente - proceso de login
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
        correo: existingUser.correo,
        firebase_uid: existingUser.firebase_uid || decodedToken.uid
      };
    } else {
      // Nuevo usuario - proceso de registro
      // Generar contraseña temporal para mantener compatibilidad
      const tempPassword = await bcrypt.hash(decodedToken.uid, 10);
      
      const newUser = User.create(
        nombre,
        correo,
        tempPassword,
        tipo_usuario,
        decodedToken.uid
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
        correo: savedUser.correo,
        firebase_uid: savedUser.firebase_uid || decodedToken.uid
      };
    }
  }
} 