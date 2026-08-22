import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
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

export interface RestaurantOption {
  _id: string;
  name: string;
  isOpen: boolean;
}

export interface RestaurantDetailValues {
  name: string;
  description: string;
  keywords: string;
  addressText: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface MenuItemData {
  _id: string;
  itemName: string;
  itemPrice: number;
  itemDescription: string;
  isAvailable: boolean;
}

interface RestaurantDashboardProps {
  restaurants: RestaurantOption[];
  selectedRestaurantId: string;
  onSelectRestaurant: (id: string) => void;
  onCreateNewRestaurant: () => void;

  loadingDetails: boolean;
  detailsError: string;
  details: RestaurantDetailValues | null;
  isEditing: boolean;
  onToggleEdit: () => void;
  onChange: <K extends keyof RestaurantDetailValues>(
    field: K,
    value: RestaurantDetailValues[K]
  ) => void;
  onSaveDetails: () => void;
  savingDetails: boolean;

  menuItems: MenuItemData[];
  loadingMenu: boolean;
  menuError: string;
  onAddMenuItem: () => void;
  onEditMenuItem: (id: string) => void;
  onDeleteMenuItem: (id: string) => void;
  onToggleAvailability: (id: string) => void;
}

const formatPrice = (paisa: number) => `Rs. ${(paisa / 100).toFixed(2)}`;

const RestaurantDashboard = ({
  restaurants,
  selectedRestaurantId,
  onSelectRestaurant,
  onCreateNewRestaurant,
  loadingDetails,
  detailsError,
  details,
  isEditing,
  onToggleEdit,
  onChange,
  onSaveDetails,
  savingDetails,
  menuItems,
  loadingMenu,
  menuError,
  onAddMenuItem,
  onEditMenuItem,
  onDeleteMenuItem,
  onToggleAvailability,
}: RestaurantDashboardProps) => {
  return (
    <Box sx={{ bgcolor: colors.ink, minHeight: "100vh", color: colors.paper }}>
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 4 }}
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

          <Stack direction="row" spacing={1.5} alignItems="center">
            {restaurants.length > 1 && (
              <Select
                value={selectedRestaurantId}
                onChange={(e) => onSelectRestaurant(e.target.value)}
                size="small"
                sx={{
                  minWidth: 200,
                  bgcolor: colors.panel,
                  color: colors.paper,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(245,243,238,0.15)",
                  },
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

        {loadingDetails && <Loading />}

        {!loadingDetails && detailsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {detailsError}
          </Alert>
        )}

        {!loadingDetails && details && (
          <Box
            sx={{
              bgcolor: colors.panel,
              border: "1px solid rgba(245,243,238,0.08)",
              borderRadius: 2,
              p: 3,
              mb: 5,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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
                sx={{
                  color: colors.ember,
                  textTransform: "none",
                }}
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
                <Stack direction="row" alignItems="center" spacing={1}>
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
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />
                  <TextField
                    fullWidth
                    label="Closes at"
                    type="time"
                    value={details.closeTime}
                    onChange={(e) => onChange("closeTime", e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  <Switch checked={details.isOpen} onChange={(e) => onChange("isOpen", e.target.checked)} />
                  <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: colors.fog }}>
                    Open for orders right now
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Box>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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
            onClick={onAddMenuItem}
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
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
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

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Switch
                      size="small"
                      checked={item.isAvailable}
                      onChange={() => onToggleAvailability(item._id)}
                    />
                    <IconButton size="small" onClick={() => onEditMenuItem(item._id)} sx={{ color: colors.fog }}>
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
      </Container>
    </Box>
  );
};

export default RestaurantDashboard;