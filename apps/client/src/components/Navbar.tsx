import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuthData } from "../context/AuthContext";
import { useSelectedRestaurantData } from "../context/SelectedRestaurantContext";
import { api } from "../lib/api";

const colors = {
  ink: "#14171C",
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
};

const Navbar = () => {
  const { user, setUser } = useAuthData();
  const { selectedRestaurantId } = useSelectedRestaurantData();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.log(error);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AppBar
      position="static"
      sx={{ bgcolor: colors.panel, boxShadow: "none", borderBottom: "1px solid rgba(245,243,238,0.08)" }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          component={Link}
          to="/"
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            fontSize: 18,
            color: colors.paper,
            textDecoration: "none",
          }}
        >
          DispatchX
        </Typography>

        <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
          {!user && (
            <>
              <Button component={Link} to="/login" sx={{ color: colors.paper, textTransform: "none" }}>
                Log in
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                sx={{ bgcolor: colors.ember, textTransform: "none", "&:hover": { bgcolor: "#D67630" } }}
              >
                Register
              </Button>
            </>
          )}

          {user?.role === "customer" && (
            <>
              <Button component={Link} to="/restaurants" sx={{ color: colors.paper, textTransform: "none" }}>
                Restaurants
              </Button>
              <Button component={Link} to="/customer/orders" sx={{ color: colors.paper, textTransform: "none" }}>
                My Orders
              </Button>
              <Button onClick={handleLogout} sx={{ color: colors.fog, textTransform: "none" }}>
                Logout
              </Button>
            </>
          )}

          {user?.role === "restaurant" && (
            <>
              <Button
                component={Link}
                to="/restaurant/dashboard"
                sx={{ color: colors.paper, textTransform: "none" }}
              >
                Dashboard
              </Button>
              {selectedRestaurantId? (
                <Button
                  component={Link}
                  to={`/restaurant/${selectedRestaurantId}/orders`}
                  sx={{ color: colors.paper, textTransform: "none" }}
                >
                  Orders
                </Button>
              ): (
                <Button
                  component={Link}
                  to={`/customer/orders`}
                  sx={{ color: colors.paper, textTransform: "none" }}
                >
                  Orders
                </Button>
              ) }
              <Button onClick={handleLogout} sx={{ color: colors.fog, textTransform: "none" }}>
                Logout
              </Button>
            </>
          )}

          {user?.role === "rider" && (
            <Button onClick={handleLogout} sx={{ color: colors.fog, textTransform: "none" }}>
              Logout
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

export const NAVBAR_ROOT_BOX_SX = { bgcolor: colors.ink, minHeight: "100vh", color: colors.paper };