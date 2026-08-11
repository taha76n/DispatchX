import { useEffect, useState } from "react";
import { Container, Typography, CircularProgress } from "@mui/material";
import type { HealthStatus } from "@dispatchx/shared";

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetch("http://localhost:4000/health")
      .then((res) => res.json())
      .then((data: HealthStatus) => setHealth(data));
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">DispatchX</Typography>
      {health ? (
        <Typography>
          Server status: {health.status} at {health.timestamp}
        </Typography>
      ) : (
        <CircularProgress />
      )}
    </Container>
  );
}

export default App;
