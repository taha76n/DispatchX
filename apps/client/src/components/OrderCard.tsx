import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import type { OrderData } from "../pages/MyOrders";
import { useOrderTracking } from "../hooks/useOrderTracking";

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
  |"rider_assigned"
  | "out_for_delivery"
  | "delivered"
  | "cancelled_by_customer"
  | "cancelled_by_restaurant"
  | "timed_out";

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  rider_assigned: "Rider assigned",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled_by_customer: "Cancelled by you",
  cancelled_by_restaurant: "Cancelled by restaurant",
  timed_out: "Timed Out",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  placed: colors.fog,
  accepted: colors.route,
  preparing: colors.ember,
  rider_assigned: "#B794F4",
  out_for_delivery: colors.route,
  delivered: "#4CAF50",
  cancelled_by_customer: "#E5484D",
  cancelled_by_restaurant: "#E5484D",
  timed_out: colors.ember,
};

const formatPrice = (paisa: number) => `Rs. ${(paisa / 100).toFixed(2)}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

interface OrderCardProps {
  order: OrderData;
  cancellingOrderId?: string | null;
  onCancelOrder?: (orderId: string) => void;
  variant?: "customer" | "restaurant";
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderCard = ({
  order,
  cancellingOrderId,
  onCancelOrder,
  variant = "customer",
  onStatusChange,
}: OrderCardProps) => {
  // Live status from the socket, if any update has arrived yet.
  // Falls back to the originally-fetched status until the first
  // live event comes in (empty string means "nothing pushed yet").
  const liveStatus = useOrderTracking(order._id);
  const status = (liveStatus || order.status) as OrderStatus;
  const isRestaurant = variant === 'restaurant';


  const renderActions = () => {
    if (isRestaurant && onStatusChange) {
      switch (status) {
        case "placed":
          return (
            <>
              <Button
                onClick={() => onStatusChange(order._id, "accepted")}
                disabled={cancellingOrderId === order._id}
              >
                Accept
              </Button>
              <Button
                onClick={() =>
                  onStatusChange(order._id, "cancelled_by_restaurant")
                }
                disabled={cancellingOrderId === order._id}
              >
                Reject
              </Button>
            </>
          );
        case "accepted":
          return (
            <Button
              onClick={() => onStatusChange(order._id, "preparing")}
              disabled={cancellingOrderId === order._id}
            >
              Start Preparing
            </Button>
          );
        case "preparing":
          return (
            <Button
              onClick={() => onStatusChange(order._id, "out_for_delivery")}
              disabled={cancellingOrderId === order._id}
            >
              Mark Out for Delivery
            </Button>
          );
        case "out_for_delivery":
          return (
            <Button
              onClick={() => onStatusChange(order._id, "delivered")}
              disabled={cancellingOrderId === order._id}
            >
              Mark Delivered
            </Button>
          );
        default:
          return null;
      }
    }

    if (!isRestaurant && status === "placed" && onCancelOrder) {
      return (
        <Button
          onClick={() => onCancelOrder(order._id)}
          disabled={cancellingOrderId === order._id}
          size="small"
          sx={{ color: "#E5484D", textTransform: "none", pl: 0 }}
        >
          {cancellingOrderId === order._id ? "Cancelling..." : "Cancel order"}
        </Button>
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        bgcolor: colors.panel,
        border: "1px solid rgba(245,243,238,0.08)",
        borderRadius: 2,
        p: 3,
      }}
    >
      <Stack
        direction="row"
        sx={{
          mb: 1,
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
          label={STATUS_LABEL[status]}
          size="small"
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 10,
            letterSpacing: 0.5,
            bgcolor: `${STATUS_COLOR[status]}20`,
            color: STATUS_COLOR[status],
          }}
        />
      </Stack>

      <Divider sx={{ borderColor: "rgba(245,243,238,0.08)", my: 1.5 }} />

      <Stack spacing={0.5} sx={{ mb: 1.5 }}>
        {order.items.map((item, idx) => (
          <Stack
            key={idx}
            direction="row"
            sx={{ justifyContent: "space-between" }}
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
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center" }}
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

      {/*{status === "placed" && (
        <>
          <Divider sx={{ borderColor: "rgba(245,243,238,0.08)", my: 1.5 }} />
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
            {cancellingOrderId === order._id ? "Cancelling..." : "Cancel order"}
          </Button>
        </>
      )}*/}

      {renderActions() && (
        <>
          <Divider sx={{ borderColor: "rgba(245,243,238,0.08)", my: 1.5 }} />
          <Stack direction="row" spacing={1}>
            {renderActions()}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default OrderCard;
