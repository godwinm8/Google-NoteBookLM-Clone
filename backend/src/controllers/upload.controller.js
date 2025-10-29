// import axios from "axios";
// import FormData from "form-data";
// import fs from "fs";
// import path from "path";
// import Pdf from "../models/PdfMetadata.model.js";
// import { indexPdfByUrl } from "../services/pdfIndex.service.js";

// export const registerUploadedUrl = async (req, res) => {
//   try {
//     const { url, title } = req.body;

//     if (!url || typeof url !== "string") {
//       return res
//         .status(400)
//         .json({ error: "A valid 'url' (string) is required" });
//     }

//     try {
//       new URL(url);
//     } catch {
//       return res.status(400).json({ error: "Invalid URL format" });
//     }

//     console.log("[registerUploadedUrl] url:", url, "title:", title);

//     const result = await indexPdfByUrl(url, title || "Untitled");
//     return res.json(result);
//   } catch (e) {
//     console.error("[registerUploadedUrl] failed:", e);
//     return res
//       .status(500)
//       .json({ error: e.message || "Internal Server Error" });
//   }
// };

// export const uploadPDFViaServer = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "file is required" });

//     const formData = new FormData();

//     formData.append("file", req.file.buffer, {
//       filename: req.file.originalname || "upload.pdf",
//       contentType: req.file.mimetype || "application/pdf",
//       knownLength: req.file.size,
//     });

//     const response = await axios.post(
//       "https://api.upload.io/v1/files/basic",
//       formData,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.UPLOAD_IO_API_KEY}`,
//           ...formData.getHeaders(),
//         },
//       }
//     );

//     const fileUrl = response.data.fileUrl;
//     const rawUrl = fileUrl.includes("/raw/")
//       ? fileUrl
//       : fileUrl.replace("/file/", "/raw/");
//     const result = await indexPdfByUrl(
//       rawUrl,
//       req.file.originalname || "Uploaded PDF"
//     );
//     return res.json(result);
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: e.message });
//   }
// };


// backend/src/controllers/upload.controller.js
import fetch from "node-fetch";
import { extractPdfTextAndPages } from "../services/pdfExtract.service.js";
import { Pdf } from "../models/pdf.model.js"; // whatever your model file is

export async function registerUploadedUrl(req, res) {
  try {
    const { url, fileId, title } = req.body || {};

    if (!url && !fileId) {
      return res.status(400).json({ error: "Provide `url` or `fileId`" });
    }

    let pdfBuffer;

    if (url) {
      // Accept only RAW public file URLs (Upload.io /raw/…), trim any query
      const clean = url.trim();
      const resp = await fetch(clean, { cache: "no-store" });
      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        throw new Error(`Download failed (${resp.status}): ${body}`);
      }
      pdfBuffer = Buffer.from(await resp.arrayBuffer());
    } else {
      // Fetch via Upload.io API using secret key
      const ACCOUNT_ID = process.env.UPLOAD_IO_ACCOUNT_ID;
      const API_KEY = process.env.UPLOAD_IO_API_KEY;
      if (!ACCOUNT_ID || !API_KEY) {
        throw new Error("UPLOAD_IO_ACCOUNT_ID / UPLOAD_IO_API_KEY not set");
      }
      const apiUrl = `https://api.upload.io/v2/accounts/${ACCOUNT_ID}/files/${fileId}/content`;
      const resp = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        throw new Error(`Upload.io fetch failed (${resp.status}): ${body}`);
      }
      pdfBuffer = Buffer.from(await resp.arrayBuffer());
    }

    // Extract text & pages
    const { text, pages } = await extractPdfTextAndPages(pdfBuffer);

    // persist however your app expects
    const doc = await Pdf.create({
      title: title || "Uploaded PDF",
      url: url || null,
      pages,
      // store text / chunks / collection name etc. as your code expects
    });

    return res.json({ pdf: doc });
  } catch (err) {
    console.error("[/api/upload/register] error:", err);
    return res.status(500).json({ error: String(err.message || err) });
  }
}
