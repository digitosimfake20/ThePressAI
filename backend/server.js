import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import aiRouter from "./routes/ai.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || (NODE_ENV === "production" ? 5000 : 3001);

app.use(cors());
app.use(express.json());

app.use("/api", aiRouter);

// Serve static files from React build in production
if (NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..", "build");
  app.use(express.static(buildPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

const host = NODE_ENV === "production" ? "0.0.0.0" : "localhost";

app.listen(PORT, host, () => {
  console.log(`Backend server running on ${host}:${PORT} (${NODE_ENV} mode)`);
});
