import { Box, Button, Stack, Typography } from "@mui/material";
import RiderDestinationMap from "./RiderDestinationMap";

const colors = {
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
  route: "#4FD1C5",
};

export interface CurrentDeliveryData {
  _id: string;
  status: "rider_assigned" | "out_for_delivery";
  restaurantId: {
    name: string;
    address: {
      text: string;
      location: { coordinates: [number, number] };
    };
  };
  deliveryAddress: {
    text: string;
    location: { coordinates: [number, number] };
  };
  totalPrice: number;
}

interface CurrentDeliveryCardProps {
  delivery: CurrentDeliveryData;
  onAdvance: () => void;
  advancing: boolean;
}

const formatPrice = (paisa: number) => `Rs. ${(paisa / 100).toFixed(2)}`;

const CurrentDeliveryCard = ({
  delivery,
  onAdvance,
  advancing,
}: CurrentDeliveryCardProps) => {
  const nextLabel =
    delivery.status === "rider_assigned" ? "Mark picked up" : "Mark delivered";

  const destination =
    delivery.status === "rider_assigned"
      ? {
          lat: delivery.restaurantId.address.location.coordinates[1],
          lng: delivery.restaurantId.address.location.coordinates[0],
        }
      : {
          lat: delivery.deliveryAddress.location.coordinates[1],
          lng: delivery.deliveryAddress.location.coordinates[0],
        };

  return (
    <Box
      sx={{
        bgcolor: colors.panel,
        border: `1px solid ${colors.route}40`,
        borderRadius: 2,
        p: 3,
        mb: 3,
      }}
    >
      <Typography
        sx={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 11,
          letterSpacing: 1.5,
          color: colors.route,
          mb: 1.5,
        }}
      >
        CURRENT DELIVERY
      </Typography>

      <Typography
        sx={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 600,
          fontSize: 18,
          mb: 0.5,
        }}
      >
        {delivery.restaurantId.name}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: 13,
          color: colors.fog,
          mb: 2,
        }}
      >
        {delivery.restaurantId.address.text}
      </Typography>

      <Stack
        sx={{
          mb: 2,
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
          {delivery.status === "rider_assigned"
            ? "Heading to pickup"
            : "Out for delivery"}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {formatPrice(delivery.totalPrice)}
        </Typography>
      </Stack>

      <RiderDestinationMap destination={destination} />

      <Button
        fullWidth
        onClick={onAdvance}
        disabled={advancing}
        variant="contained"
        sx={{
          bgcolor: colors.ember,
          textTransform: "none",
          "&:hover": { bgcolor: "#D67630" },
        }}
      >
        {advancing ? "Updating..." : nextLabel}
      </Button>
    </Box>
  );
};

export default CurrentDeliveryCard;
