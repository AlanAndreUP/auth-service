import { UserRepository } from '@domain/repositories/UserRepository.interface';
import { User } from '@domain/entities/User.entity';
import { UserModel } from '@infrastructure/database/models/User.model';

export class MongoUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const userDoc = await UserModel.findOne({ correo: email, deleted_at: { $exists: false } });
      
      if (!userDoc) {
        return null;
      }

      return new User(
        userDoc._id.toString(),
        userDoc.correo,
        userDoc.contraseña,
        userDoc.tipo_usuario,
        userDoc.created_at,
        userDoc.updated_at,
        userDoc.deleted_at
      );
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Error al buscar usuario por email');
    }
  }

  async save(user: User): Promise<User> {
    try {
      const userDoc = new UserModel({
        _id: user.id,
        correo: user.correo,
        contraseña: user.contraseña,
        tipo_usuario: user.tipo_usuario,
        created_at: user.created_at,
        updated_at: user.updated_at,
        deleted_at: user.deleted_at
      });

      const savedUser = await userDoc.save();

      return new User(
        savedUser._id.toString(),
        savedUser.correo,
        savedUser.contraseña,
        savedUser.tipo_usuario,
        savedUser.created_at,
        savedUser.updated_at,
        savedUser.deleted_at
      );
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error('Error al guardar usuario');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const userDoc = await UserModel.findOne({ _id: id, deleted_at: { $exists: false } });
      
      if (!userDoc) {
        return null;
      }

      return new User(
        userDoc._id.toString(),
        userDoc.correo,
        userDoc.contraseña,
        userDoc.tipo_usuario,
        userDoc.created_at,
        userDoc.updated_at,
        userDoc.deleted_at
      );
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw new Error('Error al buscar usuario por ID');
    }
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { ...userData, updated_at: new Date() },
        { new: true }
      );

      if (!updatedUser) {
        return null;
      }

      return new User(
        updatedUser._id.toString(),
        updatedUser.correo,
        updatedUser.contraseña,
        updatedUser.tipo_usuario,
        updatedUser.created_at,
        updatedUser.updated_at,
        updatedUser.deleted_at
      );
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Error al actualizar usuario');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndUpdate(
        id,
        { deleted_at: new Date() },
        { new: true }
      );

      return result !== null;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Error al eliminar usuario');
    }
  }
} 