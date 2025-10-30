// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// export async function extractPdfTextAndPages(data) {
//   // Use the CDN worker so Vercel doesn't need local worker files
//   pdfjsLib.GlobalWorkerOptions.workerSrc =
//     "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js";

//   const uint8 =
//     data instanceof Uint8Array ? data : new Uint8Array(data.buffer ?? data);

//   const loadingTask = pdfjsLib.getDocument({ data: uint8 });
//   const pdf = await loadingTask.promise;

//   let fullText = "";
//   for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//     const page = await pdf.getPage(pageNum);
//     const content = await page.getTextContent();
//     const text = content.items.map((it) => it.str).join(" ");
//     fullText += text + "\f";
//   }
//   return { text: fullText, pages: pdf.numPages };
// }



import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Resolve the actual file path inside node_modules and convert to file:// URL
const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${workerPath}`;

export async function extractPdfTextAndPages(data) {
  const uint8 =
    data instanceof Uint8Array ? data : new Uint8Array(data.buffer ?? data);

  // No special flags needed now that the worker is correctly set
  const loadingTask = pdfjsLib.getDocument({ data: uint8 });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items.map((it) => it.str).join(" ");
    fullText += text + "\f";
  }

  return { text: fullText, pages: pdf.numPages };
}
