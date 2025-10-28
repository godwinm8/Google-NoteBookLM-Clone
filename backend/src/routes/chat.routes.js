import { Router } from "express";
import { chatOnPdf, chatOnPdfStream } from "../controllers/chat.controller.js";
const r = Router();

r.post("/", chatOnPdf);
r.get("/stream", chatOnPdfStream);

export default r;
