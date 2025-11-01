// backend/src/services/pdfExtract.service.js
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.js";

// No worker in Node environments
GlobalWorkerOptions.workerSrc = undefined;

export async function extractPdfTextAndPages(uint8) {
  const pdf = await getDocument({
    data: uint8,
    disableWorker: true,        // ← important for server-side use
    isEvalSupported: false,
    disableFontFace: true,
    // useSystemFonts: true,    // optional; keep if you want
  }).promise;

  let text = "";
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n";
  }
  return { text, pages: pdf.numPages };
}
