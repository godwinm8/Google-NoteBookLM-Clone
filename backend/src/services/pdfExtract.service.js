// Use the CommonJS legacy build and destructure from the default export
import pdfjs from "pdfjs-dist/legacy/build/pdf.js";
const { getDocument, GlobalWorkerOptions } = pdfjs;

// No worker in Node
GlobalWorkerOptions.workerSrc = null;

export async function extractPdfTextAndPages(uint8) {
  const pdf = await getDocument({
    data: uint8,
    isEvalSupported: false,
    disableFontFace: true,
  }).promise;

  let text = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n";
  }
  return { text, pages: pdf.numPages };
}
