import "dotenv/config";
import express from "express";
import cors from "cors";

import auth from "./routes/auth.js";
import chat from "./routes/chat.js";
import vault from "./routes/vault.js";
import documents from "./routes/documents.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", auth);
app.use("/chat", chat);
app.use("/vault", vault);
app.use("/documents", documents);

// Health check
app.get("/", (req, res) => {
  res.send("Indian Legal Documents API running ✅");
});

// Port from env (recommended)
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
