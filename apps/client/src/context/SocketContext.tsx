import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuthData } from "./AuthContext";

// const params = new URLSearchParams(window.location.search);
// const port = params.get("port") ?? "4000";
// const SOCKET_URL = `http://localhost:${port}`;

const SOCKET_URL = "http://localhost:4000";

interface SocketContextType {
  socket: Socket | null;
}
const SocketContext = createContext<SocketContextType | null>(null);

interface ProviderProps {
  children: React.ReactNode;
}

export const SocketProvider = ({ children }: ProviderProps) => {
  const { user } = useAuthData();

  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    if (!user) {
      setSocket(null);
      return;
    }

    const s = io(SOCKET_URL, { withCredentials: true });
    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketData = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocketData must be used inside SocketProvider");
  return ctx;
};
