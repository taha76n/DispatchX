import { CircularProgress, Container, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthData } from "../context/AuthContext";
import type { PublicUser, Role } from "@dispatchx/shared";
import { ApiError } from "../lib/apiError";

const ROLE_HOME_PATH: Record<Role, string> = {
  customer: "/restaurants",
  restaurant: "/dashboard/restaurant",
  rider: "/rider",
};

type VerifyStatus = "verifying" | "success" | "error";

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { setUser } = useAuthData();

  const [status, setStatus] = useState<VerifyStatus>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Verification link is missing a token.");
      return;
    }

    const verify = async () => {
      try {
        const { user } = await api.get<{
          success: boolean;
          message: string;
          user: PublicUser;
        }>(`/auth/verify-email/${token}`);

        setUser(user);
        setStatus("success");

        const destination = ROLE_HOME_PATH[user.role];

        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 1500);
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Something went wrong while verifying your email.");
        }
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return (
    <Container maxWidth="xs">
      <Stack
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        {status === "verifying" && (
          <>
            <CircularProgress />
            <Typography variant="h6">Verifying your email...</Typography>
          </>
        )}

        {status === "success" && (
          <>
            <Typography variant="h5" color="success.main">
              Email verified!
            </Typography>
            <Typography variant="body2">Redirecting you now...</Typography>
          </>
        )}

        {status === "error" && (
          <>
            <Typography variant="h5" color="error.main">
              Verification failed
            </Typography>
            <Typography variant="body2">{errorMessage}</Typography>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default VerifyEmail;