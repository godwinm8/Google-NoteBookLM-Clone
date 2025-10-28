export function chunkText(text, chunkSize = 1200, overlap = 200) {
  const pages = text.split("\f");
  const chunks = [];
  let pageNum = 1;
  for (const pageText of pages) {
    let i = 0;
    while (i < pageText.length) {
      const end = Math.min(pageText.length, i + chunkSize);
      const slice = pageText.slice(i, end);
      chunks.push({ text: slice, page: pageNum });
      i = Math.max(end - overlap, end);
    }
    pageNum += 1;
  }
  return chunks;
}
