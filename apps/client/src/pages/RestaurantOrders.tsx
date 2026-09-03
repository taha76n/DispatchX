import {
  Alert,
  Box,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { ApiError } from "../lib/apiError";
import { useParams } from "react-router-dom";
import OrderCard from "../components/OrderCard";

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


const RestaurantOrders = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null
  );

  const params = useParams();
  const restaurantId = params.restaurantId;

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
    fetchOrders();
  }, [restaurantId]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      setError("");
      setLoading(true);
      setCancellingOrderId(orderId); // reuse as updating indicator
      await api.patch(`/order/${orderId}/status`, { status: newStatus });
      // Optionally refetch to sync, but socket will update the card
      fetchOrders();
    } catch (error) {
      if (error instanceof ApiError) setError(error.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
      setCancellingOrderId(null);
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
              <OrderCard
                key={order._id}
                order={order}
                variant="restaurant"
                cancellingOrderId={cancellingOrderId}
                onStatusChange={handleStatusChange}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default RestaurantOrders;
