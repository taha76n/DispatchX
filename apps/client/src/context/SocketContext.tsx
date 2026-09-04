import React, { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthData } from "./AuthContext";


const params = new URLSearchParams(window.location.search);
const port = params.get("port") ?? "4000";
const SOCKET_URL = `http://localhost:${port}`;
// const SOCKET_URL = "http://localhost:4000";

interface SocketContextType {
  socketRef: React.RefObject<Socket | null>;
}
const SocketContext = createContext<SocketContextType | null>(null);

interface ProviderProps {
  children: React.ReactNode;
}

export const SocketProvider = ({ children }: ProviderProps) => {
  const { user } = useAuthData();

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (user) {
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, { withCredentials: true });
      }
    }
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user]);
  return (
    <SocketContext.Provider value={{socketRef}}>{children}</SocketContext.Provider>
  );
};

export const useSocketData = () => {
  return useContext(SocketContext);
};
