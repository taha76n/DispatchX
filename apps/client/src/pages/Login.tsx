import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import Stack from "@mui/material/Stack";
import React, { useState } from "react";
import { api } from "../lib/api";
import type { PublicUser, Role } from "@dispatchx/shared";
import { useAuthData } from "../context/AuthContext";
import { ApiError } from "../lib/apiError";
import { useNavigate } from "react-router-dom";

const ROLE_HOME_PATH: Record<Role, string> = {
  customer: "/restaurants",
  restaurant: "/restaurant/create",
  rider: "/dashboard/rider"
}

const Login = () => {
  const navigate = useNavigate();

  const { setUser } = useAuthData();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const submitHandler = async (e: React.FormEvent) => {
    setErrorMessage("");
    e.preventDefault();

    try {
      setLoading(true);
      const { message, user } = await api.post<{
        success: boolean;
        message: string;
        user: PublicUser;
      }>("/auth/login", {
        email: email,
        password: password,
      });
      setUser(user);
      setLoading(false);

      const destination = ROLE_HOME_PATH[user.role]

      navigate(destination, {
        state: { infoMessage: message },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went Wwrong. Please try again");
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Container maxWidth="xs">
        <Stack
          sx={{
            mt: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">Sign In</Typography>
          <Box component={"form"} onSubmit={submitHandler}>
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></TextField>
            <TextField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              fullWidth
              label="Password"
              type="Password"
            ></TextField>

            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
          </Box>
        </Stack>
      </Container>
    </div>
  );
};

export default Login;
