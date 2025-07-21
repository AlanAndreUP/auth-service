import { TutorCodeRepository } from '@domain/repositories/TutorCodeRepository.interface';
import { TutorCode } from '@domain/entities/TutorCode.entity';
import { TutorCodeModel } from '@infrastructure/database/models/TutorCode.model';

// Función helper para convertir documento a entidad
const mapTutorCodeDocToEntity = (doc: any): TutorCode => {
  return new TutorCode(
    (doc._id as any).toString(),
    doc.code,
    doc.email,
    doc.isUsed,
    doc.usedBy,
    doc.usedAt,
    doc.created_at,
    doc.updated_at,
    doc.deleted_at
  );
};

export class MongoTutorCodeRepository implements TutorCodeRepository {
  async findByCode(code: string): Promise<TutorCode | null> {
    try {
      const tutorCodeDoc = await TutorCodeModel.findOne({ 
        code: code.toUpperCase(), 
        deleted_at: { $exists: false } 
      });
      
      if (!tutorCodeDoc) {
        return null;
      }

      return mapTutorCodeDocToEntity(tutorCodeDoc);
    } catch (error) {
      console.error('Error finding tutor code by code:', error);
      throw new Error('Error al buscar código de tutor');
    }
  }

  async findByEmail(email: string): Promise<TutorCode[]> {
    try {
      const tutorCodeDocs = await TutorCodeModel.find({ 
        email: email.toLowerCase(), 
        deleted_at: { $exists: false } 
      });
      
      return tutorCodeDocs.map(tutorCodeDoc => mapTutorCodeDocToEntity(tutorCodeDoc));
    } catch (error) {
      console.error('Error finding tutor codes by email:', error);
      throw new Error('Error al buscar códigos de tutor por email');
    }
  }

  async findUnusedCodes(): Promise<TutorCode[]> {
    try {
      const tutorCodeDocs = await TutorCodeModel.find({ 
        isUsed: false, 
        deleted_at: { $exists: false } 
      });
      
      return tutorCodeDocs.map(tutorCodeDoc => mapTutorCodeDocToEntity(tutorCodeDoc));
    } catch (error) {
      console.error('Error finding unused tutor codes:', error);
      throw new Error('Error al buscar códigos de tutor no utilizados');
    }
  }

  async save(tutorCode: TutorCode): Promise<TutorCode> {
    try {
      const tutorCodeDoc = new TutorCodeModel({
        code: tutorCode.code,
        email: tutorCode.email,
        isUsed: tutorCode.isUsed,
        usedBy: tutorCode.usedBy,
        usedAt: tutorCode.usedAt,
        created_at: tutorCode.created_at,
        updated_at: tutorCode.updated_at,
        deleted_at: tutorCode.deleted_at
      });

      await tutorCodeDoc.save();
      
      return mapTutorCodeDocToEntity(tutorCodeDoc);
    } catch (error) {
      console.error('Error saving tutor code:', error);
      throw new Error('Error al guardar código de tutor');
    }
  }

  async update(tutorCode: TutorCode): Promise<TutorCode> {
    try {
      const tutorCodeDoc = await TutorCodeModel.findByIdAndUpdate(
        tutorCode.id,
        {
          code: tutorCode.code,
          email: tutorCode.email,
          isUsed: tutorCode.isUsed,
          usedBy: tutorCode.usedBy,
          usedAt: tutorCode.usedAt,
          updated_at: new Date(),
          deleted_at: tutorCode.deleted_at
        },
        { new: true }
      );

      if (!tutorCodeDoc) {
        throw new Error('Código de tutor no encontrado');
      }

      return mapTutorCodeDocToEntity(tutorCodeDoc);
    } catch (error) {
      console.error('Error updating tutor code:', error);
      throw new Error('Error al actualizar código de tutor');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await TutorCodeModel.findByIdAndUpdate(
        id,
        { deleted_at: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error deleting tutor code:', error);
      throw new Error('Error al eliminar código de tutor');
    }
  }

  async generateUniqueCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = TutorCode.generateCode();
      const existingCode = await this.findByCode(code);
      
      if (!existingCode) {
        return code;
      }
      
      attempts++;
    }

    throw new Error('No se pudo generar un código único después de múltiples intentos');
  }
} 