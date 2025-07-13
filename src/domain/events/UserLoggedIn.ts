import { DomainEvent } from './DomainEvent';
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { UserName } from '../value-objects/UserName';
import { UserType } from '../value-objects/UserType';
import { FirebaseUID } from '../value-objects/FirebaseUID';
import { IPAddress } from '../value-objects/IPAddress';
import { UserAgent } from '../value-objects/UserAgent';

export class UserLoggedIn extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly name: UserName,
    public readonly email: Email,
    public readonly userType: UserType,
    public readonly firebaseUID: FirebaseUID | null,
    public readonly ipAddress: IPAddress,
    public readonly userAgent: UserAgent,
    public readonly loginMethod: 'email' | 'firebase'
  ) {
    super('UserLoggedIn');
  }

  getAggregateId(): string {
    return this.userId.value;
  }

  // Métodos de conveniencia
  isFirebaseLogin(): boolean {
    return this.loginMethod === 'firebase';
  }

  isEmailLogin(): boolean {
    return this.loginMethod === 'email';
  }

  getLoginContext(): {
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
      method: this.loginMethod,
      timestamp: this.occurredOn,
      ipAddress: this.ipAddress.value,
      browser: this.userAgent.getBrowser(),
      operatingSystem: this.userAgent.getOperatingSystem(),
      deviceType: this.userAgent.getDeviceType()
    };
  }

  isFromTrustedDevice(): boolean {
    return this.userAgent.isTrusted() && !this.userAgent.isBot();
  }

  isSuspiciousLogin(): boolean {
    return this.userAgent.isBot() || 
           !this.userAgent.isTrusted() ||
           this.ipAddress.isUnknown();
  }

  shouldSendSecurityAlert(): boolean {
    return this.isSuspiciousLogin() || 
           this.ipAddress.isPublic() ||
           this.userAgent.isUnknown();
  }

  getSecurityContext(): {
    isTrusted: boolean;
    isBot: boolean;
    isPublicIP: boolean;
    deviceType: string;
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const isTrusted = this.isFromTrustedDevice();
    const isBot = this.userAgent.isBot();
    const isPublicIP = this.ipAddress.isPublic();
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (isBot || !isTrusted) {
      riskLevel = 'high';
    } else if (isPublicIP || this.userAgent.isUnknown()) {
      riskLevel = 'medium';
    }
    
    return {
      isTrusted,
      isBot,
      isPublicIP,
      deviceType: this.userAgent.getDeviceType(),
      riskLevel
    };
  }
} 