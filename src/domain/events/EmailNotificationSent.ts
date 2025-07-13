import { DomainEvent } from './DomainEvent';
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';

export class EmailNotificationSent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly recipientEmail: Email,
    public readonly emailType: 'registration' | 'login' | 'security_alert' | 'password_reset',
    public readonly subject: string,
    public readonly success: boolean,
    public readonly errorMessage?: string
  ) {
    super('EmailNotificationSent');
  }

  getAggregateId(): string {
    return this.userId.value;
  }

  // Métodos de conveniencia
  isRegistrationEmail(): boolean {
    return this.emailType === 'registration';
  }

  isLoginEmail(): boolean {
    return this.emailType === 'login';
  }

  isSecurityAlert(): boolean {
    return this.emailType === 'security_alert';
  }

  isPasswordReset(): boolean {
    return this.emailType === 'password_reset';
  }

  wasSuccessful(): boolean {
    return this.success;
  }

  hasFailed(): boolean {
    return !this.success;
  }

  getNotificationContext(): {
    userId: string;
    recipientEmail: string;
    emailType: string;
    subject: string;
    success: boolean;
    timestamp: Date;
    errorMessage?: string;
  } {
    return {
      userId: this.userId.value,
      recipientEmail: this.recipientEmail.value,
      emailType: this.emailType,
      subject: this.subject,
      success: this.success,
      timestamp: this.occurredOn,
      errorMessage: this.errorMessage
    };
  }

  shouldRetry(): boolean {
    return this.hasFailed() && 
           this.errorMessage !== undefined &&
           !this.errorMessage.includes('invalid email') &&
           !this.errorMessage.includes('blocked');
  }

  getRetryDelay(): number {
    // Retorna el delay en milisegundos para retry
    if (this.isSecurityAlert()) {
      return 30000; // 30 segundos para alerts de seguridad
    }
    
    if (this.isPasswordReset()) {
      return 60000; // 1 minuto para password reset
    }
    
    return 300000; // 5 minutos para emails normales
  }
} 