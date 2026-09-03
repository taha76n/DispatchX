import { useEffect, useState } from "react";
import { useSocketData } from "../context/SocketContext";

interface OrderStatusUpdatepayload {
  orderId: string;
  status: string;
}

export const useOrderTracking = (orderId: string) => {
  const { socketRef } = useSocketData();
  const [orderStatus, setOrderStatus] = useState<string | "">("");

  useEffect(() => {
    if (!orderId) {
      return;
    }
    if (!socketRef.current) {
      return;
    }

    const handleStatusUpdate = (payload: OrderStatusUpdatepayload) => {
      if (payload.orderId === orderId) {
        setOrderStatus(payload.status);
      }
    };

    socketRef.current.emit("joinOrderRoom", orderId);
    socketRef.current.on("orderStatusUpdated", handleStatusUpdate);

    return () => {
      socketRef.current?.off("orderStatusUpdated", handleStatusUpdate);
    };
  }, [orderId, socketRef]);

  return orderStatus;
};
