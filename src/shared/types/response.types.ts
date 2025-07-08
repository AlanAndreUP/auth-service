export interface ApiResponse<T = any> {
  data: T;
  message: string;
  status: 'success' | 'error';
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ErrorResponse {
  data: null;
  message: string;
  status: 'error';
  error?: {
    code: string;
    details?: any;
  };
}

export type TipoUsuario = 'tutor' | 'alumno';

export interface AuthValidateRequest {
  correo: string;
  contraseña: string;
  tipo_usuario: TipoUsuario;
}

export interface AuthValidateResponse {
  isNewUser: boolean;
  userType?: TipoUsuario;
  userId?: string;
  token?: string;
} 