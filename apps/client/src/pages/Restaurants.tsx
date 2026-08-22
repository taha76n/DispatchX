import { Box, Container, Typography, InputBase, Alert } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestaurantCard from "../components/RestaurantCard";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { ApiError } from "../lib/apiError";
import Loading from "../components/Loading";
import type { RestaurantDetails } from "@dispatchx/shared";
import { useNavigate } from "react-router-dom";

const colors = {
  ink: "#14171C",
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
  route: "#4FD1C5",
};

const Restaurants = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<RestaurantDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const navigateToRestaurantDetails = (id: string) => {
    navigate(`/restaurant/${id}`);
  };

  const fetchAllRestaurants = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const { restaurants } = await api.get<{
        success: boolean;
        message: string;
        restaurants: RestaurantDetails[];
      }>("/restaurant/all");
      setRestaurants(restaurants);
      setLoading(false);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went Wwrong. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRestaurants();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Box sx={{ bgcolor: colors.ink, minHeight: "100vh", color: colors.paper }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 12,
            letterSpacing: 2,
            color: colors.route,
            mb: 1,
          }}
        >
          BROWSE
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: { xs: 28, md: 36 },
            letterSpacing: -0.5,
            mb: 3,
          }}
        >
          Restaurants near you
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: colors.panel,
            border: "1px solid rgba(245,243,238,0.08)",
            borderRadius: 2,
            px: 2,
            py: 1,
            mb: 4,
            maxWidth: 420,
          }}
        >
          <SearchIcon sx={{ color: colors.fog, fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Search restaurants or cuisines"
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 14,
              color: colors.paper,
              width: "100%",
              "& ::placeholder": { color: colors.fog, opacity: 1 },
            }}
          />
        </Box>

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {restaurants.map((r) => (
            <RestaurantCard
              key={r._id}
              _id={r._id}
              name={r.name}
              description={r.description}
              isOpen={r.isOpen}
              keywords={r.keywords}
              navigateToRestaurantDetails={navigateToRestaurantDetails}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Restaurants;
