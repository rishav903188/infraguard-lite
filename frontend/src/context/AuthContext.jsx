import { createContext, useContext, useState, useEffect } from "react";
import apiClient, { registerAuthHandlers } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    registerAuthHandlers({
      getAccessToken: () => accessToken,
      onTokenRefreshed: (newAccessToken, newRefreshToken) => {
        setAccessToken(newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
      },
      onAuthFailure: () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("refreshToken");
      },
    });
  }, [accessToken]);

  
  useEffect(() => {
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (!storedRefreshToken) {
      setIsLoading(false);
      return;
    }

    apiClient
      .post("/auth/refresh", { refreshToken: storedRefreshToken })
      .then((res) => {
        const { accessToken, refreshToken } = res.data.data;
        setAccessToken(accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        return apiClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      })
      .then((res) => {
        setUser(res.data.data.user);
      })
      .catch(() => {
        localStorage.removeItem("refreshToken");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function login(userData, tokens) {
    setUser(userData);
    setAccessToken(tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }

  function logout() {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("refreshToken");
  }

  const value = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!accessToken,
    login,
    logout,
    setAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}