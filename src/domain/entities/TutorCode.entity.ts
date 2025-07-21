export class TutorCode {
  constructor(
    public readonly id: string | undefined,
    public readonly code: string,
    public readonly email: string,
    public readonly isUsed: boolean = false,
    public readonly usedBy?: string,
    public readonly usedAt?: Date,
    public readonly created_at: Date = new Date(),
    public readonly updated_at: Date = new Date(),
    public readonly deleted_at?: Date
  ) {}

  static create(code: string, email: string, id?: string): TutorCode {
    return new TutorCode(
      id, // Solo si viene de la base de datos
      code,
      email
    );
  }

  static generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  markAsUsed(userId: string): TutorCode {
    return new TutorCode(
      this.id,
      this.code,
      this.email,
      true,
      userId,
      new Date(),
      this.created_at,
      new Date(),
      this.deleted_at
    );
  }

  isDeleted(): boolean {
    return this.deleted_at !== undefined;
  }

  toJSON() {
    return {
      id: this.id,
      code: this.code,
      email: this.email,
      isUsed: this.isUsed,
      usedBy: this.usedBy,
      usedAt: this.usedAt,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }
} 