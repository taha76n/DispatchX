import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { ApiError } from "../lib/apiError";
import { useParams } from "react-router-dom";

const colors = {
  ink: "#14171C",
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
  route: "#4FD1C5",
};

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled_by_customer"
  | "cancelled_by_restaurant";

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled_by_customer: "Cancelled by you",
  cancelled_by_restaurant: "Cancelled by restaurant",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  placed: colors.fog,
  accepted: colors.route,
  preparing: colors.ember,
  out_for_delivery: colors.route,
  delivered: "#4CAF50",
  cancelled_by_customer: "#E5484D",
  cancelled_by_restaurant: "#E5484D",
};

interface OrderItemData {
  itemName: string;
  itemPrice: number;
  quantity: number;
}

export interface OrderData {
  _id: string;
  restaurantName: string;
  items: OrderItemData[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

const formatPrice = (paisa: number) => `Rs. ${(paisa / 1).toFixed(2)}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const RestaurantOrders = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null
  );

  const params = useParams()
  const restaurantId = params.restaurantId

  const fetchOrders = async () => {
    try {
      setError("");
      setLoading(true);
      const { orders } = await api.get(`/order/restaurant/${restaurantId}`);
      setOrders(orders);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders()
  }, [restaurantId])
  

  const onCancelOrder = async (orderId: string) => {
    try {
      setError("");
      setLoading(true);
      setCancellingOrderId(orderId);
      const { order } = await api.patch(`/order/${orderId}/status`, {
        status: "cancelled_by_restaurant",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ bgcolor: colors.ink, minHeight: "100vh", color: colors.paper }}>
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 12,
            letterSpacing: 2,
            color: colors.route,
            mb: 1,
          }}
        >
          ORDER HISTORY
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: { xs: 26, md: 32 },
            letterSpacing: -0.5,
            mb: 4,
          }}
        >
          Your orders
        </Typography>

        {loading && <Loading />}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && orders.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography variant="h6" sx={{ color: colors.fog }}>
              No orders yet
            </Typography>
            <Typography variant="body2" sx={{ color: colors.fog }}>
              Once you place an order, it'll show up here
            </Typography>
          </Box>
        )}

        {!loading && !error && orders.length > 0 && (
          <Stack spacing={2}>
            {orders.map((order) => (
              <Box
                key={order._id}
                sx={{
                  bgcolor: colors.panel,
                  border: "1px solid rgba(245,243,238,0.08)",
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Stack
                  sx={{
                    mb: 1,
                    direction: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 600,
                        fontSize: 17,
                      }}
                    >
                      {order.restaurantName}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: 11,
                        color: colors.fog,
                      }}
                    >
                      {formatDate(order.createdAt)} · #{order._id.slice(-6)}
                    </Typography>
                  </Box>

                  <Chip
                    label={STATUS_LABEL[order.status]}
                    size="small"
                    sx={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: 10,
                      letterSpacing: 0.5,
                      bgcolor: `${STATUS_COLOR[order.status]}20`,
                      color: STATUS_COLOR[order.status],
                    }}
                  />
                </Stack>

                <Divider
                  sx={{ borderColor: "rgba(245,243,238,0.08)", my: 1.5 }}
                />

                <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                  {order.items.map((item, idx) => (
                    <Stack
                      key={idx}
                      sx={{ direction: "row", justifyContent: "space-between" }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Inter", sans-serif',
                          fontSize: 13.5,
                          color: colors.fog,
                        }}
                      >
                        {item.quantity} × {item.itemName}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: '"IBM Plex Mono", monospace',
                          fontSize: 13,
                          color: colors.fog,
                        }}
                      >
                        {formatPrice(item.itemPrice * item.quantity)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Stack
                  sx={{
                    direction: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: 12,
                      color: colors.fog,
                    }}
                  >
                    TOTAL
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: 600,
                      fontSize: 16,
                    }}
                  >
                    {formatPrice(order.totalPrice)}
                  </Typography>
                </Stack>

                {order.status === "placed" && (
                  <>
                    <Divider
                      sx={{ borderColor: "rgba(245,243,238,0.08)", my: 1.5 }}
                    />
                    <Button
                      onClick={() => onCancelOrder(order._id)}
                      disabled={cancellingOrderId === order._id}
                      size="small"
                      sx={{
                        color: "#E5484D",
                        textTransform: "none",
                        pl: 0,
                        "&:hover": { bgcolor: "rgba(229,72,77,0.08)" },
                      }}
                    >
                      {cancellingOrderId === order._id
                        ? "Cancelling..."
                        : "Cancel order"}
                    </Button>
                  </>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default RestaurantOrders;
