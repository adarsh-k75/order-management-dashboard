import api from './api';
import { APIResponse, UserLogin } from '../types';

export const authService = {
  /**
   * Log in user using credentials, save token to localStorage, and return data.
   */
  login: async (credentials: UserLogin): Promise<{ token: string; username: string }> => {
    const response = await api.post<APIResponse>('/login', credentials);
    const { success, data } = response.data;
    
    if (success && data?.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', data.username || credentials.username);
      return { token: data.access_token, username: data.username || credentials.username };
    }
    
    throw new Error(response.data.message || 'Login failed');
  },

  /**
   * Remove tokens and sign out user.
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  /**
   * Check if authentication token exists in local storage.
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  /**
   * Fetch current session username.
   */
  getUsername: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('username');
  }
};
