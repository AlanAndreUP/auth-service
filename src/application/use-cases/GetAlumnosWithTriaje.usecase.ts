import { AppointmentService } from '../services/Appointment.service';
import { ChatService } from '../services/Chat.service';
import { GeminiTriajeService } from '../services/GeminiTriaje.service';
import { UserRepository } from '@domain/repositories/UserRepository.interface';

export class GetAlumnosWithTriajeUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly appointmentService: AppointmentService,
    private readonly chatService: ChatService,
    private readonly geminiTriajeService: GeminiTriajeService
  ) {}

  async execute({ page = 1, limit = 10, triaje = false }: { page?: number; limit?: number; triaje?: boolean }) {
    // Obtener todos los usuarios y filtrar solo alumnos
    const users = await this.userRepository.findAll();
    const alumnos = users.filter((user: any) => user.tipo_usuario === 'alumno');

    // Paginación manual
    const total = alumnos.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const alumnosPagina = alumnos.slice(start, end);

    // Mapear los datos básicos
    let usersList = alumnosPagina.map((user: any) => ({
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      tipo_usuario: user.tipo_usuario,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
      ip_address: user.ip_address,
      user_agent: user.user_agent,
    }));

    // Si se solicita triaje, obtener y agregar el triaje a cada usuario
    if (triaje) {
      const pLimit = (await import('p-limit')).default;
      const limitConcurrency = pLimit(5);
      usersList = await Promise.all(usersList.map(user => limitConcurrency(async () => {
        try {
          const citas = await this.appointmentService.getAppointmentsByAlumnoId(user.id);
          const convs = await this.chatService.getConversationsByAlumnoId(user.id);
          console.log(citas.length + ' citas')
          console.log(convs.length + ' conversaciones')
          let mensajes = [];

            const convId = convs[0].id;
            console.log(convId + ' convId')
            console.log(user.id + ' user.id')
            mensajes = await this.chatService.getMessagesByConversationId(convId, user.id);
            console.log(mensajes.length + ' mensajes')
          
          console.log(mensajes.length)
          // Validación para no llamar a Gemini si no hay datos
          if ((citas.length === 0) || (convs.length === 0) || (mensajes.length === 0)) {
            return { ...user, triaje: null };
          }
          const datos = { citas, convs, mensajes };
          const triaje = await this.geminiTriajeService.getTriaje(datos, user);
          return { ...user, triaje };
        } catch (e) {
          return { ...user, triaje: { color: 'amarillo', razones: ['Error al obtener datos'], prioridad: 'media' } };
        }
      })));
    }

    return {
      users: usersList,
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
} 