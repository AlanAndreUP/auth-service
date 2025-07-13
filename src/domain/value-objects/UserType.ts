export class UserType {
  private static readonly VALID_TYPES = ['tutor', 'alumno'] as const;
  private readonly _value: typeof UserType.VALID_TYPES[number];

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error(`Tipo de usuario inválido: ${value}. Debe ser 'tutor' o 'alumno'`);
    }
    this._value = value as typeof UserType.VALID_TYPES[number];
  }

  private isValid(value: string): value is typeof UserType.VALID_TYPES[number] {
    return UserType.VALID_TYPES.includes(value as any);
  }

  get value(): string {
    return this._value;
  }

  static create(value: string): UserType {
    return new UserType(value);
  }

  static createTutor(): UserType {
    return new UserType('tutor');
  }

  static createAlumno(): UserType {
    return new UserType('alumno');
  }

  equals(other: UserType): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  // Métodos de dominio
  isTutor(): boolean {
    return this._value === 'tutor';
  }

  isAlumno(): boolean {
    return this._value === 'alumno';
  }

  getDisplayName(): string {
    return this._value === 'tutor' ? 'Tutor' : 'Alumno';
  }

  getPermissions(): string[] {
    switch (this._value) {
      case 'tutor':
        return [
          'create_lessons',
          'view_all_students',
          'edit_profiles',
          'send_notifications',
          'access_analytics'
        ];
      case 'alumno':
        return [
          'view_lessons',
          'edit_own_profile',
          'submit_assignments',
          'view_grades'
        ];
      default:
        return [];
    }
  }

  canAccess(resource: string): boolean {
    const permissions = this.getPermissions();
    return permissions.includes(resource);
  }

  getDefaultNotificationSettings(): Record<string, boolean> {
    if (this.isTutor()) {
      return {
        student_registrations: true,
        lesson_submissions: true,
        system_alerts: true,
        marketing: false
      };
    } else {
      return {
        lesson_updates: true,
        grade_notifications: true,
        system_alerts: true,
        marketing: true
      };
    }
  }

  getMaxFileUploadSize(): number {
    // Retorna el tamaño máximo en MB
    return this.isTutor() ? 100 : 50;
  }
} 