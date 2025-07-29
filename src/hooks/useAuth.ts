import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  apiClient,
  type LoginForm,
  type RegisterForm,
  type User,
} from "../services/api";

// Simple auth store using localStorage
class AuthStore {
  private tokenKey = "auth-token";
  private userKey = "auth-user";

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  removeUser(): void {
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  clear(): void {
    this.removeToken();
    this.removeUser();
  }
}

export const authStore = new AuthStore();

// Hook to get current authentication state
export const useAuth = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      if (!authStore.isAuthenticated()) {
        return null;
      }

      try {
        const response = await apiClient.getCurrentUser();
        const user = response.data.data.user;
        authStore.setUser(user);
        return user;
      } catch (error) {
        console.error("❌ Failed to fetch current user:", error);
        // Token is invalid, clear auth
        authStore.clear();
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry auth failures
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
  };
};

// Hook for login
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginForm) => {
      try {
        const response = await apiClient.login(credentials);
        return response.data;
      } catch (error: any) {
        console.error("Login failed:", error);
        console.log("Error response data:", error.response?.data);
        console.log("Error response status:", error.response?.status);

        // Extract error message from Axios response
        if (error.response?.data?.message) {
          console.log("Extracting message:", error.response.data.message);
          // Create a new error with the backend message
          const customError = new Error(error.response.data.message);
          customError.name = "LoginError";
          throw customError;
        }

        // Fallback to generic error
        console.log("Using fallback error message");
        throw new Error("Login failed. Please try again.");
      }
    },
    onSuccess: (data) => {
      const { user, token } = data.data;

      // Store auth data
      authStore.setToken(token);
      authStore.setUser(user);

      // Update query cache
      queryClient.setQueryData(["auth", "user"], user);

      // Navigate to dashboard
      navigate("/dashboard");
    },
  });
};

// Hook for registration
export const useRegister = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterForm) => {
      try {
        const response = await apiClient.register(userData);
        return response.data;
      } catch (error: any) {
        console.error("Registration failed:", error);

        // Extract error message from Axios response
        if (error.response?.data?.message) {
          // Create a new error with the backend message
          const customError = new Error(error.response.data.message);
          customError.name = "RegistrationError";
          throw customError;
        }

        // Fallback to generic error
        throw new Error("Registration failed. Please try again.");
      }
    },
    onSuccess: (data) => {
      const { user, token } = data.data;

      // Store auth data
      authStore.setToken(token);
      authStore.setUser(user);

      // Update query cache
      queryClient.setQueryData(["auth", "user"], user);

      // Navigate to dashboard
      navigate("/dashboard");
    },
  });
};

// Hook for logout
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.logout();
      } catch (error) {
        // Even if logout fails on server, clear local auth
        console.warn("Server logout failed, clearing local auth:", error);
      }
    },
    onSuccess: () => {
      // Clear auth data first
      authStore.clear();

      // Invalidate auth queries to force refetch
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      // Small delay to ensure state is cleared before navigation
      setTimeout(() => {
        navigate("/login");
      }, 100);
    },
    onError: (error: any) => {
      console.error("Logout failed:", error);
      // Still clear local auth even if there's an error
      authStore.clear();

      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      // Small delay to ensure state is cleared before navigation
      setTimeout(() => {
        navigate("/login");
      }, 100);
    },
  });
};

// Hook for getting stats
export const useStats = () => {
  return useQuery({
    queryKey: ["auth", "stats"],
    queryFn: async () => {
      const response = await apiClient.getStats();
      return response.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
