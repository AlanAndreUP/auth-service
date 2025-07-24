import fetch from 'node-fetch';

export class ChatService {
  private readonly baseUrl = 'https://api.psicodemy.com/s3/admin/conversations';

  async getConversationsByAlumnoId(alumnoId: string): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}?limit=100&`);
    const data: any = await res.json();
    return (data.data?.conversations || []).filter(
      (conv: any) => conv.participant1_id == alumnoId || conv.participant2_id == alumnoId
    );
  }

  async getMessagesByConversationId(conversationId: string, alumnoId: string): Promise<any[]> {
    const res = await fetch(`https://api.psicodemy.com/s3/conversations/${conversationId}/messages?usuario_id=${alumnoId}&limit=100`);
    console.log(conversationId + ' conversationId')
    console.log(alumnoId + ' alumnoId')
    console.log(res.status + ' res.status')
    const data: any = await res.json();
    return data.data?.messages || [];
  }
} 