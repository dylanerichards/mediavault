// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  errors?: string[];
}

export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Author Types
export interface Author {
  id: number;
  name: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

// Publisher Types
export interface Publisher {
  id: number;
  name: string;
  country: string;
  created_at: string;
  updated_at: string;
}

// Book Types
export interface Book {
  id: number;
  title: string;
  isbn: string;
  price: number;
  publication_year: number;
  author: {
    id: number;
    name: string;
  };
  publisher: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

// Favorite Types
export interface Favorite {
  id: number;
  book: Book;
  created_at: string;
}

// Cart Types
export interface CartItem {
  id: number;
  quantity: number;
  total_price: number;
  book: Book;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  cart_items: CartItem[];
  total_price: number;
  total_items: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export interface BookForm {
  title: string;
  isbn: string;
  price: number;
  publication_year: number;
  author_id: number;
  publisher_id: number;
}