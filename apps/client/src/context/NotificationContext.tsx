import { Alert, Snackbar } from "@mui/material";
import { createContext, useContext, useEffect, useState } from "react";
import type React from "react";
import { useSocketData } from "./SocketContext";

interface Toast {
  id: number;
  message: string;
  severity: "info" | "success" | "warning";
}

const STATUS_MESSAGES: Record<string, string> = {
  accepted: "Your order was accepted by the restaurant!",
  preparing: "Your order is being prepared.",
  rider_assigned: "A rider has been assigned to your order!",
  out_for_delivery: "Your order is out for delivery!",
  delivered: "Your order has been delivered.",
  cancelled_by_customer: "Order cancelled.",
  cancelled_by_restaurant: "Your order was cancelled by the restaurant.",
  timed_out: "The restaurant didn't respond in time — order cancelled.",
  no_rider_found: "No rider was available for this order.",
};

const NotificationContext = createContext<null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket } = useSocketData();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (payload: { status: string }) => {
      const message = STATUS_MESSAGES[payload.status];
      if (!message) return;
      setToasts((prev) => [...prev, { id: Date.now(), message, severity: "info" }]);
    };

    const handleOffer = () => {
      setToasts((prev) => [
        ...prev,
        { id: Date.now(), message: "New delivery offer received!", severity: "info" },
      ]);
    };

    socket.on("orderStatusUpdated", handleStatusUpdate);
    socket.on("deliveryOffer", handleOffer);

    return () => {
      socket.off("orderStatusUpdated", handleStatusUpdate);
      socket.off("deliveryOffer", handleOffer);
    };
  }, [socket]);

  const closeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={null}>
      {children}
      {toasts.map((toast, idx) => (
        <Snackbar
          key={toast.id}
          open
          autoHideDuration={4000}
          onClose={() => closeToast(toast.id)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{ bottom: `${16 + idx * 60}px !important` }}
        >
          <Alert severity={toast.severity} onClose={() => closeToast(toast.id)} variant="filled">
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);