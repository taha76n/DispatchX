import {
  Box,
  Stack,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Chip,
} from "@mui/material";

const colors = {
  ink: "#14171C",
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
  route: "#4FD1C5",
};
interface RestaurantCardProps {
  _id: string;
  name: string;
  description: string;
  isOpen: boolean;
  keywords: string[];
  navigateToRestaurantDetails: (_id: string) => void

}
const RestaurantCard = ({
  _id,
  name,
  description,
  isOpen,
  keywords,
  navigateToRestaurantDetails
}: RestaurantCardProps) => (
  <Card
    sx={{
      bgcolor: colors.panel,
      border: "1px solid rgba(245,243,238,0.08)",
      borderRadius: 2,
      boxShadow: "none",
    }}
  >
    <CardActionArea onClick={() => navigateToRestaurantDetails(_id)} sx={{ height: "100%" }}>
      <Box
        sx={{
          height: 140,
          bgcolor: "rgba(245,243,238,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 12,
            letterSpacing: 1.5,
            color: colors.fog,
          }}
        >
          IMAGE
        </Typography>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          justifycontent="space-between"
          alignitems="flex-start"
          sx={{ mb: 1 }}
        >
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              fontSize: 17,
              color: colors.paper,
            }}
          >
            {name}
          </Typography>
          <Chip
            label={isOpen ? "OPEN" : "CLOSED"}
            size="small"
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 10,
              letterSpacing: 1,
              height: 20,
              borderRadius: 1,
              bgcolor: isOpen
                ? "rgba(79,209,197,0.12)"
                : "rgba(138,143,152,0.12)",
              color: isOpen ? colors.route : colors.fog,
            }}
          />
        </Stack>

        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 13.5,
            color: colors.fog,
            mb: 2,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>

        <Stack direction="row" spacing={1} flexwrap="wrap" useFlexGap>
          {keywords.map((k) => (
            <Typography
              key={k}
              sx={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 11,
                color: colors.ember,
                bgcolor: "rgba(232,135,58,0.08)",
                px: 1,
                py: 0.4,
                borderRadius: 1,
                textTransform: "capitalize",
              }}
            >
              {k}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
);

export default RestaurantCard;
