import "dotenv/config";
import express from "express";
import cors from "cors";
import auth from "./routes/auth.js";
import chat from "./routes/chat.js";
import vault from "./routes/vault.js";


const app = express();
app.use(cors());
app.use(express.json());


app.use("/auth", auth);
app.use("/chat", chat);
app.use("/vault", vault);


app.listen(4000, () => console.log("Server running on 4000"));