import { DomainEvent } from '../events/DomainEvent';
import { UserRegistered } from '../events/UserRegistered';
import { UserLoggedIn } from '../events/UserLoggedIn';
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { UserName } from '../value-objects/UserName';
import { UserType } from '../value-objects/UserType';
import { Password } from '../value-objects/Password';
import { FirebaseUID } from '../value-objects/FirebaseUID';
import { IPAddress } from '../value-objects/IPAddress';
import { UserAgent } from '../value-objects/UserAgent';
import { InstitutionCode } from '../value-objects/InstitutionCode';

export class UserAggregate {
  private _domainEvents: DomainEvent[] = [];
  private _id: UserId;
  private _name: UserName;
  private _email: Email;
  private _password: Password;
  private _userType: UserType;
  private _firebaseUID: FirebaseUID | null;
  private _institutionCode: InstitutionCode | null;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt: Date | null;

  constructor(
    id: UserId,
    name: UserName,
    email: Email,
    password: Password,
    userType: UserType,
    institutionCode: InstitutionCode | null = null,
    firebaseUID: FirebaseUID | null = null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    deletedAt: Date | null = null
  ) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._password = password;
    this._userType = userType;
    this._institutionCode = institutionCode;
    this._firebaseUID = firebaseUID;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;
  }

  // Factory methods
  static async createWithEmail(
    name: UserName,
    email: Email,
    plainPassword: string,
    institutionCode: string | null,
    ipAddress: IPAddress,
    userAgent: UserAgent
  ): Promise<UserAggregate> {
    const id = UserId.create();
    const password = await Password.create(plainPassword);
    
    // Determinar tipo de usuario basado en el código de institución
    let institutionCodeVO: InstitutionCode | null = null;
    let userType: UserType;
    
    if (institutionCode && institutionCode.trim()) {
      try {
        institutionCodeVO = InstitutionCode.create(institutionCode);
        const determinedUserType = institutionCodeVO.getAssociatedUserType();
        userType = UserType.create(determinedUserType);
      } catch (error) {
        // Si el código es inválido, por defecto será alumno
        userType = UserType.createAlumno();
      }
    } else {
      // Sin código, por defecto alumno
      userType = UserType.createAlumno();
    }
    
    const user = new UserAggregate(id, name, email, password, userType, institutionCodeVO);
    
    // Disparar evento de dominio
    const event = new UserRegistered(
      id,
      name,
      email,
      userType,
      null,
      ipAddress,
      userAgent,
      'email'
    );
    
    user.addDomainEvent(event);
    return user;
  }

  static async createWithFirebase(
    name: UserName,
    email: Email,
    institutionCode: string | null,
    firebaseUID: FirebaseUID,
    ipAddress: IPAddress,
    userAgent: UserAgent
  ): Promise<UserAggregate> {
    const id = UserId.create();
    // Crear password temporal para Firebase users
    const tempPassword = await Password.create(Password.generateTemporary());
    
    // Determinar tipo de usuario basado en el código de institución
    let institutionCodeVO: InstitutionCode | null = null;
    let userType: UserType;
    
    if (institutionCode && institutionCode.trim()) {
      try {
        institutionCodeVO = InstitutionCode.create(institutionCode);
        const determinedUserType = institutionCodeVO.getAssociatedUserType();
        userType = UserType.create(determinedUserType);
      } catch (error) {
        // Si el código es inválido, por defecto será alumno
        userType = UserType.createAlumno();
      }
    } else {
      // Sin código, por defecto alumno
      userType = UserType.createAlumno();
    }
    
    const user = new UserAggregate(id, name, email, tempPassword, userType, institutionCodeVO, firebaseUID);
    
    // Disparar evento de dominio
    const event = new UserRegistered(
      id,
      name,
      email,
      userType,
      firebaseUID,
      ipAddress,
      userAgent,
      'firebase'
    );
    
    user.addDomainEvent(event);
    return user;
  }

  // Métodos de comportamiento
  async authenticate(plainPassword: string, ipAddress: IPAddress, userAgent: UserAgent): Promise<boolean> {
    if (this.isDeleted()) {
      throw new Error('Usuario desactivado');
    }

    const isValid = await this._password.verify(plainPassword);
    
    if (isValid) {
      // Disparar evento de dominio
      const event = new UserLoggedIn(
        this._id,
        this._name,
        this._email,
        this._userType,
        this._firebaseUID,
        ipAddress,
        userAgent,
        'email'
      );
      
      this.addDomainEvent(event);
    }
    
    return isValid;
  }

  authenticateWithFirebase(ipAddress: IPAddress, userAgent: UserAgent): void {
    if (this.isDeleted()) {
      throw new Error('Usuario desactivado');
    }

    // Disparar evento de dominio
    const event = new UserLoggedIn(
      this._id,
      this._name,
      this._email,
      this._userType,
      this._firebaseUID,
      ipAddress,
      userAgent,
      'firebase'
    );
    
    this.addDomainEvent(event);
  }

  async changePassword(newPlainPassword: string): Promise<void> {
    if (this.isDeleted()) {
      throw new Error('No se puede cambiar la contraseña de un usuario desactivado');
    }

    this._password = await Password.create(newPlainPassword);
    this._updatedAt = new Date();
  }

  updateName(newName: UserName): void {
    if (this.isDeleted()) {
      throw new Error('No se puede actualizar el nombre de un usuario desactivado');
    }

    this._name = newName;
    this._updatedAt = new Date();
  }

  updateEmail(newEmail: Email): void {
    if (this.isDeleted()) {
      throw new Error('No se puede actualizar el email de un usuario desactivado');
    }

    this._email = newEmail;
    this._updatedAt = new Date();
  }

  linkFirebaseUID(firebaseUID: FirebaseUID): void {
    if (this.isDeleted()) {
      throw new Error('No se puede vincular Firebase a un usuario desactivado');
    }

    this._firebaseUID = firebaseUID;
    this._updatedAt = new Date();
  }

  updateInstitutionCode(institutionCode: InstitutionCode): void {
    if (this.isDeleted()) {
      throw new Error('No se puede actualizar el código de institución de un usuario desactivado');
    }

    this._institutionCode = institutionCode;
    
    // Actualizar el tipo de usuario basado en el nuevo código
    const newUserType = UserType.create(institutionCode.getAssociatedUserType());
    this._userType = newUserType;
    
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (this.isDeleted()) {
      throw new Error('Usuario ya está desactivado');
    }

    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  reactivate(): void {
    if (!this.isDeleted()) {
      throw new Error('Usuario ya está activo');
    }

    this._deletedAt = null;
    this._updatedAt = new Date();
  }

  // Getters
  get id(): UserId {
    return this._id;
  }

  get name(): UserName {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get password(): Password {
    return this._password;
  }

  get userType(): UserType {
    return this._userType;
  }

  get firebaseUID(): FirebaseUID | null {
    return this._firebaseUID;
  }

  get institutionCode(): InstitutionCode | null {
    return this._institutionCode;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  // Métodos de dominio
  isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  isTutor(): boolean {
    return this._userType.isTutor();
  }

  isAlumno(): boolean {
    return this._userType.isAlumno();
  }

  hasFirebaseUID(): boolean {
    return this._firebaseUID !== null;
  }

  hasInstitutionCode(): boolean {
    return this._institutionCode !== null;
  }

  getInstitutionName(): string {
    return this._institutionCode?.getInstitutionName() || 'Sin institución';
  }

  getInstitutionLevel(): 'premium' | 'standard' | 'basic' {
    return this._institutionCode?.getInstitutionLevel() || 'basic';
  }

  canAccess(resource: string): boolean {
    if (this.isDeleted()) {
      return false;
    }
    
    return this._userType.canAccess(resource);
  }

  getPermissions(): string[] {
    if (this.isDeleted()) {
      return [];
    }
    
    return this._userType.getPermissions();
  }

  // Domain Events
  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  // Serialización
  toJSON(): any {
    return {
      id: this._id.value,
      name: this._name.value,
      email: this._email.value,
      userType: this._userType.value,
      firebaseUID: this._firebaseUID?.value,
      institutionCode: this._institutionCode?.value,
      institutionName: this.getInstitutionName(),
      institutionLevel: this.getInstitutionLevel(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt
    };
  }
} 