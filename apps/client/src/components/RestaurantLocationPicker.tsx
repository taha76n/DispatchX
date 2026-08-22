import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Typography } from "@mui/material";

// Leaflet's default marker icon paths break under most bundlers — point them
// at a CDN explicitly instead of relying on the broken default resolution.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const colors = {
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
};

export interface LatLng {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: LatLng;
  onChange: (pos: LatLng) => void;
}

const DEFAULT_CENTER: LatLng = { lat: 31.5204, lng: 74.3587 };

// MapContainer's `center` prop only applies once, on first mount — it won't
// re-center the map if `value` changes later (e.g. once geolocation resolves).
// This helper listens for that and calls the map's own imperative recenter.
const RecenterOnChange = ({ position }: { position: LatLng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position.lat, position.lng]);
  return null;
};

const ClickToMove = ({ onChange }: { onChange: (pos: LatLng) => void }) => {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const RestaurantLocationPicker = ({ value, onChange }: LocationPickerProps) => {
  const [hasTriedGeolocation, setHasTriedGeolocation] = useState(false);

  useEffect(() => {
    if (hasTriedGeolocation || !navigator.geolocation) return;
    setHasTriedGeolocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // permission denied, or unavailable — quietly keep the default center
      }
    );
  }, [hasTriedGeolocation, onChange]);

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 11,
          letterSpacing: 1.5,
          color: colors.fog,
          mb: 1,
        }}
      >
        DRAG THE PIN OR CLICK TO SET YOUR LOCATION
      </Typography>

      <Box
        sx={{
          height: 320,
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid rgba(245,243,238,0.15)",
        }}
      >
        <MapContainer center={DEFAULT_CENTER} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={value}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                onChange({ lat, lng });
              },
            }}
          />
          <ClickToMove onChange={onChange} />
          <RecenterOnChange position={value} />
        </MapContainer>
      </Box>

      <Typography
        sx={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 12,
          color: colors.fog,
          mt: 1,
        }}
      >
        {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
      </Typography>
    </Box>
  );
};

export default RestaurantLocationPicker;