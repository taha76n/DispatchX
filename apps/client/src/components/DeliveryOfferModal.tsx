import { Button, Dialog, DialogContent, LinearProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const colors = {
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
  route: "#4FD1C5",
};

export interface DeliveryOffer {
  orderId: string;
  restaurantName: string;
  restaurantAddress: { text: string };
  orderedItems: { itemName: string; quantity: number }[];
  orderTotalPrice: number;
}

interface DeliveryOfferModalProps {
  offer: DeliveryOffer | null;
  onAccept: () => void;
  onDecline: () => void;
  responding: boolean;
  offerWindowSeconds?: number;
}

const formatPrice = (paisa: number) => `Rs. ${(paisa / 100).toFixed(2)}`;

const DeliveryOfferModal = ({
  offer,
  onAccept,
  onDecline,
  responding,
  offerWindowSeconds = 20,
}: DeliveryOfferModalProps) => {
  const [secondsLeft, setSecondsLeft] = useState(offerWindowSeconds);

  useEffect(() => {
    if (!offer) return;
    setSecondsLeft(offerWindowSeconds);

    const tick = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(tick);
  }, [offer, offerWindowSeconds]);

  if (!offer) return null;

  return (
    <Dialog open onClose={() => {}} maxWidth="xs" fullWidth>
      <DialogContent sx={{ bgcolor: colors.panel, color: colors.paper, p: 3 }}>
        <Typography
          sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, letterSpacing: 2, color: colors.route, mb: 1 }}
        >
          NEW DELIVERY OFFER
        </Typography>

        <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: 20, mb: 0.5 }}>
          {offer.restaurantName}
        </Typography>
        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: colors.fog, mb: 2 }}>
          {offer.restaurantAddress.text}
        </Typography>

        <Stack spacing={0.5} sx={{ mb: 2 }}>
          {offer.orderedItems.map((item, idx) => (
            <Typography key={idx} sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13.5, color: colors.fog }}>
              {item.quantity} × {item.itemName}
            </Typography>
          ))}
        </Stack>

        <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: 18, mb: 3 }}>
          {formatPrice(offer.orderTotalPrice)}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={(secondsLeft / offerWindowSeconds) * 100}
          sx={{
            mb: 3,
            height: 4,
            borderRadius: 2,
            bgcolor: "rgba(245,243,238,0.1)",
            "& .MuiLinearProgress-bar": { bgcolor: colors.ember },
          }}
        />

        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            onClick={onDecline}
            disabled={responding}
            variant="outlined"
            sx={{ color: colors.fog, borderColor: "rgba(245,243,238,0.2)", textTransform: "none" }}
          >
            Decline
          </Button>
          <Button
            fullWidth
            onClick={onAccept}
            disabled={responding}
            variant="contained"
            sx={{ bgcolor: colors.ember, textTransform: "none", "&:hover": { bgcolor: "#D67630" } }}
          >
            {responding ? "..." : "Accept"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryOfferModal;