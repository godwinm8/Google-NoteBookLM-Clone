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

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) =>
  res.json({ status: "ok", service: "NotebookLM Backend" })
);

app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/pdfs", pdfRoutes);

let isDbReady = false;
async function ensureDb() {
  if (isDbReady) return;
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "notebooklm" });
  isDbReady = true;
  console.log("MongoDB connected");
}
ensureDb().catch((e) => {
  console.error("Mongo connection error:", e);
});

export default app;
