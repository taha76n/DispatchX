import { useEffect, useState } from "react";
import { useSocketData } from "../context/SocketContext";

interface OrderStatusUpdatepayload {
  orderId: string;
  status: string;
}

export const useOrderTracking = (orderId: string) => {
  const { socket } = useSocketData();
  const [orderStatus, setOrderStatus] = useState<string | "">("");

  useEffect(() => {
    if (!orderId) {
      return;
    }

    if (!socket) return;

    const handleStatusUpdate = (payload: OrderStatusUpdatepayload) => {
      if (payload.orderId === orderId) {
        setOrderStatus(payload.status);
        console.log(payload);
      }
    };

    // Re-join the room every time the socket connects.
    // Fires on the initial connection AND on every reconnect.
    const joinRoom = () => socket.emit("joinOrderRoom", orderId);

    socket.on("connect", joinRoom);
    socket.on("orderStatusUpdated", handleStatusUpdate);

    if (socket.connected) joinRoom();

    return () => {
      socket.off("connect", joinRoom);
      socket.off("orderStatusUpdated", handleStatusUpdate);
    };
  }, [orderId, socket]);

  return orderStatus;
};
