import fetch from 'node-fetch';

export class AppointmentService {
  private readonly baseUrl = 'https://api.psicodemy.com/s1/appointments';

  async getAppointmentsByAlumnoId(alumnoId: string): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}?limit=100&id_alumno=${alumnoId}`);
    const data: any = await res.json();
    return data.data || [];
  }
} 