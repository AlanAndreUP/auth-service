import { TutorCode } from '@domain/entities/TutorCode.entity';

export interface TutorCodeRepository {
  findByCode(code: string): Promise<TutorCode | null>;
  findByEmail(email: string): Promise<TutorCode[]>;
  findUnusedCodes(): Promise<TutorCode[]>;
  save(tutorCode: TutorCode): Promise<TutorCode>;
  update(tutorCode: TutorCode): Promise<TutorCode>;
  delete(id: string): Promise<void>;
  generateUniqueCode(): Promise<string>;
} 