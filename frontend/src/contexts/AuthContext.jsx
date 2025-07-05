import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  const setTokens = useCallback((access) => {
    setAccessToken(access);
    setIsLoggedIn(true);
    localStorage.setItem("accessToken", access);
  }, []);

  const clearTokens = useCallback(() => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem("accessToken");
  }, []);

  const validateToken = useCallback(async () => {
    if (!accessToken) {
      clearTokens();
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Token validation failed");
      }

      const data = await response.json();
      if (data.success) {
        setUserData(data.data);
      }else {
        clearTokens();
      }
    } catch (error) {
      console.error("Token validation error:", error);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, clearTokens]);

  useEffect(() => {
    const storedAccess = localStorage.getItem("accessToken");
    if (storedAccess) {
      setAccessToken(storedAccess);
      validateToken();
    }else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, [validateToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isLoggedIn,
        setTokens,
        clearTokens,
        isLoading,
        userData,
        setUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
