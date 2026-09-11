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
import { useAuthData } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { ApiError } from "../lib/apiError";

const colors = {
  ink: "#14171C",
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
  route: "#4FD1C5",
};

export interface RiderProfileData {
  vehicleType: "Car" | "Motorbike";
  numberPlate: string;
  vehicleModelName: string;
  isOnline: boolean;
  ordersCompleted: number;
}

const RiderDashboard = () => {
  const { loading } = useAuthData();

  const [profile, setProfile] = useState<RiderProfileData | null>(null);
  const [error, setError] = useState<string>("");
  const [togglingOnline, setTogglingOnline] = useState<boolean>(false);
  // const [lastLocationSentAt, setLastLocationSentAt] = useState<string | null>(
  //   null
  // );
  // const [locationError, setLocationError] = useState<string>("");

  useEffect(() => {
    fetchRider();
  }, []);

  const onToggleOnline = async () => {
    try {
      setError("");
      const {newStatus} = await api.patch("/rider/status");
      setTogglingOnline(!togglingOnline);
      setProfile((prev)=> (prev? {...prev, isOnline: newStatus}: prev))
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Something Went Wrong");
      }
    }finally{
      setTogglingOnline(false)
    }
  };

  const fetchRider = async () => {
    try {
      setError("");
      const { riderProfile } = await api.get("/rider/profile");
      console.log(riderProfile);
      
      setProfile(riderProfile);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Something Went Wrong");
      }
    }
  };

  useEffect(() => {
    if (!profile?.isOnline) {
      return;
    }

    const timeInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await api.post("rider/location", {
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          });
        } catch (error) {
          console.error("Failed to send location:", error);
        }
      });
    }, 10000);

    return () => {
      clearInterval(timeInterval);
    };
  }, [profile?.isOnline]);

  if (loading) return <Loading />;

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
            mb: 4,
          }}
        >
          You're on the road
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
                sx={{
                  direction: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Stack
                    spacing={1}
                    sx={{ mb: 0.5, alignItems: "center", direction: "row" }}
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

              {profile.isOnline && (
                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: "1px solid rgba(245,243,238,0.08)",
                  }}
                >
                  {/* {locationError ? (
                    <Typography
                      sx={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: 12,
                        color: "#E5484D",
                      }}
                    >
                      {locationError}
                    </Typography> */}
                  {/* ) : (
                    <Typography
                      sx={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: 12,
                        color: colors.fog,
                      }}
                    >
                      {lastLocationSentAt
                        ? `Location last sent at ${lastLocationSentAt}`
                        : "Sending your location..."}
                    </Typography>
                  )} */}
                </Box>
              )}
            </Box>

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
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip
                  label={profile.vehicleType}
                  size="small"
                  sx={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: 11,
                    bgcolor: "rgba(232,135,58,0.1)",
                    color: colors.ember,
                  }}
                />
              </Stack>
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
    </Box>
  );
};

export default RiderDashboard;
