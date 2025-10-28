import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfViewer = forwardRef(function PdfViewer({ url }, ref) {
  const [numPages, setNumPages] = useState(null);

  const scrollContainerRef = useRef(null);
  const pageRefs = useRef([]);

  useImperativeHandle(ref, () => ({
    scrollToPage(pageNumber) {
      if (!numPages) return;

      const n = Math.max(1, Math.min(pageNumber, numPages));
      const el = pageRefs.current[n - 1];
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
  }));

  function onLoadSuccess({ numPages }) {
    setNumPages(numPages);

    pageRefs.current = Array.from(
      { length: numPages },
      (_, i) => pageRefs.current[i] || null
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      style={{
        height: "100%",
        overflowY: "auto",
        background: "#f6f7fb",
      }}
    >
      <div
        className="pdf-shell"
        style={{
          width: "fit-content",
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(15,23,42,.06)",
          padding: "12px 12px 24px",
        }}
      >
        <Document file={url} onLoadSuccess={onLoadSuccess}>
          {Array.from({ length: numPages || 0 }, (_, i) => (
            <div
              key={i}
              ref={(el) => (pageRefs.current[i] = el)}
              style={{ marginBottom: 16 }}
            >
              <Page
                pageNumber={i + 1}
                width={900}
                renderTextLayer
                renderAnnotationLayer
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
});

export default PdfViewer;
