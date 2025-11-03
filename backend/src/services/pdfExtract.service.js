const pdfjs = await import("pdfjs-dist/legacy/build/pdf.js"); // default-ish import
const { getDocument, GlobalWorkerOptions } = pdfjs;

// No worker in Node
if (GlobalWorkerOptions) GlobalWorkerOptions.workerSrc = null;

export async function extractPdfTextAndPages(uint8) {
  const pdf = await getDocument({
    data: uint8,
    isEvalSupported: false,
    disableFontFace: true
  }).promise;

  let text = "";
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(" ") + "\n";
  }
  return { text, pages: pdf.numPages };
}
