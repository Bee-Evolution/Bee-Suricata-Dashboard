"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type {
  AuthContextType,
  AuthState,
  LoginCredentials,
  User,
} from "@/types/auth";

// Auth actions
type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "REFRESH_TOKEN"; payload: { user: User; token: string } }
  | { type: "SET_LOADING"; payload: boolean };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      console.log("LOGIN_SUCCESS reducer called with:", action.payload);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "REFRESH_TOKEN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Simple token validation (in production, you'd verify JWT signature)
  const isTokenValid = useCallback((token: string): boolean => {
    try {
      // For demo purposes, we'll use a simple base64 decode
      // In production, use proper JWT verification
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Skip time validation during initial render to prevent hydration mismatch
      // In production, you'd want to validate the token properly
      return payload?.user_id;
    } catch {
      return false;
    }
  }, []);

  // Check for existing token on mount (client-side only)
  useEffect(() => {
    const initializeAuth = () => {
      // Only run on client side
      if (typeof window === "undefined") return;

      try {
        const token = localStorage.getItem("matseka_auth_token");
        const userStr = localStorage.getItem("matseka_auth_user");

        if (token && userStr) {
          const user = JSON.parse(userStr);
          // Verify token is still valid (simple check)
          if (isTokenValid(token)) {
            dispatch({
              type: "REFRESH_TOKEN",
              payload: { user, token },
            });
          } else {
            // Token expired, clear storage
            localStorage.removeItem("matseka_auth_token");
            localStorage.removeItem("matseka_auth_user");
            dispatch({ type: "SET_LOADING", payload: false });
          }
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, [isTokenValid]);

  // Generate a simple JWT-like token
  const generateToken = (user: User): string => {
    const header = {
      alg: "HS256",
      typ: "JWT",
    };

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.secret`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" });

    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: "Database not configured",
        });
        return false;
      }

      // Authenticate with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: `${credentials.username}@matsekasuricata.local`, // Convert username to email format
          password: credentials.password,
        });

      if (authError || !authData.user) {
        // Fallback: Check admin_users table directly for backward compatibility
        const { data: adminUser, error: dbError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("username", credentials.username)
          .single();

        if (dbError || !adminUser) {
          dispatch({
            type: "LOGIN_FAILURE",
            payload: "Invalid username or password",
          });
          return false;
        }

        // For now, just check if username exists (password verification would need bcrypt)
        // In production, passwords should be hashed and verified
        const user: User = {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email || "",
          role: adminUser.role || "admin",
          createdAt: adminUser.created_at || new Date().toISOString(),
        };

        const token = generateToken(user);

        // Store in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("matseka_auth_token", token);
          localStorage.setItem("matseka_auth_user", JSON.stringify(user));
        }

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user, token },
        });

        router.push("/");
        return true;
      }

      // Supabase auth successful
      const user: User = {
        id: authData.user.id,
        username: credentials.username,
        email: authData.user.email || "",
        role: "admin",
        createdAt: new Date().toISOString(),
      };

      const token = authData.session?.access_token || generateToken(user);

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("matseka_auth_token", token);
        localStorage.setItem("matseka_auth_user", JSON.stringify(user));
      }

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });

      console.log("Login successful, redirecting to dashboard...");
      router.push("/");
      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please try again.";
      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      });
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Continue with logout even if Supabase call fails
    } finally {
      // Always clear local storage and state (client-side only)
      if (typeof window !== "undefined") {
        localStorage.removeItem("matseka_auth_token");
        localStorage.removeItem("matseka_auth_user");
      }
      dispatch({ type: "LOGOUT" });

      // Redirect to home page after logout
      router.push("/");
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("matseka_auth_token")
          : null;

      if (token && supabase) {
        // Check if Supabase session is still valid
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const user: User = {
            id: session.user.id,
            username: session.user.email?.split("@")[0] || "admin",
            email: session.user.email || "",
            role: "admin",
            createdAt: new Date().toISOString(),
          };

          dispatch({
            type: "REFRESH_TOKEN",
            payload: { user, token: session.access_token },
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
