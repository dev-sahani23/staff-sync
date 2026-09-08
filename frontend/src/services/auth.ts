import { api, withColdStartRetry } from '@/lib/api';
import type { User, Role } from '@/types';

export interface LoginPayload {
  email: string;
  passwordRaw?: string;
  password?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  role?: Role;
  employeeId?: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    return withColdStartRetry(async () => {
      const res = await api.post<LoginResponse>('/auth/login', {
        email: payload.email,
        password: payload.password || payload.passwordRaw,
      });
      return res.data;
    });
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const res = await api.post<User>('/auth/register', payload);
    return res.data;
  },
};
