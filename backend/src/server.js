import "./force-pdfjs.js";

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import { corsMiddleware } from "./middleware/cors.js";
import uploadRoutes from "./routes/upload.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";

const app = express();

const PROD_ORIGINS = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map(s => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

// preview domains for your frontend project (ods8-*)
const PREVIEW_RE = /^https:\/\/google-note-book-lm-clone-ods8-[a-z0-9-]+\.vercel\.app$/i;

// Preflight handler that never 404s and never redirects
app.use((req, res, next) => {
  if (req.method !== "OPTIONS") return next();

  const origin = req.headers.origin || "";
  const norm = origin.replace(/\/$/, "");

  const allowed = PROD_ORIGINS.includes(norm) || PREVIEW_RE.test(norm);
  res.setHeader("Vary", "Origin");

  if (!allowed) return res.status(403).end();

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res.sendStatus(204);
});

// Main CORS middleware
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const norm = origin.replace(/\/$/, "");
      const ok = PROD_ORIGINS.includes(norm) || PREVIEW_RE.test(norm);
      cb(ok ? null : new Error("Not allowed by CORS"), ok);
    },
    credentials: true
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(corsMiddleware);
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ ok: true }));

app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/pdfs", pdfRoutes);

// --- Mongo ---
let mongoReady = null;
async function ensureMongo() {
  if (!mongoReady) {
    mongoReady = mongoose
      .connect(process.env.MONGODB_URI, { dbName: "notebooklm" })
      .then(() => console.log("MongoDB connected"))
      .catch((e) => {
        mongoReady = null;
        throw e;
      });
  }
  return mongoReady;
}
ensureMongo();

const PORT = process.env.PORT || 8080;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
}

export default app;
