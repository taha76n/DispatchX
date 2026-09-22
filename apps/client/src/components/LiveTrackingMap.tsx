import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Box, Typography } from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRiderLocationTracking } from "../hooks/useRiderLocationTracking";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const colors = {
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  route: "#4FD1C5",
};

interface LiveTrackingMapProps {
  orderId: string;
  active: boolean; // true only when status is rider_assigned / out_for_delivery
}

const InvalidateSizeOnMount = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
};

const LiveTrackingMap = ({ orderId, active }: LiveTrackingMapProps) => {
  const position = useRiderLocationTracking(orderId, active);
  // Smooths rapid successive updates so the map doesn't feel like it's
  // fighting itself if pings arrive close together.
  // const deferredPosition = useDeferredValue(position);
  const deferredPosition = position; // bypass entirely, for testing

  if (!active) return null;

  console.log("LiveTrackingMap render", { active, position, deferredPosition });

  if (!deferredPosition) {
    return (
      <Box sx={{ bgcolor: colors.panel, borderRadius: 2, p: 2, mb: 2 }}>
        <Typography
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 12,
            color: colors.fog,
          }}
        >
          Waiting for rider location...
        </Typography>
      </Box>
    );
  }

  const center: [number, number] = [
    deferredPosition.latitude,
    deferredPosition.longitude,
  ];

  return (
    <Box
      sx={{
        height: 220,
        width: "100%",
        flexGrow: 1,
        borderRadius: 2,
        overflow: "hidden",
        mb: 2,
      }}
    >
      {" "}
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center} />
        <InvalidateSizeOnMount />
      </MapContainer>
    </Box>
  );
};

export default LiveTrackingMap;
