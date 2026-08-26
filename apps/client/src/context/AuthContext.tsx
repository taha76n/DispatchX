import type { PublicUser } from "@dispatchx/shared";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

interface AuthContextType {
  user: PublicUser | null;
  setUser: React.Dispatch<React.SetStateAction<PublicUser | null>>;
  loading: boolean;
}

const authContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setloading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      setloading(true);
      const { user } = await api.get<{
        success: boolean;
        message: string;
        user: PublicUser;
      }>(`/auth/profile`);
      setUser(user);
      setloading(false);
    } catch (error) {
      setloading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <authContext.Provider value={{ user, setUser, loading }}>
      {children}
    </authContext.Provider>
  );
};

const useAuthData = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("Auth context is missing in useContext");
  }
  return context;
};

export { authContext, AuthProvider, useAuthData };
