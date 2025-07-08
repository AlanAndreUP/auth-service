import { UserRepository } from '@domain/repositories/UserRepository.interface';
import { User } from '@domain/entities/User.entity';
import { AuthValidateRequest, AuthValidateResponse, TipoUsuario } from '@shared/types/response.types';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export class ValidateAuthUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret: string
  ) {}

  async execute(request: AuthValidateRequest): Promise<AuthValidateResponse> {
    const { correo, contraseña, tipo_usuario } = request;

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
          userType: existingUser.tipo_usuario 
        },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      return {
        isNewUser: false,
        userType: existingUser.tipo_usuario,
        userId: existingUser.id,
        token
      };
    } else {
      // Nuevo usuario - proceso de registro
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      
      const newUser = User.create(correo, hashedPassword, tipo_usuario);
      const savedUser = await this.userRepository.save(newUser);

      // Generar token JWT para nuevo usuario
      const token = jwt.sign(
        { 
          userId: savedUser.id, 
          email: savedUser.correo,
          userType: savedUser.tipo_usuario 
        },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      return {
        isNewUser: true,
        userType: savedUser.tipo_usuario,
        userId: savedUser.id,
        token
      };
    }
  }
} 