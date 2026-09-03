import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem as MuiMenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LatLng } from "../components/RestaurantLocationPicker";
import { api } from "../lib/api";
import { ApiError } from "../lib/apiError";
import { useSelectedRestaurantData } from "../context/SelectedRestaurantContext";

const colors = {
  ink: "#14171C",
  panel: "#1C2129",
  paper: "#F5F3EE",
  fog: "#8A8F98",
  ember: "#E8873A",
  route: "#4FD1C5",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: colors.ink,
    color: colors.paper,
    "& fieldset": { borderColor: "rgba(245,243,238,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(245,243,238,0.3)" },
    "&.Mui-focused fieldset": { borderColor: colors.ember },
  },
  "& .MuiInputLabel-root": { color: colors.fog },
  "& .MuiInputLabel-root.Mui-focused": { color: colors.ember },
};

export interface MenuItemData {
  _id: string;
  itemName: string;
  itemPrice: number;
  itemDescription: string;
  isAvailable: boolean;
}

export interface EditRestaurantFormValues {
  name: string;
  description: string;
  keywords: string;
  addressText: string;
  location: LatLng;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

interface MenuItemFormValues {
  itemName: string;
  itemPrice: string; // rupees, as typed — converted to paisa on submit
  itemDescription: string;
  tags: string; // comma-separated
}

const EMPTY_MENU_FORM: MenuItemFormValues = {
  itemName: "",
  itemPrice: "",
  itemDescription: "",
  tags: "",
};

const formatPrice = (paisa: number) => `Rs. ${(paisa / 100).toFixed(2)}`;

const RestaurantDashboard = () => {
  const { restaurants, selectedRestaurantId, setSelectedRestaurantId, loading: loadingRestaurants } =
    useSelectedRestaurantData();
  const navigate = useNavigate();

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState("");

  const [details, setDetails] = useState<EditRestaurantFormValues>({
    name: "",
    description: "",
    keywords: "",
    addressText: "",
    location: { lat: 31.454, lng: 74.367 },
    openTime: "",
    closeTime: "",
    isOpen: true,
  });

  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState<MenuItemFormValues>(EMPTY_MENU_FORM);
  const [savingMenuItem, setSavingMenuItem] = useState(false);
  const [menuFormError, setMenuFormError] = useState("");

  const fetchDetails = async () => {
    if (!selectedRestaurantId) return;
    try {
      setDetailsError("");
      setLoadingDetails(true);
      const { restaurant } = await api.get(`/restaurant/${selectedRestaurantId}`);
      setDetails({
        name: restaurant.name,
        description: restaurant.description,
        keywords: restaurant.keywords.join(", "),
        addressText: restaurant.address.text,
        location: {
          lat: restaurant.address.location.coordinates[1],
          lng: restaurant.address.location.coordinates[0],
        },
        openTime: restaurant.operatingHours.open,
        closeTime: restaurant.operatingHours.close,
        isOpen: restaurant.isOpen,
      });
    } catch (error) {
      setDetailsError(error instanceof ApiError ? error.message : "Something went wrong");
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchMenuItems = async () => {
    if (!selectedRestaurantId) return;
    try {
      setMenuError("");
      setLoadingMenu(true);
      const { menuItems } = await api.get(`/menu/${selectedRestaurantId}`);
      setMenuItems(menuItems);
    } catch (error) {
      setMenuError(error instanceof ApiError ? error.message : "Something went wrong");
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchMenuItems();
    setIsEditing(false);
  }, [selectedRestaurantId]);

  const onSelectRestaurant = (id: string) => {
    setSelectedRestaurantId(id);
  };

  const onCreateNewRestaurant = () => {
    navigate("/restaurant/create");
  };

  const onToggleEdit = () => {
    setIsEditing(true);
  };

  const onChange = <K extends keyof EditRestaurantFormValues>(
    field: K,
    value: EditRestaurantFormValues[K]
  ) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const onSaveDetails = async () => {
    if (!selectedRestaurantId) return;
    try {
      setDetailsError("");
      setSavingDetails(true);
      const { restaurant } = await api.post(`/restaurant/update`, {
        restaurantId: selectedRestaurantId,
        name: details.name,
        description: details.description,
        isOpen: details.isOpen,
        keywords: details.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        address: {
          text: details.addressText,
          location: {
            type: "Point",
            coordinates: [details.location.lng, details.location.lat],
          },
        },
        operatingHours: { open: details.openTime, close: details.closeTime },
      });
      setDetails({
        name: restaurant.name,
        description: restaurant.description,
        keywords: restaurant.keywords.join(", "),
        addressText: restaurant.address.text,
        location: {
          lat: restaurant.address.location.coordinates[1],
          lng: restaurant.address.location.coordinates[0],
        },
        openTime: restaurant.operatingHours.open,
        closeTime: restaurant.operatingHours.close,
        isOpen: restaurant.isOpen,
      });
      setIsEditing(false);
    } catch (error) {
      setDetailsError(error instanceof ApiError ? error.message : "Something went wrong");
    } finally {
      setSavingDetails(false);
    }
  };

  const openAddMenuItem = () => {
    setEditingMenuItemId(null);
    setMenuForm(EMPTY_MENU_FORM);
    setMenuFormError("");
    setMenuDialogOpen(true);
  };

  const openEditMenuItem = (id: string) => {
    const item = menuItems.find((m) => m._id === id);
    if (!item) return;
    setEditingMenuItemId(id);
    setMenuForm({
      itemName: item.itemName,
      itemPrice: (item.itemPrice / 100).toString(),
      itemDescription: item.itemDescription,
      tags: "",
    });
    setMenuFormError("");
    setMenuDialogOpen(true);
  };

  const closeMenuDialog = () => {
    setMenuDialogOpen(false);
  };

  const onMenuFormChange = <K extends keyof MenuItemFormValues>(field: K, value: MenuItemFormValues[K]) => {
    setMenuForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmitMenuItem = async () => {
    if (!selectedRestaurantId) return;
    try {
      setMenuFormError("");
      setSavingMenuItem(true);

      const payload = {
        restaurantId: selectedRestaurantId,
        itemName: menuForm.itemName,
        itemPrice: Math.round(parseFloat(menuForm.itemPrice) * 100),
        itemDescription: menuForm.itemDescription,
        tags: menuForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        isAvailable: true,
      };

      if (editingMenuItemId) {
        await api.post("/menu/update", { ...payload, menuItemId: editingMenuItemId });
      } else {
        await api.post("/menu/create", payload);
      }

      setMenuDialogOpen(false);
      fetchMenuItems();
    } catch (error) {
      setMenuFormError(error instanceof ApiError ? error.message : "Something went wrong");
    } finally {
      setSavingMenuItem(false);
    }
  };

  const onDeleteMenuItem = async (id: string) => {
    try {
      await api.delete(`/menu/${id}`);
      setMenuItems((prev) => prev.filter((m) => m._id !== id));
    } catch (error) {
      setMenuError(error instanceof ApiError ? error.message : "Something went wrong");
    }
  };

  const onToggleAvailability = async (id: string) => {
    const item = menuItems.find((m) => m._id === id);
    if (!item || !selectedRestaurantId) return;
    try {
      await api.post("/menu/update", {
        restaurantId: selectedRestaurantId,
        menuItemId: id,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        itemDescription: item.itemDescription,
        tags: [],
        isAvailable: !item.isAvailable,
      });
      setMenuItems((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isAvailable: !m.isAvailable } : m))
      );
    } catch (error) {
      setMenuError(error instanceof ApiError ? error.message : "Something went wrong");
    }
  };

  return (
    <Box sx={{ bgcolor: colors.ink, minHeight: "100vh", color: colors.paper }}>
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 4, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 12,
                letterSpacing: 2,
                color: colors.route,
                mb: 1,
              }}
            >
              RESTAURANT DASHBOARD
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 600,
                fontSize: { xs: 24, md: 30 },
                letterSpacing: -0.5,
              }}
            >
              Manage your kitchen
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            {restaurants.length > 1 && (
              <Select
                value={selectedRestaurantId ?? ""}
                onChange={(e) => onSelectRestaurant(e.target.value)}
                size="small"
                sx={{
                  minWidth: 200,
                  bgcolor: colors.panel,
                  color: colors.paper,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(245,243,238,0.15)" },
                }}
              >
                {restaurants.map((r) => (
                  <MuiMenuItem key={r._id} value={r._id}>
                    {r.name}
                  </MuiMenuItem>
                ))}
              </Select>
            )}
            <Button
              onClick={onCreateNewRestaurant}
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              sx={{
                color: colors.paper,
                borderColor: "rgba(245,243,238,0.25)",
                textTransform: "none",
                "&:hover": { borderColor: colors.paper },
              }}
            >
              New restaurant
            </Button>
          </Stack>
        </Stack>

        {loadingRestaurants && <Loading />}

        {!loadingRestaurants && restaurants.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography sx={{ color: colors.fog, mb: 2 }}>You don't have a restaurant yet</Typography>
            <Button
              onClick={onCreateNewRestaurant}
              variant="contained"
              sx={{ bgcolor: colors.ember, textTransform: "none", "&:hover": { bgcolor: "#D67630" } }}
            >
              Create your restaurant
            </Button>
          </Box>
        )}

        {!loadingRestaurants && restaurants.length > 0 && (
          <>
            {loadingDetails && <Loading />}

            {!loadingDetails && detailsError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {detailsError}
              </Alert>
            )}

            {!loadingDetails && !detailsError && (
              <Box
                sx={{
                  bgcolor: colors.panel,
                  border: "1px solid rgba(245,243,238,0.08)",
                  borderRadius: 2,
                  p: 3,
                  mb: 5,
                }}
              >
                <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
                  <Typography
                    sx={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: 11,
                      letterSpacing: 1.5,
                      color: colors.fog,
                    }}
                  >
                    DETAILS
                  </Typography>
                  <Button
                    onClick={isEditing ? onSaveDetails : onToggleEdit}
                    startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                    disabled={savingDetails}
                    size="small"
                    sx={{ color: colors.ember, textTransform: "none" }}
                  >
                    {isEditing ? (savingDetails ? "Saving..." : "Save changes") : "Edit"}
                  </Button>
                </Stack>

                {!isEditing ? (
                  <Stack spacing={1.5}>
                    <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: 20 }}>
                      {details.name}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: colors.fog }}>
                      {details.description}
                    </Typography>
                    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, color: colors.fog }}>
                      {details.addressText}
                    </Typography>
                    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, color: colors.fog }}>
                      {details.openTime} – {details.closeTime}
                    </Typography>
                    <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                      <Switch checked={details.isOpen} onChange={() => onChange("isOpen", !details.isOpen)} />
                      <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: colors.fog }}>
                        {details.isOpen ? "Open for orders" : "Closed"}
                      </Typography>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack spacing={0.5}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={details.name}
                      onChange={(e) => onChange("name", e.target.value)}
                      margin="normal"
                      sx={fieldSx}
                    />
                    <TextField
                      fullWidth
                      label="Description"
                      value={details.description}
                      onChange={(e) => onChange("description", e.target.value)}
                      margin="normal"
                      multiline
                      minRows={2}
                      sx={fieldSx}
                    />
                    <TextField
                      fullWidth
                      label="Keywords"
                      helperText="Separate with commas"
                      value={details.keywords}
                      onChange={(e) => onChange("keywords", e.target.value)}
                      margin="normal"
                      sx={{ ...fieldSx, "& .MuiFormHelperText-root": { color: colors.fog } }}
                    />
                    <TextField
                      fullWidth
                      label="Address"
                      value={details.addressText}
                      onChange={(e) => onChange("addressText", e.target.value)}
                      margin="normal"
                      sx={fieldSx}
                    />
                    <Stack direction="row" spacing={2}>
                      <TextField
                        fullWidth
                        label="Opens at"
                        type="time"
                        value={details.openTime}
                        onChange={(e) => onChange("openTime", e.target.value)}
                        margin="normal"
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={fieldSx}
                      />
                      <TextField
                        fullWidth
                        label="Closes at"
                        type="time"
                        value={details.closeTime}
                        onChange={(e) => onChange("closeTime", e.target.value)}
                        margin="normal"
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={fieldSx}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center" }}>
                      <Switch checked={details.isOpen} onChange={(e) => onChange("isOpen", e.target.checked)} />
                      <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: colors.fog }}>
                        Open for orders right now
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              </Box>
            )}

            <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
              <Typography
                sx={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 11,
                  letterSpacing: 1.5,
                  color: colors.fog,
                }}
              >
                MENU
              </Typography>
              <Button
                onClick={openAddMenuItem}
                startIcon={<AddIcon />}
                size="small"
                variant="outlined"
                sx={{
                  color: colors.ember,
                  borderColor: "rgba(232,135,58,0.4)",
                  textTransform: "none",
                  "&:hover": { borderColor: colors.ember },
                }}
              >
                Add item
              </Button>
            </Stack>

            {loadingMenu && <Loading />}

            {!loadingMenu && menuError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {menuError}
              </Alert>
            )}

            {!loadingMenu && !menuError && menuItems.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography sx={{ color: colors.fog }}>No menu items yet</Typography>
              </Box>
            )}

            {!loadingMenu && !menuError && menuItems.length > 0 && (
              <Stack spacing={1.5}>
                {menuItems.map((item) => (
                  <Box
                    key={item._id}
                    sx={{
                      bgcolor: colors.panel,
                      border: "1px solid rgba(245,243,238,0.08)",
                      borderRadius: 2,
                      p: 2,
                      opacity: item.isAvailable ? 1 : 0.55,
                    }}
                  >
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: 15 }}>
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
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 12.5, color: colors.fog }}>
                          {item.itemDescription}
                        </Typography>
                        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, mt: 0.5 }}>
                          {formatPrice(item.itemPrice)}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <Switch
                          size="small"
                          checked={item.isAvailable}
                          onChange={() => onToggleAvailability(item._id)}
                        />
                        <IconButton size="small" onClick={() => openEditMenuItem(item._id)} sx={{ color: colors.fog }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => onDeleteMenuItem(item._id)} sx={{ color: "#E5484D" }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </>
        )}
      </Container>

      <Dialog open={menuDialogOpen} onClose={closeMenuDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ bgcolor: colors.panel, color: colors.paper }}>
          {editingMenuItemId ? "Edit item" : "Add item"}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: colors.panel, pt: 2 }}>
          <TextField
            fullWidth
            label="Item name"
            value={menuForm.itemName}
            onChange={(e) => onMenuFormChange("itemName", e.target.value)}
            margin="normal"
            sx={fieldSx}
          />
          <TextField
            fullWidth
            label="Price (Rs.)"
            type="number"
            value={menuForm.itemPrice}
            onChange={(e) => onMenuFormChange("itemPrice", e.target.value)}
            margin="normal"
            sx={fieldSx}
          />
          <TextField
            fullWidth
            label="Description"
            value={menuForm.itemDescription}
            onChange={(e) => onMenuFormChange("itemDescription", e.target.value)}
            margin="normal"
            multiline
            minRows={2}
            sx={fieldSx}
          />
          <TextField
            fullWidth
            label="Tags"
            helperText="Separate with commas"
            value={menuForm.tags}
            onChange={(e) => onMenuFormChange("tags", e.target.value)}
            margin="normal"
            sx={{ ...fieldSx, "& .MuiFormHelperText-root": { color: colors.fog } }}
          />
          {menuFormError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {menuFormError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: colors.panel, p: 2 }}>
          <Button onClick={closeMenuDialog} sx={{ color: colors.fog, textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={onSubmitMenuItem}
            disabled={savingMenuItem}
            variant="contained"
            sx={{ bgcolor: colors.ember, textTransform: "none", "&:hover": { bgcolor: "#D67630" } }}
          >
            {savingMenuItem ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RestaurantDashboard;