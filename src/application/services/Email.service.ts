import { Resend } from 'resend';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export interface LoginNotificationData {
  nombre: string;
  correo: string;
  ip: string;
  userAgent: string;
  fechaLogin: Date;
  tipoUsuario: string;
}

export interface RegistroNotificationData {
  nombre: string;
  correo: string;
  ip: string;
  userAgent: string;
  fechaRegistro: Date;
  tipoUsuario: string;
}

export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private tutorEmail: string;
  
  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY no está configurada');
    }
    
    this.resend = new Resend(apiKey);
    this.fromEmail =  'noreply@psicodemy.com';
    this.tutorEmail = process.env.TUTOR_EMAIL || 'tutor@psicodemy.com';
  }

  async sendRegistroExitoso(data: RegistroNotificationData): Promise<void> {
    try {
      // Correo al usuario
      await this.resend.emails.send({
        from: this.fromEmail,
        to: data.correo,
        subject: '¡Registro exitoso en PsicoDemy!',
        html: this.generateRegistroUserTemplate(data)
      });

      // Correo al tutor (solo si es alumno)
      if (data.tipoUsuario === 'alumno') {
        await this.resend.emails.send({
          from: this.fromEmail,
          to: this.tutorEmail,
          subject: 'Nuevo alumno registrado en PsicoDemy',
          html: this.generateRegistroTutorTemplate(data)
        });
      }

      console.log('✅ Correo de registro enviado exitosamente');
    } catch (error) {
      console.error('❌ Error enviando correo de registro:', error);
      throw new Error('Error al enviar notificación de registro');
    }
  }

  async sendLoginExitoso(data: LoginNotificationData): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: data.correo,
        subject: 'Inicio de sesión en PsicoDemy',
        html: this.generateLoginTemplate(data)
      });

      console.log('✅ Correo de login enviado exitosamente');
    } catch (error) {
      console.error('❌ Error enviando correo de login:', error);
      // No lanzar error para que no afecte el flujo de login
    }
  }

  async sendTutorCodeEmail(email: string, code: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Tu código de tutor para PsicoDemy',
        html: this.generateTutorCodeTemplate(email, code)
      });

      console.log(`✅ Código de tutor enviado exitosamente a ${email}`);
    } catch (error) {
      console.error(`❌ Error enviando código de tutor a ${email}:`, error);
      throw new Error('Error al enviar código de tutor por email');
    }
  }

  private generateRegistroUserTemplate(data: RegistroNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bienvenido a PsicoDemy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .details { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #2563eb; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a PsicoDemy!</h1>
          </div>
          
          <div class="content">
            <h2>Hola ${data.nombre},</h2>
            <p>Te damos la bienvenida a PsicoDemy. Tu cuenta ha sido creada exitosamente.</p>
            
            <div class="details">
              <h3>Detalles de tu registro:</h3>
              <p><strong>Correo:</strong> ${data.correo}</p>
              <p><strong>Tipo de usuario:</strong> ${data.tipoUsuario}</p>
              <p><strong>Fecha de registro:</strong> ${data.fechaRegistro.toLocaleString('es-MX')}</p>
              <p><strong>IP:</strong> ${data.ip}</p>
            </div>
            
            <p>¡Gracias por unirte a nuestra comunidad!</p>
          </div>
          
          <div class="footer">
            <p>PsicoDemy Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateRegistroTutorTemplate(data: RegistroNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Nuevo alumno registrado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .details { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #16a34a; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nuevo alumno registrado</h1>
          </div>
          
          <div class="content">
            <h2>Notificación de registro</h2>
            <p>Se ha registrado un nuevo alumno en PsicoDemy.</p>
            
            <div class="details">
              <h3>Información del alumno:</h3>
              <p><strong>Nombre:</strong> ${data.nombre}</p>
              <p><strong>Correo:</strong> ${data.correo}</p>
              <p><strong>Fecha de registro:</strong> ${data.fechaRegistro.toLocaleString('es-MX')}</p>
              <p><strong>IP:</strong> ${data.ip}</p>
              <p><strong>User Agent:</strong> ${data.userAgent}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>PsicoDemy Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateLoginTemplate(data: LoginNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Inicio de sesión en PsicoDemy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .details { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #059669; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Inicio de sesión detectado</h1>
          </div>
          
          <div class="content">
            <h2>Hola ${data.nombre},</h2>
            <p>Has iniciado sesión en PsicoDemy exitosamente.</p>
            
            <div class="details">
              <h3>Detalles del inicio de sesión:</h3>
              <p><strong>Fecha y hora:</strong> ${data.fechaLogin.toLocaleString('es-MX')}</p>
              <p><strong>IP:</strong> ${data.ip}</p>
              <p><strong>Dispositivo:</strong> ${data.userAgent}</p>
            </div>
            
            <p>Si no fuiste tú quien inició sesión, por favor contacta a nuestro equipo de soporte.</p>
          </div>
          
          <div class="footer">
            <p>PsicoDemy Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateTutorCodeTemplate(email: string, code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Código de Tutor - PsicoDemy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .code-box { background: white; padding: 20px; margin: 20px 0; border: 2px solid #7c3aed; border-radius: 8px; text-align: center; }
          .code { font-size: 24px; font-weight: bold; color: #7c3aed; letter-spacing: 2px; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tu Código de Tutor</h1>
          </div>
          
          <div class="content">
            <h2>Hola,</h2>
            <p>Has sido invitado a registrarte como tutor en PsicoDemy. Aquí tienes tu código único:</p>
            
            <div class="code-box">
              <h3>Tu código de tutor es:</h3>
              <div class="code">${code}</div>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Importante:</strong></p>
              <ul>
                <li>Este código es único y personal</li>
                <li>Úsalo solo una vez durante tu registro</li>
                <li>No lo compartas con nadie</li>
                <li>Si no solicitaste este código, ignora este email</li>
              </ul>
            </div>
            
            <p>Para registrarte como tutor:</p>
            <ol>
              <li>Ve a la página de registro de PsicoDemy</li>
              <li>Ingresa tu información personal</li>
              <li>En el campo "Código de institución", ingresa: <strong>${code}</strong></li>
              <li>Completa el registro</li>
            </ol>
            
            <p>¡Gracias por unirte a nuestra comunidad de tutores!</p>
          </div>
          
          <div class="footer">
            <p>PsicoDemy Team</p>
            <p>Si tienes alguna pregunta, contacta a nuestro equipo de soporte.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
} 