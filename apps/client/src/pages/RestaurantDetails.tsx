import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

interface RestaurantDetailData {
  _id: string;
  name: string;
  description: string;
  isOpen: boolean;
  keywords: string[];
  address: { text: string };
  operatingHours: { open: string; close: string };
}

interface MenuItemData {
  _id: string;
  itemName: string;
  itemPrice: number;
  itemDescription: string;
  isAvailable: boolean;
}

type CartState = Record<string, number>;

const formatPrice = (paisa: number) => `Rs. ${(paisa).toFixed(2)}`;

const RestaurantDetail = () => {
  const params = useParams();
  const navigate = useNavigate();

  const restaurantId = params.restaurantId;

  console.log(restaurantId);

  const [restaurant, setRestaurant] = useState<RestaurantDetailData>();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [cart, setCart] = useState<CartState>({});
  const [orderError, setOrderError] = useState<string>("");
  const [placingOrder, setPlacingOrder] = useState<boolean>(false)
  const [order, setOrder] = useState()

  const onIncrement = (menuItemId: string) => {
    setCart((prev) => ({ ...prev, [menuItemId]: (prev[menuItemId] ?? 0) + 1 }));
  };

  const onDecrement = (menuItemId: string) => {
    setCart((prev) => ({
      ...prev,
      [menuItemId]: Math.max(0, (prev[menuItemId] ?? 0) - 1),
    }));
  };

  const onBack = () => {
    navigate("/restaurants");
  };

  const onPlaceOrder = async () => {
    try {
      setOrderError("");
      setPlacingOrder(true);
      const items = Object.entries(cart).map((item) => ({menuItemId: item[0] , quantity: item[1]}))
      const { order } = await api.post("/order/create", { restaurantId, items });
      setOrder(order)
      setPlacingOrder(false)
    } catch (error) {
      if (error instanceof ApiError) {
        setOrderError(error.message);
      } else {
        setOrderError("Something Went Wrong");
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  const fetchRestaurantById = async () => {
    try {
      setErrorMessage("");
      setLoading(true);

      const { restaurant } = await api.get(`/restaurant/${restaurantId}`);
      const { menuItems } = await api.get(`/menu/${restaurantId}`);

      setRestaurant(restaurant);
      setMenuItems(menuItems);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something Went Wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantById();
  }, [restaurantId]);

  if (loading) return <Loading />;

  if (errorMessage) {
    return (
      <Box sx={{ bgcolor: colors.ink, minHeight: "100vh", py: 6 }}>
        <Container maxWidth="md">
          <Alert severity="error">{errorMessage}</Alert>
        </Container>
      </Box>
    );
  }

  if (!restaurant) return null;

  const cartLines = menuItems
    .filter((item) => (cart[item._id] ?? 0) > 0)
    .map((item) => ({ item, quantity: cart[item._id] }));

  const total = cartLines.reduce(
    (sum, line) => sum + line.item.itemPrice * line.quantity,
    0
  );

  return (
    <Box
      sx={{
        bgcolor: colors.ink,
        minHeight: "100vh",
        color: colors.paper,
        pb: 12,
      }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{ color: colors.fog, textTransform: "none", mb: 3, pl: 0 }}
        >
          Back to restaurants
        </Button>

        <Stack
          sx={{
            mb: 1,
            direction: "row",
            justifycontent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              fontSize: { xs: 28, md: 34 },
              letterSpacing: -0.5,
            }}
          >
            {restaurant.name}
          </Typography>
          <Chip
            label={restaurant.isOpen ? "OPEN" : "CLOSED"}
            size="small"
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 10,
              letterSpacing: 1,
              bgcolor: restaurant.isOpen
                ? "rgba(79,209,197,0.12)"
                : "rgba(138,143,152,0.12)",
              color: restaurant.isOpen ? colors.route : colors.fog,
            }}
          />
        </Stack>

        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 14,
            color: colors.fog,
            mb: 1.5,
          }}
        >
          {restaurant.description}
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 12,
              color: colors.fog,
            }}
          >
            {restaurant.address.text}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 12,
              color: colors.fog,
            }}
          >
            {restaurant.operatingHours.open} – {restaurant.operatingHours.close}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ mb: 4, flexWrap: "wrap" }}
        >
          {restaurant.keywords.map((k) => (
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

        <Divider sx={{ borderColor: "rgba(245,243,238,0.08)", mb: 3 }} />

        <Typography
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 12,
            letterSpacing: 2,
            color: colors.route,
            mb: 2,
          }}
        >
          MENU
        </Typography>

        <Stack spacing={1.5}>
          {menuItems.map((item) => {
            const quantity = cart[item._id] ?? 0;

            return (
              <Box
                key={item._id}
                sx={{
                  bgcolor: colors.panel,
                  border: "1px solid rgba(245,243,238,0.08)",
                  borderRadius: 2,
                  p: 2.5,
                  opacity: item.isAvailable ? 1 : 0.5,
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ pr: 2 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mb: 0.5, alignItems: "center" }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        {item.itemName}
                      </Typography>
                      {!item.isAvailable && (
                        <Chip
                          label="Unavailable"
                          size="small"
                          sx={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontSize: 10,
                            height: 20,
                            bgcolor: "rgba(138,143,152,0.12)",
                            color: colors.fog,
                          }}
                        />
                      )}
                    </Stack>
                    <Typography
                      sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: 13,
                        color: colors.fog,
                        mb: 1,
                      }}
                    >
                      {item.itemDescription}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: 14,
                        color: colors.paper,
                      }}
                    >
                      {formatPrice(item.itemPrice)}
                    </Typography>
                  </Box>

                  {quantity === 0 ? (
                    <Button
                      onClick={() => onIncrement(item._id)}
                      disabled={!item.isAvailable}
                      variant="outlined"
                      size="small"
                      sx={{
                        color: colors.ember,
                        borderColor: "rgba(232,135,58,0.4)",
                        textTransform: "none",
                        flexShrink: 0,
                        "&:hover": { borderColor: colors.ember },
                      }}
                    >
                      Add
                    </Button>
                  ) : (
                    <Stack
                      spacing={1}
                      sx={{
                        flexShrink: 0,
                        direction: "row",
                        alignItems: "center",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => onDecrement(item._id)}
                        sx={{
                          color: colors.paper,
                          border: "1px solid rgba(245,243,238,0.15)",
                        }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        sx={{
                          fontFamily: '"IBM Plex Mono", monospace',
                          width: 20,
                          textAlign: "center",
                        }}
                      >
                        {quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => onIncrement(item._id)}
                        sx={{
                          color: colors.paper,
                          border: "1px solid rgba(245,243,238,0.15)",
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Container>

      {cartLines.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: colors.panel,
            borderTop: "1px solid rgba(245,243,238,0.08)",
            py: 2,
          }}
        >
          <Container maxWidth="md">
            {orderError && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {orderError}
              </Alert>
            )}
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: 12,
                    color: colors.fog,
                  }}
                >
                  {cartLines.length} item{cartLines.length > 1 ? "s" : ""}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 600,
                    fontSize: 18,
                  }}
                >
                  {formatPrice(total)}
                </Typography>
              </Box>
              <Button
                onClick={onPlaceOrder}
                disabled={placingOrder}
                variant="contained"
                sx={{
                  bgcolor: colors.ember,
                  textTransform: "none",
                  fontWeight: 500,
                  px: 4,
                  "&:hover": { bgcolor: "#D67630" },
                }}
              >
                {placingOrder ? "Placing order..." : "Place order"}
              </Button>
            </Stack>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default RestaurantDetail;
