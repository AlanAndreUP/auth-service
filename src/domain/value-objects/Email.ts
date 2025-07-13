export class Email {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Email inválido');
    }
    this._value = value.toLowerCase().trim();
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  get value(): string {
    return this._value;
  }

  get domain(): string {
    return this._value.split('@')[1];
  }

  get localPart(): string {
    return this._value.split('@')[0];
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static create(value: string): Email {
    return new Email(value);
  }

  // Métodos de dominio
  isFromDomain(domain: string): boolean {
    return this.domain === domain.toLowerCase();
  }

  isDisposable(): boolean {
    const disposableDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
    return disposableDomains.includes(this.domain);
  }
} 