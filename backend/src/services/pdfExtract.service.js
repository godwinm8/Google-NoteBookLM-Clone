// backend/src/services/pdfExtract.service.js

// ✅ Import the CommonJS build correctly
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
// or: import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';

const { getDocument, GlobalWorkerOptions } = pdfjs;

// Node/server: no web worker
GlobalWorkerOptions.workerSrc = undefined;

export async function extractPdfTextAndPages(uint8) {
  const pdf = await getDocument({
    data: uint8,
    disableWorker: true,       // important on server
    isEvalSupported: false,
    disableFontFace: true,
  }).promise;

  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(' ') + '\n';
  }
  return { text, pages: pdf.numPages };
}
