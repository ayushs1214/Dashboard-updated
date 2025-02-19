export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
  status: 'active' | 'inactive';
  permissions: string[];
  avatar_url: string | null;
  last_login: string;
}