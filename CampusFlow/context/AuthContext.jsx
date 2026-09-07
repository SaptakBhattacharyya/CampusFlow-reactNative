import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useClerk } from "@clerk/expo";
import { loginUser, registerUser, getMe, googleAuth, updateProfile } from "../services/api";

const TOKEN_KEY = "campusflow_auth_token";
const USER_KEY = "campusflow_user_data";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const clerk = useClerk();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore stored session on app startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(USER_KEY);

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }

          // Fetch fresh user data from server in background
          try {
            const freshData = await getMe(storedToken);
            if (freshData?.user) {
              setUser(freshData.user);
              await SecureStore.setItemAsync(
                USER_KEY,
                JSON.stringify(freshData.user)
              );
            }
          } catch (fetchErr) {
            console.log("Token might be expired or server unreachable:", fetchErr.message);
          }
        }
      } catch (err) {
        console.error("Error restoring session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login handler
  const login = async (email, password, role) => {
    const data = await loginUser({ email, password, role });

    if (data?.token && data?.user) {
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  // Register handler
  const register = async (userData) => {
    const data = await registerUser(userData);

    if (data?.token && data?.user) {
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  // Google Login / Register handler
  const loginWithGoogle = async (googleData) => {
    const data = await googleAuth(googleData);

    if (data?.token && data?.user) {
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  // Logout handler
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (err) {
      console.error("Error during logout cleanup:", err);
    }
    try {
      if (clerk?.signOut) {
        await clerk.signOut();
      }
    } catch (clerkErr) {
      console.log("Clerk signout error:", clerkErr);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  // Helper to update user locally
  const updateUserLocally = async (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
  };

  // Re-fetch user profile from backend (useful after role updates)
  const refreshUser = async () => {
    if (!token) return null;
    try {
      const freshData = await getMe(token);
      if (freshData?.user) {
        setUser(freshData.user);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(freshData.user));
        return freshData.user;
      }
    } catch (err) {
      console.error("refreshUser error:", err);
    }
    return null;
  };

  // Update user profile on server and locally
  const updateUserProfile = async (profileData) => {
    if (!token) throw new Error("Authentication token missing");
    const res = await updateProfile(profileData, token);
    if (res?.user) {
      setUser(res.user);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(res.user));
      return res.user;
    }
    return null;
  };

  // Normalized role calculation
  let currentRole = user?.role || "User";
  if (currentRole === "Student" || currentRole === "Faculty") currentRole = "User";
  if (currentRole === "Staff") currentRole = "Support";

  const isAdmin = currentRole === "Admin";
  const isSupport = currentRole === "Support" || currentRole === "Admin";
  const isGeneralUser = currentRole === "User";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        role: currentRole,
        isAdmin,
        isSupport,
        isGeneralUser,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUserLocally,
        updateUserProfile,
        refreshUser,
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
