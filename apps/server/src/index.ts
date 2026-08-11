import express from "express";
import cors from "cors";
import type { HealthStatus } from "@dispatchx/shared";

const app = express();
app.use(cors());
const PORT = 4000;

app.get("/", (req, res) => {
  res.send("<h1>Hello from index.js of apps/server</h1>");
});

app.get("/health", (req, res) => {
  const status: HealthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
  res.json(status);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
