import "dotenv/config";
import express from "express";
import cors from "cors";

import auth from "./routes/auth.js";
import chat from "./routes/chat.js";
import vault from "./routes/vault.js";
import documents from "./routes/documents.js";
import user from "./routes/user.js";
import translate from "./routes/translate.js";
import lawyers from "./routes/lawyers.js";
import admin from "./routes/admin.js";
import appointments from "./routes/appointments.js";
import messages from "./routes/messages.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", auth);
app.use("/chat", chat);
app.use("/vault", vault);
app.use("/documents", documents);
app.use("/user", user);
app.use("/translate", translate);
app.use("/lawyers", lawyers);
app.use("/admin", admin);
app.use("/appointments", appointments);
app.use("/messages", messages);

// Health check
app.get("/", (req, res) => {
  res.send("Indian Legal Documents API running ✅");
});

// Test endpoint to verify routes are working
app.get("/test", (req, res) => {
  res.json({ 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    routes: {
      auth: "/auth",
      lawyers: "/lawyers",
      registerLawyer: "/auth/register-lawyer"
    }
  });
});

// Port from env (recommended)
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
