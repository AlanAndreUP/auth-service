import { UserRepository } from '@domain/repositories/UserRepository.interface';
import { User } from '@domain/entities/User.entity';
import { UserModel } from '@infrastructure/database/models/User.model';

export class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const userDoc = await UserModel.findById(id);
      
      if (!userDoc || userDoc.deleted_at) {
        return null;
      }

      return new User(
        userDoc._id.toString(),
        userDoc.nombre,
        userDoc.correo,
        userDoc.contraseña,
        userDoc.tipo_usuario,
        userDoc.firebase_uid,
        userDoc.codigo_institucion,
        userDoc.is_active,
        userDoc.created_at,
        userDoc.updated_at,
        userDoc.last_login,
        userDoc.ip_address,
        userDoc.user_agent,
        userDoc.deleted_at
      );
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Error al buscar usuario por ID');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const userDoc = await UserModel.findOne({ correo: email, deleted_at: { $exists: false } });
      
      if (!userDoc) {
        return null;
      }

      return new User(
        userDoc._id.toString(),
        userDoc.nombre,
        userDoc.correo,
        userDoc.contraseña,
        userDoc.tipo_usuario,
        userDoc.firebase_uid,
        userDoc.codigo_institucion,
        userDoc.is_active,
        userDoc.created_at,
        userDoc.updated_at,
        userDoc.last_login,
        userDoc.ip_address,
        userDoc.user_agent,
        userDoc.deleted_at
      );
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Error al buscar usuario por email');
    }
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    try {
      const userDoc = await UserModel.findOne({ firebase_uid: firebaseUid, deleted_at: { $exists: false } });
      
      if (!userDoc) {
        return null;
      }

      return new User(
        userDoc._id.toString(),
        userDoc.nombre,
        userDoc.correo,
        userDoc.contraseña,
        userDoc.tipo_usuario,
        userDoc.firebase_uid,
        userDoc.codigo_institucion,
        userDoc.is_active,
        userDoc.created_at,
        userDoc.updated_at,
        userDoc.last_login,
        userDoc.ip_address,
        userDoc.user_agent,
        userDoc.deleted_at
      );
    } catch (error) {
      console.error('Error finding user by Firebase UID:', error);
      throw new Error('Error al buscar usuario por Firebase UID');
    }
  }

  async findByUserType(userType: 'tutor' | 'alumno'): Promise<User[]> {
    try {
      const userDocs = await UserModel.find({ 
        tipo_usuario: userType, 
        deleted_at: { $exists: false } 
      });
      
      return userDocs.map(userDoc => new User(
        userDoc._id.toString(),
        userDoc.nombre,
        userDoc.correo,
        userDoc.contraseña,
        userDoc.tipo_usuario,
        userDoc.firebase_uid,
        userDoc.codigo_institucion,
        userDoc.is_active,
        userDoc.created_at,
        userDoc.updated_at,
        userDoc.last_login,
        userDoc.ip_address,
        userDoc.user_agent,
        userDoc.deleted_at
      ));
    } catch (error) {
      console.error('Error finding users by user type:', error);
      throw new Error('Error al buscar usuarios por tipo');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const userDocs = await UserModel.find({ 
        deleted_at: { $exists: false } 
      });
      
      return userDocs.map(userDoc => new User(
        userDoc._id.toString(),
        userDoc.nombre,
        userDoc.correo,
        userDoc.contraseña,
        userDoc.tipo_usuario,
        userDoc.firebase_uid,
        userDoc.codigo_institucion,
        userDoc.is_active,
        userDoc.created_at,
        userDoc.updated_at,
        userDoc.last_login,
        userDoc.ip_address,
        userDoc.user_agent,
        userDoc.deleted_at
      ));
    } catch (error) {
      console.error('Error finding all users:', error);
      throw new Error('Error al buscar todos los usuarios');
    }
  }

  async findAllTutors(): Promise<User[]> {
    try {
      const userDocs = await UserModel.find({ 
        tipo_usuario: 'tutor',
        deleted_at: { $exists: false } 
      });
      
      return userDocs.map(userDoc => new User(
        userDoc._id.toString(),
        userDoc.nombre,
        userDoc.correo,
        userDoc.contraseña,
        userDoc.tipo_usuario,
        userDoc.firebase_uid,
        userDoc.codigo_institucion,
        userDoc.is_active,
        userDoc.created_at,
        userDoc.updated_at,
        userDoc.last_login,
        userDoc.ip_address,
        userDoc.user_agent,
        userDoc.deleted_at
      ));
    } catch (error) {
      console.error('Error finding all tutors:', error);
      throw new Error('Error al buscar todos los tutores');
    }
  }

  async findByInstitutionCode(institutionCode: string): Promise<User[]> {
    try {
      const userDocs = await UserModel.find({ 
        codigo_institucion: institutionCode.toUpperCase(), 
        deleted_at: { $exists: false } 
      });
      
      return userDocs.map(userDoc => new User(
        userDoc._id.toString(),
        userDoc.nombre,
        userDoc.correo,
        userDoc.contraseña,
        userDoc.tipo_usuario,
        userDoc.firebase_uid,
        userDoc.codigo_institucion,
        userDoc.is_active,
        userDoc.created_at,
        userDoc.updated_at,
        userDoc.last_login,
        userDoc.ip_address,
        userDoc.user_agent,
        userDoc.deleted_at
      ));
    } catch (error) {
      console.error('Error finding users by institution code:', error);
      throw new Error('Error al buscar usuarios por código de institución');
    }
  }

  async save(user: User): Promise<User> {
    try {
      const userDoc = new UserModel({
        _id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        contraseña: user.contraseña,
        tipo_usuario: user.tipo_usuario,
        firebase_uid: user.firebase_uid,
        codigo_institucion: user.codigo_institucion,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login,
        ip_address: user.ip_address,
        user_agent: user.user_agent,
        deleted_at: user.deleted_at
      });

      await userDoc.save();
      
      return new User(
        userDoc._id.toString(),
        userDoc.nombre,
        userDoc.correo,
        userDoc.contraseña,
        userDoc.tipo_usuario,
        userDoc.firebase_uid,
        userDoc.codigo_institucion,
        userDoc.is_active,
        userDoc.created_at,
        userDoc.updated_at,
        userDoc.last_login,
        userDoc.ip_address,
        userDoc.user_agent,
        userDoc.deleted_at
      );
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error('Error al guardar usuario');
    }
  }

  async update(user: User): Promise<User> {
    try {
      const userDoc = await UserModel.findByIdAndUpdate(
        user.id,
        {
          nombre: user.nombre,
          correo: user.correo,
          contraseña: user.contraseña,
          tipo_usuario: user.tipo_usuario,
          firebase_uid: user.firebase_uid,
          codigo_institucion: user.codigo_institucion,
          is_active: user.is_active,
          updated_at: new Date(),
          last_login: user.last_login,
          ip_address: user.ip_address,
          user_agent: user.user_agent,
          deleted_at: user.deleted_at
        },
        { new: true }
      );

      if (!userDoc) {
        throw new Error('Usuario no encontrado');
      }

      return new User(
        userDoc._id.toString(),
        userDoc.nombre,
        userDoc.correo,
        userDoc.contraseña,
        userDoc.tipo_usuario,
        userDoc.firebase_uid,
        userDoc.codigo_institucion,
        userDoc.is_active,
        userDoc.created_at,
        userDoc.updated_at,
        userDoc.last_login,
        userDoc.ip_address,
        userDoc.user_agent,
        userDoc.deleted_at
      );
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Error al actualizar usuario');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(
        id,
        { deleted_at: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Error al eliminar usuario');
    }
  }
} 