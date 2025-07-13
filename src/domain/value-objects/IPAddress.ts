export class IPAddress {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Dirección IP inválida');
    }
    this._value = value.trim();
  }

  private isValid(ip: string): boolean {
    if (!ip || typeof ip !== 'string') {
      return false;
    }

    const trimmed = ip.trim();
    
    // Permitir "Unknown" para casos donde no se puede determinar la IP
    if (trimmed === 'Unknown') {
      return true;
    }

    return this.isValidIPv4(trimmed) || this.isValidIPv6(trimmed);
  }

  private isValidIPv4(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    if (!ipv4Regex.test(ip)) {
      return false;
    }

    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  private isValidIPv6(ip: string): boolean {
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    const ipv6CompressedRegex = /^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
    
    return ipv6Regex.test(ip) || ipv6CompressedRegex.test(ip);
  }

  get value(): string {
    return this._value;
  }

  static create(value: string): IPAddress {
    return new IPAddress(value);
  }

  static createUnknown(): IPAddress {
    return new IPAddress('Unknown');
  }

  equals(other: IPAddress): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  // Métodos de dominio
  isIPv4(): boolean {
    return this.isValidIPv4(this._value);
  }

  isIPv6(): boolean {
    return this.isValidIPv6(this._value);
  }

  isUnknown(): boolean {
    return this._value === 'Unknown';
  }

  isLocalhost(): boolean {
    return this._value === '127.0.0.1' || 
           this._value === '::1' || 
           this._value === 'localhost';
  }

  isPrivate(): boolean {
    if (this.isUnknown()) return false;
    
    if (this.isIPv4()) {
      const parts = this._value.split('.').map(Number);
      
      // 10.0.0.0/8
      if (parts[0] === 10) return true;
      
      // 172.16.0.0/12
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      
      // 192.168.0.0/16
      if (parts[0] === 192 && parts[1] === 168) return true;
    }
    
    return false;
  }

  isPublic(): boolean {
    return !this.isPrivate() && !this.isLocalhost() && !this.isUnknown();
  }

  getType(): 'IPv4' | 'IPv6' | 'Unknown' {
    if (this.isUnknown()) return 'Unknown';
    if (this.isIPv4()) return 'IPv4';
    if (this.isIPv6()) return 'IPv6';
    return 'Unknown';
  }

  getNetwork(): string {
    if (this.isIPv4()) {
      const parts = this._value.split('.');
      return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
    }
    
    if (this.isIPv6()) {
      const parts = this._value.split(':');
      return `${parts.slice(0, 4).join(':')}::/64`;
    }
    
    return 'Unknown';
  }

  static fromString(value: string): IPAddress {
    return new IPAddress(value);
  }

  // Método para validar sin crear instancia
  static isValidIP(ip: string): boolean {
    try {
      new IPAddress(ip);
      return true;
    } catch {
      return false;
    }
  }
} 