import axios, { type AxiosResponse } from 'axios';
import type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationMeta,
  AuthResponse,
  User,
  MediaType,
  Author,
  Publisher,
  Favorite,
  Cart,
  LoginForm,
  RegisterForm,
  AnalyticsAction,
  AnalyticsResponse
} from '../types/api';
import { emitCartChanged, emitFavoritesChanged } from '../utils/appEvents';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  return response.data.data;
};

const handleError = (error: unknown): never => {
  const apiError: ApiError =
    (axios.isAxiosError(error) ? error.response?.data : undefined) || {
      error: 'An unexpected error occurred',
    };
  throw apiError;
};

// Auth API
export const authApi = {
  async login(credentials: LoginForm): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      const authData = handleResponse(response);
      localStorage.setItem('authToken', authData.token);
      return authData;
    } catch (error) {
      return handleError(error);
    }
  },

  async register(userData: RegisterForm): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', { user: userData });
      const authData = handleResponse(response);
      localStorage.setItem('authToken', authData.token);
      return authData;
    } catch (error) {
      return handleError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      await api.delete('/auth/logout');
    } catch {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('authToken');
    }
  },

  async getProfile(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<{ user: User }>>('/profile');
      return response.data.data.user;
    } catch (error) {
      return handleError(error);
    }
  },
};

// Media Types API (unified: Book, Podcast, ...)
export const mediaTypesApi = {
  async getMediaTypes<T extends MediaType = MediaType>(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    type?: string;
    author_id?: number;
    publisher_id?: number;
  }): Promise<PaginatedResponse<T>> {
    try {
      const response = await api.get<ApiResponse<{ media_types: T[]; pagination: PaginationMeta }>>('/media_types', { params });
      return {
        data: response.data.data.media_types,
        pagination: response.data.data.pagination,
      };
    } catch (error) {
      return handleError(error);
    }
  },

  async getMediaType<T extends MediaType = MediaType>(id: number): Promise<T> {
    try {
      const response = await api.get<ApiResponse<{ media_type: T }>>(`/media_types/${id}`);
      return response.data.data.media_type;
    } catch (error) {
      return handleError(error);
    }
  },

  async createMediaType<T extends MediaType = MediaType>(data: Record<string, unknown>): Promise<T> {
    try {
      const response = await api.post<ApiResponse<{ media_type: T }>>('/media_types', { media_type: data });
      return response.data.data.media_type;
    } catch (error) {
      return handleError(error);
    }
  },

  async updateMediaType<T extends MediaType = MediaType>(id: number, data: Record<string, unknown>): Promise<T> {
    try {
      const response = await api.patch<ApiResponse<{ media_type: T }>>(`/media_types/${id}`, { media_type: data });
      return response.data.data.media_type;
    } catch (error) {
      return handleError(error);
    }
  },

  async deleteMediaType(id: number): Promise<void> {
    try {
      await api.delete(`/media_types/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
};

// Authors API
export const authorsApi = {
  async getAuthors(params?: { page?: number; per_page?: number; search?: string }): Promise<PaginatedResponse<Author>> {
    try {
      const response = await api.get<ApiResponse<{ authors: Author[]; pagination: PaginationMeta }>>('/authors', { params });
      return {
        data: response.data.data.authors,
        pagination: response.data.data.pagination,
      };
    } catch (error) {
      return handleError(error);
    }
  },

  async getAuthor(id: number): Promise<Author> {
    try {
      const response = await api.get<ApiResponse<{ author: Author }>>(`/authors/${id}`);
      return response.data.data.author;
    } catch (error) {
      return handleError(error);
    }
  },
};

// Publishers API
export const publishersApi = {
  async getPublishers(params?: { page?: number; per_page?: number; search?: string }): Promise<PaginatedResponse<Publisher>> {
    try {
      const response = await api.get<ApiResponse<{ publishers: Publisher[]; pagination: PaginationMeta }>>('/publishers', { params });
      return {
        data: response.data.data.publishers,
        pagination: response.data.data.pagination,
      };
    } catch (error) {
      return handleError(error);
    }
  },

  async getPublisher(id: number): Promise<Publisher> {
    try {
      const response = await api.get<ApiResponse<{ publisher: Publisher }>>(`/publishers/${id}`);
      return response.data.data.publisher;
    } catch (error) {
      return handleError(error);
    }
  },
};

// Favorites API
export const favoritesApi = {
  async getFavorites(): Promise<Favorite[]> {
    try {
      const response = await api.get<ApiResponse<{ favorites: Favorite[] }>>('/favorites');
      return response.data.data.favorites;
    } catch (error) {
      return handleError(error);
    }
  },

  async addToFavorites(mediaTypeId: number): Promise<Favorite> {
    try {
      const response = await api.post<ApiResponse<{ favorite: Favorite }>>('/favorites', { media_type_id: mediaTypeId });
      emitFavoritesChanged();
      return response.data.data.favorite;
    } catch (error) {
      return handleError(error);
    }
  },

  async removeFromFavorites(favoriteId: number): Promise<void> {
    try {
      await api.delete(`/favorites/${favoriteId}`);
      emitFavoritesChanged();
    } catch (error) {
      return handleError(error);
    }
  },
};

// Cart API
export const cartApi = {
  async getCart(): Promise<Cart> {
    try {
      const response = await api.get<ApiResponse<Cart>>('/cart_items');
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async addToCart(mediaTypeId: number, quantity: number = 1): Promise<void> {
    try {
      await api.post('/cart_items', { media_type_id: mediaTypeId, quantity });
      emitCartChanged();
    } catch (error) {
      return handleError(error);
    }
  },

  async updateCartItem(cartItemId: number, quantity: number): Promise<void> {
    try {
      await api.patch(`/cart_items/${cartItemId}`, { cart_item: { quantity } });
      emitCartChanged();
    } catch (error) {
      return handleError(error);
    }
  },

  async removeFromCart(cartItemId: number): Promise<void> {
    try {
      await api.delete(`/cart_items/${cartItemId}`);
      emitCartChanged();
    } catch (error) {
      return handleError(error);
    }
  },
};

// Analytics API
export interface AnalyticsEventPayload {
  action: AnalyticsAction;
  target_type?: string;
  target_id?: number;
  target_label?: string;
  search_term?: string;
}

export const analyticsApi = {
  // Best-effort: analytics should never interrupt the user flow, so failures
  // are swallowed rather than surfaced.
  async recordEvent(payload: AnalyticsEventPayload): Promise<void> {
    try {
      await api.post('/analytics_events', { analytics_event: payload });
    } catch {
      // Intentionally ignored.
    }
  },

  // Platform-wide analytics (admin only, enforced server-side).
  async getEvents(): Promise<AnalyticsResponse> {
    try {
      const response = await api.get<ApiResponse<AnalyticsResponse>>('/analytics_events');
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // URL for the admin SSE stream. EventSource can't set headers, so the JWT
  // and the last-seen id are passed as query params.
  streamUrl(lastId: number = 0): string {
    const token = localStorage.getItem('authToken') ?? '';
    const params = new URLSearchParams({ token, last_id: String(lastId) });
    return `${API_BASE_URL}/analytics_events/stream?${params.toString()}`;
  },
};

export default api;