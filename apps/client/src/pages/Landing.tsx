import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";

const dashMove = keyframes`
  to { stroke-dashoffset: -24; }
`;

const colors = {
  ink: "#14171C",
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
  route: "#4FD1C5",
};

const roles = [
  {
    label: "Customer",
    copy: "Browse nearby kitchens and watch your order move from stove to doorstep.",
  },
  {
    label: "Restaurant",
    copy: "Take orders the moment they land, no refreshing, no missed tickets.",
  },
  {
    label: "Rider",
    copy: "Get offered nearby deliveries and go live the second you accept.",
  },
];

const RouteTicket = () => (
  <Box
    sx={{
      bgcolor: colors.panel,
      border: "1px solid rgba(245,243,238,0.08)",
      borderRadius: 2,
      p: 3,
      width: "100%",
      maxWidth: 380,
    }}
  >
    <Typography
      sx={{
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 12,
        letterSpacing: 1.5,
        color: colors.route,
        mb: 2,
      }}
    >
      LIVE · ORDER #4821
    </Typography>

    {/* SVG with improved animation */}
    <Box
      component="svg"
      viewBox="0 0 320 80"
      sx={{ width: "100%", height: "auto" }}
    >
      {/* Base path */}
      <path
        d="M20,60 C 100,60 100,20 160,20 C 220,20 220,60 300,60"
        fill="none"
        stroke="rgba(245,243,238,0.15)"
        strokeWidth={2}
      />
      {/* Animated dashed path */}
      <path
        d="M20,60 C 100,60 100,20 160,20 C 220,20 220,60 300,60"
        fill="none"
        stroke={colors.route}
        strokeWidth={2}
        strokeDasharray="6 6"
        sx={{ animation: `${dashMove} 1.2s linear infinite` }}
      />
      {/* Kitchen dot */}
      <circle cx={20} cy={60} r={5} fill={colors.ember} />
      {/* Doorstep dot */}
      <circle cx={300} cy={60} r={5} fill={colors.paper} />
      {/* Main moving dot */}
      <circle r={4} fill={colors.route}>
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path="M20,60 C 100,60 100,20 160,20 C 220,20 220,60 300,60"
        />
      </circle>
      {/* Trailing dot (delay for trailing effect) */}
      <circle r={2.5} fill={colors.route} opacity={0.6}>
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          begin="-0.3s"
          path="M20,60 C 100,60 100,20 160,20 C 220,20 220,60 300,60"
        />
      </circle>
    </Box>

    <Stack direction="row" sx={{ mt: 1, justifyContent: "space-between" }}>
      <Typography
        sx={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 11,
          color: colors.fog,
        }}
      >
        KITCHEN
      </Typography>
      <Typography
        sx={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 11,
          color: colors.fog,
        }}
      >
        DOORSTEP
      </Typography>
    </Stack>
  </Box>
);

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: colors.ink, minHeight: "100vh", color: colors.paper }}>
      <Container maxWidth="lg">
        <Stack
          sx={{
            py: 3,
            direction: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: -0.5,
            }}
          >
            DispatchX
          </Typography>
          {/* Increased spacing between header buttons */}
          <Stack direction="row" spacing={2}></Stack>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={6}

          sx={{ py: { xs: 6, md: 12 }, alignItems: "center" }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 13,
                letterSpacing: 2,
                color: colors.route,
                mb: 2,
              }}
            >
              LIVE DELIVERY TRACKING
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 600,
                fontSize: { xs: 40, md: 56 },
                lineHeight: 1.05,
                letterSpacing: -1,
                mb: 3,
              }}
            >
              Every order,
              <br />
              dispatched in real time.
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 17,
                color: colors.fog,
                maxWidth: 420,
                mb: 4,
              }}
            >
              DispatchX connects customers, restaurants, and riders on one live
              system — no polling, no guessing where an order is.
            </Typography>
            {/* Increased spacing between hero buttons */}
            <Stack direction="row" spacing={2}>
              <Button
                onClick={() => navigate("/register")}
                variant="contained"
                size="large"
                sx={{
                  bgcolor: colors.ember,
                  textTransform: "none",
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 500,
                  px: 3,
                  "&:hover": { bgcolor: "#D67630" },
                }}
              >
                Create account
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outlined"
                size="large"
                sx={{
                  color: colors.paper,
                  borderColor: "rgba(245,243,238,0.25)",
                  textTransform: "none",
                  fontFamily: '"Inter", sans-serif',
                  px: 3,
                  "&:hover": { borderColor: colors.paper },
                }}
              >
                Log in
              </Button>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <RouteTicket />
          </Box>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{ pb: { xs: 6, md: 10 } }}
        >
          {roles.map((role) => (
            <Box
              key={role.label}
              sx={{
                flex: 1,
                bgcolor: colors.panel,
                border: "1px solid rgba(245,243,238,0.08)",
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 12,
                  letterSpacing: 1.5,
                  color: colors.ember,
                  mb: 1.5,
                }}
              >
                {role.label.toUpperCase()}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 15,
                  color: colors.fog,
                  lineHeight: 1.6,
                }}
              >
                {role.copy}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Stack
          sx={{
            py: 4,
            borderTop: "1px solid rgba(245,243,238,0.08)",
            direction: "row",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 13,
              color: colors.fog,
            }}
          >
            © {new Date().getFullYear()} DispatchX
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Landing;
