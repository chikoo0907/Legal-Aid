import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const savedUser = await AsyncStorage.getItem("auth_user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      setUser(null);
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  };

  // Keep AsyncStorage in sync whenever the in‑memory user changes
  useEffect(() => {
    if (!hydrated) return;

    const persistUser = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem("auth_user", JSON.stringify(user));
        } else {
          await AsyncStorage.removeItem("auth_user");
        }
      } catch (error) {
        console.error("Error persisting auth user:", error);
      }
    };

    persistUser();
  }, [user, hydrated]);

  const login = async (userData) => {
    try {
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("auth_user");
      setUser(null);
    } catch (error) {
      console.error("Error in logout:", error);
      await AsyncStorage.removeItem("auth_user");
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      login,
      logout,
      loading,
      isAuthenticated: !!user,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
