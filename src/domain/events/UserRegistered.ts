import { DomainEvent } from './DomainEvent';
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { UserName } from '../value-objects/UserName';
import { UserType } from '../value-objects/UserType';
import { FirebaseUID } from '../value-objects/FirebaseUID';
import { IPAddress } from '../value-objects/IPAddress';
import { UserAgent } from '../value-objects/UserAgent';

export class UserRegistered extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly name: UserName,
    public readonly email: Email,
    public readonly userType: UserType,
    public readonly firebaseUID: FirebaseUID | null,
    public readonly ipAddress: IPAddress,
    public readonly userAgent: UserAgent,
    public readonly registrationMethod: 'email' | 'firebase'
  ) {
    super('UserRegistered');
  }

  getAggregateId(): string {
    return this.userId.value;
  }

  // Métodos de conveniencia
  isFirebaseRegistration(): boolean {
    return this.registrationMethod === 'firebase';
  }

  isEmailRegistration(): boolean {
    return this.registrationMethod === 'email';
  }

  getRegistrationContext(): {
    userId: string;
    name: string;
    email: string;
    userType: string;
    method: string;
    timestamp: Date;
    ipAddress: string;
    browser: string;
    operatingSystem: string;
    deviceType: string;
  } {
    return {
      userId: this.userId.value,
      name: this.name.value,
      email: this.email.value,
      userType: this.userType.value,
      method: this.registrationMethod,
      timestamp: this.occurredOn,
      ipAddress: this.ipAddress.value,
      browser: this.userAgent.getBrowser(),
      operatingSystem: this.userAgent.getOperatingSystem(),
      deviceType: this.userAgent.getDeviceType()
    };
  }

  shouldNotifyTutor(): boolean {
    return this.userType.isAlumno();
  }

  isFromTrustedDevice(): boolean {
    return this.userAgent.isTrusted() && !this.userAgent.isBot();
  }
} 