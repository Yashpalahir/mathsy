import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/api";

type UserType = "student" | "teacher" | "admin" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserType;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  userType: UserType;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, fullName: string, userType: "student" | "parent") => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.setToken(token);
      fetchUser();
        } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiClient.getMe();
      if (response.success && response.user) {
        setUser(response.user);
        setUserType(response.user.role);
      }
    } catch (error) {
      // Token might be invalid, clear it
      apiClient.setToken(null);
      setUser(null);
      setUserType(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const response = await apiClient.login(email, password);
      if (response.success && response.token && response.user) {
        apiClient.setToken(response.token);
        setUser(response.user);
        setUserType(response.user.role);
        return { error: null };
      }
      return { error: "Login failed" };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Login failed" };
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    fullName: string, 
    userType: "student" | "parent"
  ): Promise<{ error: string | null }> => {
    try {
      // Map "parent" to "student" for now, or you can add parent role to backend
      const role = userType === "parent" ? "student" : "student";
      const response = await apiClient.register({
        name: fullName,
      email,
      password,
        role,
      });
      
      if (response.success && response.token && response.user) {
        apiClient.setToken(response.token);
        setUser(response.user);
        setUserType(response.user.role);
        return { error: null };
      }
      return { error: "Signup failed" };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Signup failed" };
    }
  };

  const logout = async () => {
    apiClient.setToken(null);
    setUser(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        userType,
        isAuthenticated: !!user, 
        isLoading,
        login, 
        signup,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
