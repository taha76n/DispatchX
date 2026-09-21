import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme.ts";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { SelectedRestaurantProvider } from "./context/SelectedRestaurantContext.tsx";
import { SocketProvider } from "./context/SocketContext.tsx";
import { NotificationProvider } from "./context/NotificationContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <SelectedRestaurantProvider>
                <App />
              </SelectedRestaurantProvider>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
