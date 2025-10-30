import  pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = undefined;

export async function extractPdfTextAndPages(uint8) {
  const loadingTask = pdfjs.getDocument({
    data: uint8,
    isEvalSupported: false,
    disableFontFace: true,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  let text = '';

  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    const pageText = content.items.map(it => it.str).join(' ');
    text += pageText + '\n';
  }

  return { text, pages: pdf.numPages };
}
