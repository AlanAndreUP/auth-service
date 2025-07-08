import { User } from '@domain/entities/User.entity';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
} 