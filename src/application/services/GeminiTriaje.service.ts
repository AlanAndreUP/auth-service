import fetch from 'node-fetch';

export class GeminiTriajeService {
  private readonly apiKey = 'AIzaSyA2NGuy3BHsAqpeCZNlghb-3E2nxKfVIiU';
  private readonly url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  async getTriaje(datos: any, user?: any): Promise<any> {
    const resumenCitas = (datos.citas || []).map((c: any) => `Cita el ${c.fecha_cita} con tutor ${c.id_tutor}, estado: ${c.estado_cita} checkin: ${c.checklist}`).join('\n');
    const resumenConversaciones = (datos.convs || []).map((c: any) => `Conversación con ${(c.participant1_id == (user?.id || '') ? c.participant2_id : c.participant1_id)}, activa: ${c.is_active}`).join('\n');
    const resumenMensajes = (datos.mensajes || []).map((m: any) => `(${m.fecha}) ${(m.usuario_id === (user?.id || '') ? 'Alumno' : 'Otro')}: ${m.mensaje}`).join('\n');

    const prompt = `
Eres un sistema de triaje psicológico. Analiza la siguiente información de un alumno y responde en JSON con los campos: color (verde, amarillo, rojo), razones (array de strings), prioridad (baja, media, alta).

Citas:
${resumenCitas || 'Sin citas registradas.'}

Conversaciones:
${resumenConversaciones || 'Sin conversaciones registradas.'}

Mensajes:
${resumenMensajes || 'Sin mensajes registrados.'}

Recuerda: Si detectas bullying, maltrato, o riesgo emocional, prioriza el triaje en consecuencia.
`;
    console.log('Prompt enviado a Gemini:', prompt);
    const res = await fetch(`${this.url}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data: any = await res.json();
    console.log('Respuesta cruda de Gemini:', JSON.stringify(data));
    let triaje = null;
    try {
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      text = text.replace(/```json|```/g, '').trim();
      triaje = JSON.parse(text);
      if (!triaje || typeof triaje !== 'object' || !triaje.color || !triaje.razones || !triaje.prioridad) {
        triaje = { color: 'amarillo', razones: ['No se pudo analizar'], prioridad: 'media' };
      }
    } catch (e) {
      console.error('Error parseando respuesta de Gemini:', e);
      triaje = { color: 'amarillo', razones: ['No se pudo analizar'], prioridad: 'media' };
    }
    return triaje;
  }
} 