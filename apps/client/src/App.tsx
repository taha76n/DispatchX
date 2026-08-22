import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./lib/ProtectedRoute";
import RiderDashboard from "./pages/RiderDashboard";
import Landing from "./pages/Landing";
// import RestaurantDashboard from "./pages/RestaurantDashboard";
import Restaurants from "./pages/Restaurants";
import RestaurantDetails from "./pages/RestaurantDetails";
import CreateRestaurant from "./pages/CreateRestaurant";

const App = () => {
  return (
    <>
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
        {/* <Route
          path="/dashboard/restaurant"
          element={
            <ProtectedRoute allowedRoles={["restaurant"]}>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        /> */}
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
          path="/restaurant/create"
          element={
            <ProtectedRoute allowedRoles={["restaurant"]}>
              <CreateRestaurant />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
