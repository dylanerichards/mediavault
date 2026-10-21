import { authApi } from '../services/api';
import type { User, LoginForm, RegisterForm } from '../types/api';


export const login = async (credentials: LoginForm): Promise<User> => {
  try {
    const authData = await authApi.login(credentials);
    return authData.user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

  export const register = async (userData: RegisterForm): Promise<User> => {
    try {
      const authData = await authApi.register(userData);
      return authData.user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } 
  };

  export const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
};

export const getUserProfile = async (): Promise<User | null> => {
  try {
    if (localStorage.getItem('authToken')) {
      const authData = await authApi.getProfile();
      return authData;
    }
    return null
  } catch (error) {
    console.error('Failed to refresh user:', error);
    localStorage.removeItem('authToken');
    throw error;
  }
};