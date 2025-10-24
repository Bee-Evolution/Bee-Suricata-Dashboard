/**
 * Authentication types for Matseka Suricata Dashboard
 */

export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "viewer";
  lastLogin?: string;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

// Default admin credentials (should be changed in production)
export const DEFAULT_ADMIN = {
  username: "admin",
  password: "suricata2024",
  email: "admin@matsekasuricata.com",
  role: "admin" as const,
};

// Token storage keys
export const AUTH_TOKEN_KEY = "matseka_auth_token";
export const AUTH_USER_KEY = "matseka_auth_user";
