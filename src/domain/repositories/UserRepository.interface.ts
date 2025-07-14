import { User } from '@domain/entities/User.entity';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByFirebaseUid(firebaseUid: string): Promise<User | null>;
  findByUserType(userType: 'tutor' | 'alumno'): Promise<User[]>;
  findByInstitutionCode(institutionCode: string): Promise<User[]>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
} 