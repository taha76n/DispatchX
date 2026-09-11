import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./lib/ProtectedRoute";
import RiderDashboard from "./pages/RiderDashboard";
import Landing from "./pages/Landing";
import Restaurants from "./pages/Restaurants";
import RestaurantDetails from "./pages/RestaurantDetails";
import CreateRestaurant from "./pages/CreateRestaurant";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import MyOrders from "./pages/MyOrders";
import RestaurantOrders from "./pages/RestaurantOrders";
import Navbar from "./components/Navbar";
import CreateRiderProfile from "./pages/CreateRiderProfile";

const App = () => {
  return (
    <>
    <Navbar/>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route
          path="/restaurants"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Restaurants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/dashboard"
          element={
            <ProtectedRoute allowedRoles={["restaurant"]}>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/rider"
          element={
            <ProtectedRoute allowedRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/:restaurantId"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <RestaurantDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/:restaurantId/orders"
          element={
            <ProtectedRoute allowedRoles={["restaurant"]}>
              <RestaurantOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/create"
          element={
            <ProtectedRoute allowedRoles={["restaurant"]}>
              <CreateRestaurant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rider/create"
          element={
            <ProtectedRoute allowedRoles={["rider"]}>
              <CreateRiderProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rider/dashboard"
          element={
            <ProtectedRoute allowedRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
