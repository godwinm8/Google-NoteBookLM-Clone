import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractPdfTextAndPages(data) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "pdfjs-dist/legacy/build/pdf.worker.mjs";

  const uint8 =
    data instanceof Uint8Array ? data : new Uint8Array(data.buffer ?? data);

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
