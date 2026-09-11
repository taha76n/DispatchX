import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import { ApiError } from "../lib/apiError";
import { api } from "../lib/api";

const colors = {
  ink: "#14171C",
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
  route: "#4FD1C5",
};

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

export interface CreateRiderProfileFormValues {
  vehicleType: "Car" | "Motorbike" | "";
  numberPlate: string;
  vehicleModelName: string;
}

const CreateRiderProfile = () => {
  const [values, setValues] = useState<CreateRiderProfileFormValues>({
    vehicleType: "",
    numberPlate: "",
    vehicleModelName: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const onChange = <K extends keyof CreateRiderProfileFormValues>(
    field: K,
    value: CreateRiderProfileFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const { riderProfile } = await api.post("/rider/create", {
        vehicleInfo: values,
      });
      console.log(riderProfile);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Something Went Wrong");
      }
    } finally {
      setLoading(false);
    }
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
          ONE LAST STEP
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: { xs: 28, md: 32 },
            letterSpacing: -0.5,
            mb: 1,
          }}
        >
          Set up your rider profile
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 14,
            color: colors.fog,
            mb: 4,
          }}
        >
          Tell us what you're riding — you'll need this before you can go
          online.
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
          <TextField
            fullWidth
            select
            label="Vehicle type"
            value={values.vehicleType}
            onChange={(e) =>
              onChange("vehicleType", e.target.value as "Car" | "Motorbike")
            }
            margin="normal"
            sx={fieldSx}
          >
            <MenuItem value="Motorbike">Motorbike</MenuItem>
            <MenuItem value="Car">Car</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Number plate"
            placeholder="e.g. LEA-1234"
            value={values.numberPlate}
            onChange={(e) => onChange("numberPlate", e.target.value)}
            margin="normal"
            sx={fieldSx}
          />

          <TextField
            fullWidth
            label="Vehicle model"
            placeholder="e.g. Honda CD 70"
            value={values.vehicleModelName}
            onChange={(e) => onChange("vehicleModelName", e.target.value)}
            margin="normal"
            sx={fieldSx}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
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
            {loading ? "Saving..." : "Complete profile"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateRiderProfile;
