import { Router } from "express";
import { listPdfs } from "../controllers/pdf.controller.js";
const router = Router();
router.get("/", listPdfs);
export default router;
