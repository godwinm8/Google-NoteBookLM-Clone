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



// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
// import { createRequire } from "node:module";

// const require = createRequire(import.meta.url);

// // Resolve the actual file path inside node_modules and convert to file:// URL
// const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
// // pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${workerPath}`;
// pdfjsLib.GlobalWorkerOptions.workerSrc = undefined;

// export async function extractPdfTextAndPages(data) {
//   const uint8 =
//     data instanceof Uint8Array ? data : new Uint8Array(data.buffer ?? data);

//   // No special flags needed now that the worker is correctly set
//   // const loadingTask = pdfjsLib.getDocument({ data: uint8 });
//   const loadingTask = pdfjsLib.getDocument({
//   data: uint8,
//   // These switches prevent worker-related fetch paths
//   isEvalSupported: false,
//   disableFontFace: true,
// });
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


// import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

// /**
//  * Extracts plain text and page count from a PDF Buffer/Uint8Array.
//  * IMPORTANT: disableWorker because we are in a serverless/node env.
//  */
// export async function extractPdfTextAndPages(data) {
//   const uint8 =
//     data instanceof Uint8Array ? data : new Uint8Array(data.buffer ?? data);

//   // NO worker in Node/serverless
//   const loadingTask = pdfjs.getDocument({
//     data: uint8,
//     disableWorker: true,
//     // the next flags are not mandatory but avoid eval/font-face in some hosts
//     isEvalSupported: false,
//     disableFontFace: true,
//     useSystemFonts: true,
//   });

//   const pdf = await loadingTask.promise;

//   let fullText = "";
//   for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//     const page = await pdf.getPage(pageNum);
//     const content = await page.getTextContent();
//     const text = content.items.map(it => it.str).join(" ");
//     fullText += text + "\f"; // form-feed to split pages
//   }

//   return { text: fullText, pages: pdf.numPages };
// }


// ✅ use the legacy *JS* build (not the .mjs) and disable the worker
// import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.js";

// export async function extractPdfTextAndPages(data) {
//   // IMPORTANT: no worker in serverless
//   GlobalWorkerOptions.workerSrc = null;

//   const uint8 =
//     data instanceof Uint8Array ? data : new Uint8Array(data.buffer ?? data);

//   const loadingTask = getDocument({
//     data: uint8,
//     // serverless-friendly toggles
//     disableWorker: true,
//     useWorkerFetch: false,
//     disableFontFace: true,
//     isEvalSupported: false,
//     disableRange: true,
//     disableCreateObjectURL: true,
//   });

//   const pdf = await loadingTask.promise;

//   let fullText = "";
//   for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//     const page = await pdf.getPage(pageNum);
//     const content = await page.getTextContent();
//     const text = content.items.map(it => it.str).join(" ");
//     fullText += text + "\f";
//   }
//   return { text: fullText, pages: pdf.numPages };
// }


// ✅ Use the legacy Node build, not the ESM .mjs
// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

// export async function extractPdfTextAndPages(data) {
//   // ⚠️ Absolutely no worker on the server
//   pdfjsLib.GlobalWorkerOptions.workerSrc = undefined;

//   const uint8 =
//     data instanceof Uint8Array ? data : new Uint8Array(data.buffer ?? data);

//   const loadingTask = pdfjsLib.getDocument({
//     data: uint8,
//     disableWorker: true,         // ← critical on Vercel/Node
//     useWorkerFetch: false,
//     isEvalSupported: false,
//     // (optional) quieter logs:
//     verbosity: pdfjsLib.VerbosityLevel.ERRORS,
//   });

//   const pdf = await loadingTask.promise;

//   let fullText = "";
//   for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//     const page = await pdf.getPage(pageNum);
//     const content = await page.getTextContent();
//     const text = content.items.map((it) => (it.str ?? "")).join(" ");
//     fullText += text + "\f";
//   }

//   return { text: fullText, pages: pdf.numPages };
// }



// import  PDFParser  from "pdf2json";

// export async function extractPdfTextAndPagesFromBuffer(buffer) {
//   return new Promise((resolve, reject) => {
//     const pdfParser = new PDFParser();

//     pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));

//     pdfParser.on("pdfParser_dataReady", (pdfData) => {
//       try {
//         let text = "";
//         pdfData?.formImage?.Pages?.forEach((page) => {
//           page.Texts.forEach((t) => {
//             const part = t.R.map((r) => decodeURIComponent(r.T)).join(" ");
//             text += part + " ";
//           });
//           text += "\n\n"; // page separator
//         });

//         const numpages = pdfData?.formImage?.Pages?.length || 0;
//         resolve({ text, pages: numpages });
//       } catch (err) {
//         reject(err);
//       }
//     });

//     pdfParser.parseBuffer(buffer);
//   });
// }

// export async function fetchAsBuffer(url) {
//   const res = await fetch(url);
//   if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
//   const ab = await res.arrayBuffer();
//   return Buffer.from(ab);
// }


// backend/src/services/pdfExtract.service.js
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * IMPORTANT: No external worker file; disable worker usage entirely.
 * This avoids the “Only URLs with a scheme in: file and data … Received protocol 'https:'”
 * and the canvas/DOMMatrix warnings on Vercel.
 */
pdfjs.GlobalWorkerOptions.workerSrc = undefined;

export async function extractPdfTextAndPages(uint8) {
  // Load PDF from memory buffer
  const loadingTask = pdfjs.getDocument({
    data: uint8,
    // keep everything node/serverless-friendly
    useWorkerFetch: false,
    disableFontFace: true,
    isEvalSupported: false,
    standardFontDataUrl: null,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let fullText = "";
  const pages = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);

    // Pull text items for the page
    const textContent = await page.getTextContent({
      normalizeWhitespace: true,
      disableCombineTextItems: false,
    });

    const pageText = textContent.items
      .map((it) => (typeof it.str === "string" ? it.str : ""))
      .join(" ")
      .trim();

    pages.push({ page: i, text: pageText });
    if (pageText) fullText += (fullText ? "\n\n" : "") + pageText;
  }

  return {
    text: fullText,
    pages, // [{page, text}]
  };
}
