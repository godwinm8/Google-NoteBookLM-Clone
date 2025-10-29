import * as pdfjs from "pdfjs-dist/legacy/build/pdf.node.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = undefined;

export async function extractTextFromPdfBuffer(data) {
  const uint8 =
    data instanceof Uint8Array ? data : new Uint8Array(data.buffer ?? data);

  const loadingTask = pdfjs.getDocument({
    data: uint8,

    isEvalSupported: false,
    disableFontFace: true,
    useWorkerFetch: false,
  });

  const doc = await loadingTask.promise;

  let text = "";
  const pages = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => (typeof it.str === "string" ? it.str : ""))
      .join(" ");

    text += (i > 1 ? "\f" : "") + pageText;
    pages.push({ page: i, textLength: pageText.length });
  }

  return { text, pages };
}
