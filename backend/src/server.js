import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import uploadRoutes from "./routes/upload.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";

const app = express();

const prodOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map(s => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

// allow any preview of the *frontend* project
const previewPattern = /^https:\/\/google-note-book-lm-clone-ods8-[a-z0-9-]+\.vercel\.app$/i;

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);        // server-to-server/curl

      const norm = origin.replace(/\/$/, "");
      const allowed =
        prodOrigins.includes(norm) || previewPattern.test(norm);

      console.log("[CORS] origin:", origin, "-> allowed:", allowed);
      cb(allowed ? null : new Error("Not allowed by CORS"), allowed);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.options("*", cors());



app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) =>
  res.json({ status: "ok", service: "NotebookLM Backend" })
);

app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/pdfs", pdfRoutes);

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
  app.listen(PORT, () =>
    console.log(`API listening on http://localhost:${PORT}`)
  );
}

export default app;
