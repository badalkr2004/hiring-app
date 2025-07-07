import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../libs/apis";

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
  
  // Update userData and store in localStorage
  const updateUserData = useCallback((user) => {
    setUserData(user);
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
    } else {
      localStorage.removeItem("userData");
    }
  }, []);

  const clearTokens = useCallback(() => {
    setIsLoggedIn(false);
    updateUserData(null);
    localStorage.removeItem("accessToken");
  }, [updateUserData]);

  const validateToken = useCallback(async (token) => {
    if (!token) {
      clearTokens();
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get("/auth/profile", {
        token: token,
      });

      if (!response.success) {
        throw new Error("Token validation failed");
      }

      updateUserData(response.data.user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Token validation error:", error);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, [clearTokens, updateUserData]);

  useEffect(() => {
    const storedAccess = localStorage.getItem("accessToken");
    const storedUserData = localStorage.getItem("userData");
    
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      } catch (error) {
        console.error("Error parsing userData from localStorage:", error);
        localStorage.removeItem("userData");
      }
    }
    
    if (storedAccess) {
      setAccessToken(storedAccess);
      validateToken(storedAccess);
    } else {
      setIsLoggedIn(false);
      setUserData(null);
      setIsLoading(false);
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
        setUserData: updateUserData,
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
