import {
  Alert,
  Box,
  Chip,
  Container,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { ApiError } from "../lib/apiError";
import { useSocketData } from "../context/SocketContext";
import DeliveryOfferModal, {
  type DeliveryOffer,
} from "../components/DeliveryOfferModal";
import CurrentDeliveryCard, {
  type CurrentDeliveryData,
} from "../components/CurrentDeliveryCard";

const colors = {
  ink: "#14171C",
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
  route: "#4FD1C5",
};

export interface RiderProfileData {
  name: string;
  vehicleType: "Car" | "Motorbike";
  numberPlate: string;
  vehicleModelName: string;
  isOnline: boolean;
  ordersCompleted: number;
}

const RiderDashboard = () => {
  const { socket } = useSocketData();

  const [profile, setProfile] = useState<RiderProfileData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingOnline, setTogglingOnline] = useState(false);

  const [offer, setOffer] = useState<DeliveryOffer | null>(null);
  const [respondingToOffer, setRespondingToOffer] = useState(false);

  // add alongside your other state
  const [currentDelivery, setCurrentDelivery] =
    useState<CurrentDeliveryData | null>(null);
  const [advancingDelivery, setAdvancingDelivery] = useState(false);

  const fetchCurrentDelivery = async () => {
    try {
      const { order } = await api.get("/rider/current-delivery");
      setCurrentDelivery(order);
    } catch (err) {
      if (err instanceof ApiError) {
        setCurrentDelivery(null);   
        return;                      
      }
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  };

  useEffect(() => {
    fetchCurrentDelivery();
  }, []);

  // re-fetch whenever an offer is accepted, and whenever the order's
  // live status changes (delivered clears it, etc.)
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchCurrentDelivery();
    };

    socket.on("orderStatusUpdated", handleUpdate);
    return () => {
      socket?.off("orderStatusUpdated", handleUpdate);
    };
  }, [socket]);

  const advanceDelivery = async () => {
    if (!currentDelivery) return;
    try {
      setAdvancingDelivery(true);
      const nextStatus =
        currentDelivery.status === "rider_assigned"
          ? "out_for_delivery"
          : "delivered";
      await api.patch(`/order/${currentDelivery._id}/status`, {
        status: nextStatus,
      });
      await fetchCurrentDelivery();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setAdvancingDelivery(false);
    }
  };

  const fetchRider = async () => {
    try {
      setError("");
      setPageLoading(true);
      const { riderProfile } = await api.get("/rider/profile");
      setProfile(riderProfile);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchRider();
  }, []);

  // Listen for incoming delivery offers over the socket.
  useEffect(() => {
    if (!socket) return;

    const handleOffer = (payload: DeliveryOffer) => {
      setOffer(payload);
    };

    socket.on("deliveryOffer", handleOffer);

    return () => {
      socket?.off("deliveryOffer", handleOffer);
    };
  }, [socket]);

  const onToggleOnline = async () => {
    try {
      setError("");
      setTogglingOnline(true);
      const { newStatus } = await api.patch("/rider/status");
      setProfile((prev) => (prev ? { ...prev, isOnline: newStatus } : prev));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setTogglingOnline(false);
    }
  };

  // Background location ping loop, active only while online.
  useEffect(() => {
    if (!profile?.isOnline) return;

    const tick = setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        console.log("ping");
        
        try {
          await api.post("/rider/location", {
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          });
        } catch (err) {
          console.error("Failed to send location:", err);
        }
      });
    }, 10000);

    return () => clearInterval(tick);
  }, [profile?.isOnline]);

  const respondToOffer = async (accept: boolean) => {
    if (!offer) return;
    try {
      setRespondingToOffer(true);
      const path = accept ? "accept-offer" : "decline-offer";
      await api.post(`/order/${offer.orderId}/${path}`);
      if (accept) await fetchCurrentDelivery();  // don't depend on socket
    } catch (err) {
      console.error("Failed to respond to offer:", err);
    } finally {
      setRespondingToOffer(false);
      setOffer(null);
    }
  };

  if (pageLoading) return <Loading />;

  return (
    <Box sx={{ bgcolor: colors.ink, minHeight: "100vh", color: colors.paper }}>
      <Container maxWidth="sm" sx={{ py: 5 }}>
        <Typography
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 12,
            letterSpacing: 2,
            color: colors.route,
            mb: 1,
          }}
        >
          RIDER DASHBOARD
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: { xs: 26, md: 30 },
            letterSpacing: -0.5,
            mb: 0.5,
          }}
        >
          {profile ? `Welcome back, ${profile.name}` : "You're on the road"}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 13,
            color: colors.fog,
            mb: 4,
          }}
        >
          Go online when you're ready to ride
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!error && profile && (
          <>
            <Box
              sx={{
                bgcolor: colors.panel,
                border: "1px solid rgba(245,243,238,0.08)",
                borderRadius: 2,
                p: 3,
                mb: 3,
              }}
            >
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 0.5, alignItems: "center" }}
                  >
                    <CircleIcon
                      sx={{
                        fontSize: 10,
                        color: profile.isOnline ? colors.route : colors.fog,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 600,
                        fontSize: 17,
                      }}
                    >
                      {profile.isOnline ? "Online" : "Offline"}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: 13,
                      color: colors.fog,
                    }}
                  >
                    {profile.isOnline
                      ? "You're visible to nearby restaurants"
                      : "Go online to start receiving deliveries"}
                  </Typography>
                </Box>

                <Switch
                  checked={profile.isOnline}
                  onChange={onToggleOnline}
                  disabled={togglingOnline}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: colors.ember,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: colors.ember,
                    },
                  }}
                />
              </Stack>
            </Box>

            {currentDelivery && (
              <CurrentDeliveryCard
                delivery={currentDelivery}
                onAdvance={advanceDelivery}
                advancing={advancingDelivery}
              />
            )}

            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Box
                sx={{
                  flex: 1,
                  bgcolor: colors.panel,
                  border: "1px solid rgba(245,243,238,0.08)",
                  borderRadius: 2,
                  p: 2.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: 11,
                    color: colors.fog,
                    mb: 0.5,
                  }}
                >
                  DELIVERIES COMPLETED
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 600,
                    fontSize: 24,
                  }}
                >
                  {profile.ordersCompleted}
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                bgcolor: colors.panel,
                border: "1px solid rgba(245,243,238,0.08)",
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 11,
                  letterSpacing: 1.5,
                  color: colors.fog,
                  mb: 1.5,
                }}
              >
                VEHICLE
              </Typography>
              <Chip
                label={profile.vehicleType}
                size="small"
                sx={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 11,
                  bgcolor: "rgba(232,135,58,0.1)",
                  color: colors.ember,
                  mb: 1,
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 14,
                  color: colors.paper,
                }}
              >
                {profile.vehicleModelName}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 12,
                  color: colors.fog,
                  mt: 0.5,
                }}
              >
                {profile.numberPlate}
              </Typography>
            </Box>
          </>
        )}
      </Container>

      <DeliveryOfferModal
        offer={offer}
        onAccept={() => respondToOffer(true)}
        onDecline={() => respondToOffer(false)}
        responding={respondingToOffer}
      />
    </Box>
  );
};

export default RiderDashboard;
