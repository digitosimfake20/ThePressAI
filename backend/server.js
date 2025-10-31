import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRouter from "./routes/ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api", aiRouter);

app.listen(PORT, "localhost", () => {
  console.log(`Backend server running on localhost:${PORT}`);
});
