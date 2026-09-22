import { useEffect, useState } from "react";
import { useSocketData } from "../context/SocketContext";

interface RiderPosition {
  longitude: number;
  latitude: number;
}

export const useRiderLocationTracking = (orderId: string, enabled: boolean) => {
  const { socket } = useSocketData();
  const [position, setPosition] = useState<RiderPosition | null>(null);

  useEffect(() => {
    console.log("useRiderLocationTracking effect running", { orderId, enabled, hasSocket: !!socket});

    if (!enabled || !orderId || !socket) return;

    const handleUpdate = (payload: RiderPosition & { orderId: string }) => {
      console.log("riderLocationUpdate received:", payload);

      if (payload.orderId === orderId) {
        setPosition({ longitude: payload.longitude, latitude: payload.latitude });
      }
    };

    socket.on("riderLocationUpdate", handleUpdate);

    return () => {
      socket.off("riderLocationUpdate", handleUpdate);
    };
  }, [orderId, enabled, socket]);

  return position;
};