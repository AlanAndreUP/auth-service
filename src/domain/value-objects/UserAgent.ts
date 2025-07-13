export class UserAgent {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('User Agent inválido');
    }
    this._value = value.trim();
  }

  private isValid(userAgent: string): boolean {
    if (!userAgent || typeof userAgent !== 'string') {
      return false;
    }

    const trimmed = userAgent.trim();
    
    // Permitir "Unknown" para casos donde no se puede determinar el User Agent
    if (trimmed === 'Unknown') {
      return true;
    }

    // Debe tener una longitud razonable
    if (trimmed.length < 5 || trimmed.length > 1000) {
      return false;
    }

    return true;
  }

  get value(): string {
    return this._value;
  }

  static create(value: string): UserAgent {
    return new UserAgent(value);
  }

  static createUnknown(): UserAgent {
    return new UserAgent('Unknown');
  }

  equals(other: UserAgent): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  // Métodos de dominio
  isUnknown(): boolean {
    return this._value === 'Unknown';
  }

  getBrowser(): string {
    if (this.isUnknown()) return 'Unknown';
    
    if (this._value.includes('Chrome')) return 'Chrome';
    if (this._value.includes('Firefox')) return 'Firefox';
    if (this._value.includes('Safari') && !this._value.includes('Chrome')) return 'Safari';
    if (this._value.includes('Edge')) return 'Edge';
    if (this._value.includes('Opera')) return 'Opera';
    if (this._value.includes('Internet Explorer')) return 'Internet Explorer';
    
    return 'Unknown';
  }

  getOperatingSystem(): string {
    if (this.isUnknown()) return 'Unknown';
    
    if (this._value.includes('Windows')) return 'Windows';
    if (this._value.includes('Mac OS')) return 'macOS';
    if (this._value.includes('Linux')) return 'Linux';
    if (this._value.includes('Android')) return 'Android';
    if (this._value.includes('iOS')) return 'iOS';
    
    return 'Unknown';
  }

  getDeviceType(): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
    if (this.isUnknown()) return 'unknown';
    
    if (this._value.includes('Mobile') || this._value.includes('Android')) {
      return 'mobile';
    }
    
    if (this._value.includes('Tablet') || this._value.includes('iPad')) {
      return 'tablet';
    }
    
    return 'desktop';
  }

  isMobile(): boolean {
    return this.getDeviceType() === 'mobile';
  }

  isTablet(): boolean {
    return this.getDeviceType() === 'tablet';
  }

  isDesktop(): boolean {
    return this.getDeviceType() === 'desktop';
  }

  isBot(): boolean {
    if (this.isUnknown()) return false;
    
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'facebookexternalhit',
      'twitterbot', 'googlebot', 'bingbot', 'slurp', 'duckduckbot'
    ];
    
    const lowerUserAgent = this._value.toLowerCase();
    return botPatterns.some(pattern => lowerUserAgent.includes(pattern));
  }

  getVersion(): string {
    if (this.isUnknown()) return 'Unknown';
    
    const browser = this.getBrowser();
    
    if (browser === 'Chrome') {
      const match = this._value.match(/Chrome\/(\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    }
    
    if (browser === 'Firefox') {
      const match = this._value.match(/Firefox\/(\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    }
    
    if (browser === 'Safari') {
      const match = this._value.match(/Version\/(\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    }
    
    return 'Unknown';
  }

  getShortDescription(): string {
    if (this.isUnknown()) return 'Unknown';
    
    const browser = this.getBrowser();
    const os = this.getOperatingSystem();
    const deviceType = this.getDeviceType();
    
    return `${browser} en ${os} (${deviceType})`;
  }

  isTrusted(): boolean {
    if (this.isUnknown()) return false;
    
    // Patrones de User Agents sospechosos
    const suspiciousPatterns = [
      'curl', 'wget', 'python', 'java', 'postman', 'insomnia'
    ];
    
    const lowerUserAgent = this._value.toLowerCase();
    return !suspiciousPatterns.some(pattern => lowerUserAgent.includes(pattern));
  }

  static fromString(value: string): UserAgent {
    return new UserAgent(value);
  }

  // Método para validar sin crear instancia
  static isValidUserAgent(userAgent: string): boolean {
    try {
      new UserAgent(userAgent);
      return true;
    } catch {
      return false;
    }
  }
} 