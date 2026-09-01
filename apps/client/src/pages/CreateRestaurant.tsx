import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import RestaurantLocationPicker, {
  type LatLng,
} from "../components/RestaurantLocationPicker";
import React, { useRef, useState } from "react";
import { api } from "../lib/api";
import { ApiError } from "../lib/apiError";
import { useNavigate } from "react-router-dom";

const colors = {
  ink: "#14171C",
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
  route: "#4FD1C5",
};

export interface CreateRestaurantFormValues {
  name: string;
  description: string;
  keywords: string; // comma-separated, split into an array by your logic
  addressText: string;
  location: LatLng;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: colors.panel,
    color: colors.paper,
    "& fieldset": { borderColor: "rgba(245,243,238,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(245,243,238,0.3)" },
    "&.Mui-focused fieldset": { borderColor: colors.ember },
  },
  "& .MuiInputLabel-root": { color: colors.fog },
  "& .MuiInputLabel-root.Mui-focused": { color: colors.ember },
};

const CreateRestaurant = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<CreateRestaurantFormValues>({
    name: "",
    description: "",
    keywords: "",
    addressText: "",
    location: { lat: 31.454, lng: 74.367 },
    openTime: "",
    closeTime: "",
    isOpen: true,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const idempotencyKeyRef = useRef<string | null>(null);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    const key = idempotencyKeyRef.current;

    try {
      setErrorMessage("");
      setLoading(true);
      const { restaurant } = await api.post(
        "/restaurant/create",
        {
          name: values.name,
          description: values.description,
          isOpen: values.isOpen,
          keywords: values.keywords.split(","),
          address: {
            text: values.addressText,
            location: {
              type: "Point",
              coordinates: [values.location.lng, values.location.lat],
            },
          },
          operatingHours: { open: values.openTime, close: values.closeTime },
        },
        {
          headers: {
            "idempotency-key": key,
          },
        }
      );
      console.log(restaurant);
      idempotencyKeyRef.current = null; // clear before navigation
      navigate("/restaurant/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const onChange = <K extends keyof CreateRestaurantFormValues>(
    field: K,
    value: CreateRestaurantFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box
      sx={{
        bgcolor: colors.ink,
        minHeight: "100vh",
        color: colors.paper,
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Typography
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 12,
            letterSpacing: 2,
            color: colors.route,
            mb: 1,
          }}
        >
          SET UP YOUR KITCHEN
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: { xs: 28, md: 32 },
            letterSpacing: -0.5,
            mb: 4,
          }}
        >
          Create your restaurant
        </Typography>

        <Box component="form" onSubmit={submitHandler}>
          <TextField
            fullWidth
            label="Restaurant name"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            margin="normal"
            sx={fieldSx}
          />

          <TextField
            fullWidth
            label="Description"
            value={values.description}
            onChange={(e) => onChange("description", e.target.value)}
            margin="normal"
            multiline
            minRows={3}
            sx={fieldSx}
          />

          <TextField
            fullWidth
            label="Keywords"
            placeholder="karahi, handi, fast food"
            helperText="Separate with commas"
            value={values.keywords}
            onChange={(e) => onChange("keywords", e.target.value)}
            margin="normal"
            sx={{
              ...fieldSx,
              "& .MuiFormHelperText-root": { color: colors.fog },
            }}
          />

          <Divider sx={{ borderColor: "rgba(245,243,238,0.08)", my: 3 }} />

          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 11,
              letterSpacing: 1.5,
              color: colors.fog,
              mb: 1,
            }}
          >
            LOCATION
          </Typography>

          <TextField
            fullWidth
            label="Address"
            value={values.addressText}
            onChange={(e) => onChange("addressText", e.target.value)}
            margin="normal"
            sx={fieldSx}
          />

          <RestaurantLocationPicker
            value={values.location}
            onChange={(pos) => onChange("location", pos)}
          />

          <Divider sx={{ borderColor: "rgba(245,243,238,0.08)", my: 3 }} />

          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 11,
              letterSpacing: 1.5,
              color: colors.fog,
              mb: 1,
            }}
          >
            OPERATING HOURS
          </Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Opens at"
              type="time"
              value={values.openTime}
              onChange={(e) => onChange("openTime", e.target.value)}
              margin="normal"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldSx}
            />
            <TextField
              fullWidth
              label="Closes at"
              type="time"
              value={values.closeTime}
              onChange={(e) => onChange("closeTime", e.target.value)}
              margin="normal"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldSx}
            />
          </Stack>

          <FormControlLabel
            sx={{ mt: 1, color: colors.paper }}
            control={
              <Switch
                checked={values.isOpen}
                onChange={(e) => onChange("isOpen", e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: colors.ember,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    bgcolor: colors.ember,
                  },
                }}
              />
            }
            label="Open for orders right now"
          />

          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              bgcolor: colors.ember,
              textTransform: "none",
              fontWeight: 500,
              py: 1.2,
              "&:hover": { bgcolor: "#D67630" },
            }}
          >
            {loading ? "Creating..." : "Create restaurant"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateRestaurant;
