import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Box } from "@mui/material";
import "leaflet/dist/leaflet.css";

interface LatLng {
  lat: number;
  lng: number;
}

interface RiderDestinationMapProps {
  destination: LatLng; // restaurant (pickup) or delivery address, depending on status
}

const RecenterOnMove = ({ position }: { position: LatLng }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(position);
  }, [position.lat, position.lng]);
  return null;
};

const RiderDestinationMap = ({ destination }: RiderDestinationMapProps) => {
  const [selfPosition, setSelfPosition] = useState<LatLng | null>(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setSelfPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const center = selfPosition ?? destination;

  return (
    <Box sx={{ height: 240, borderRadius: 2, overflow: "hidden", mb: 2 }}>
      <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {selfPosition && (
          <>
            <Marker position={selfPosition} />
            <RecenterOnMove position={selfPosition} />
          </>
        )}
        <Marker position={destination} />
      </MapContainer>
    </Box>
  );
};

export default RiderDestinationMap;