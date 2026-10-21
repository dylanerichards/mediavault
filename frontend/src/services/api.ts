import axios, { type AxiosResponse } from 'axios';
import type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  AuthResponse,
  User,
  Book,
  Author,
  Publisher,
  Favorite,
  Cart,
  LoginForm,
  RegisterForm,
  BookForm
} from '../types/api';

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

const handleError = (error: any): never => {
  const apiError: ApiError = error.response?.data || {
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
    } catch (error) {
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

// Books API
export const booksApi = {
  async getBooks(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    author_id?: number;
    publisher_id?: number;
  }): Promise<PaginatedResponse<Book>> {
    try {
      const response = await api.get<ApiResponse<{ books: Book[]; pagination: any }>>('/books', { params });
      return {
        data: response.data.data.books,
        pagination: response.data.data.pagination,
      };
    } catch (error) {
      return handleError(error);
    }
  },

  async getBook(id: number): Promise<Book> {
    try {
      const response = await api.get<ApiResponse<{ book: Book }>>(`/books/${id}`);
      return response.data.data.book;
    } catch (error) {
      return handleError(error);
    }
  },

  async createBook(bookData: BookForm): Promise<Book> {
    try {
      const response = await api.post<ApiResponse<{ book: Book }>>('/books', { book: bookData });
      return response.data.data.book;
    } catch (error) {
      return handleError(error);
    }
  },

  async updateBook(id: number, bookData: Partial<BookForm>): Promise<Book> {
    try {
      const response = await api.patch<ApiResponse<{ book: Book }>>(`/books/${id}`, { book: bookData });
      return response.data.data.book;
    } catch (error) {
      return handleError(error);
    }
  },

  async deleteBook(id: number): Promise<void> {
    try {
      await api.delete(`/books/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
};

// Authors API
export const authorsApi = {
  async getAuthors(params?: { page?: number; per_page?: number; search?: string }): Promise<PaginatedResponse<Author>> {
    try {
      const response = await api.get<ApiResponse<{ authors: Author[]; pagination: any }>>('/authors', { params });
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
      const response = await api.get<ApiResponse<{ publishers: Publisher[]; pagination: any }>>('/publishers', { params });
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

  async addToFavorites(bookId: number): Promise<Favorite> {
    try {
      const response = await api.post<ApiResponse<{ favorite: Favorite }>>('/favorites', { book_id: bookId });
      return response.data.data.favorite;
    } catch (error) {
      return handleError(error);
    }
  },

  async removeFromFavorites(favoriteId: number): Promise<void> {
    try {
      await api.delete(`/favorites/${favoriteId}`);
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

  async addToCart(bookId: number, quantity: number = 1): Promise<void> {
    try {
      await api.post('/cart_items', { book_id: bookId, quantity });
    } catch (error) {
      return handleError(error);
    }
  },

  async updateCartItem(cartItemId: number, quantity: number): Promise<void> {
    try {
      await api.patch(`/cart_items/${cartItemId}`, { cart_item: { quantity } });
    } catch (error) {
      return handleError(error);
    }
  },

  async removeFromCart(cartItemId: number): Promise<void> {
    try {
      await api.delete(`/cart_items/${cartItemId}`);
    } catch (error) {
      return handleError(error);
    }
  },
};

export default api;