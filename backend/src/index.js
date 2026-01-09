import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import connectDB from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",              // local dev
      "https://chat-app-eosin-iota-86.vercel.app"    // production
    ],
    credentials: true,
  })
);

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

/* ---------- FRONTEND (PRODUCTION) ---------- */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "../frontend", "dist", "index.html")
    );
  });
}

/* ---------- START SERVER ---------- */
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
