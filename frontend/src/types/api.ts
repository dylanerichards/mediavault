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

// Media Type (STI base shared by Book, Podcast, ...)
export interface MediaType {
  id: number;
  type: string;
  title: string;
  price: number;
  created_at: string;
  updated_at: string;
  // Subtype fields, present depending on `type`
  isbn?: string;
  publication_year?: number;
  author?: {
    id: number;
    name: string;
  };
  publisher?: {
    id: number;
    name: string;
  };
  host?: string;
  episode_count?: number;
}

// Book Types (type === 'Book')
export interface Book extends MediaType {
  isbn: string;
  publication_year: number;
  author: {
    id: number;
    name: string;
  };
  publisher: {
    id: number;
    name: string;
  };
}

// Podcast Types (type === 'Podcast')
export interface Podcast extends MediaType {
  host: string;
  episode_count: number;
}

// Favorite Types
export interface Favorite {
  id: number;
  media_type: MediaType;
  created_at: string;
}

// Cart Types
export interface CartItem {
  id: number;
  quantity: number;
  total_price: number;
  media_type: MediaType;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  cart_items: CartItem[];
  total_price: number;
  total_items: number;
}

// Analytics Types
export type AnalyticsAction =
  | 'view_item'
  | 'search'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'add_to_favorite'
  | 'remove_from_favorite';

export interface AnalyticsEventRecord {
  id: number;
  action: AnalyticsAction;
  target_type: string | null;
  target_id: number | null;
  target_label: string | null;
  search_term: string | null;
  user: { id: number; name: string };
  created_at: string;
}

export interface AnalyticsSummaryItem {
  action: AnalyticsAction;
  count: number;
}

export interface AnalyticsStats {
  total: number;
  top_items: { label: string; count: number }[];
  top_searches: { term: string; count: number }[];
  active_users: { name: string; count: number }[];
}

export interface AnalyticsResponse {
  events: AnalyticsEventRecord[];
  summary: AnalyticsSummaryItem[];
  stats: AnalyticsStats;
  pagination: PaginationMeta;
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