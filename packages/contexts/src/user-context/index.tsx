"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/**
 * User type - customize based on your auth system
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: string;
}

/**
 * User context value type
 */
interface UserContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

/**
 * User context provider
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    // Add your logout logic here (clear cookies, redirect, etc.)
  }, []);

  const value: UserContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    setUser: (newUser) => {
      setUser(newUser);
      setIsLoading(false);
    },
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Hook to access user context
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

/**
 * Hook to access authenticated user (throws if not authenticated)
 */
export function useAuthenticatedUser() {
  const { user, isAuthenticated } = useUser();
  if (!isAuthenticated || !user) {
    throw new Error("User is not authenticated");
  }
  return user;
}
