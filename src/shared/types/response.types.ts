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
  codigo_institucion?: string; // Nuevo campo opcional
}

export interface FirebaseAuthRequest {
  firebase_token: string;
  nombre: string;
  correo: string;
  codigo_institucion?: string; // Nuevo campo opcional
}

export interface AuthValidateResponse {
  isNewUser: boolean;
  userType?: TipoUsuario;
  userId?: string;
  token?: string;
  nombre?: string;
  codigoInstitucion?: string;
  institucionNombre?: string;
}

export interface FirebaseAuthResponse {
  isNewUser: boolean;
  userType: TipoUsuario;
  userId: string;
  token: string;
  nombre: string;
  correo: string;
  firebase_uid: string;
  codigoInstitucion?: string;
  institucionNombre?: string;
} 