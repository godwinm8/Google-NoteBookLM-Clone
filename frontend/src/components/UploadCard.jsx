import React, { useState, useCallback } from "react";
import axios from "axios";
import { Upload } from "upload-js";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
const PUBLIC_KEY = import.meta.env.VITE_UPLOAD_IO_PUBLIC_KEY;

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: "3px solid rgba(124,58,237,.25)",
        borderTopColor: "rgb(124,58,237)",
        animation: "spin 1s linear infinite",
        verticalAlign: "-3px",
        marginRight: 8,
      }}
    />
  );
}

function UploadProgress({ percent }) {
  return (
    <div style={{ width: "100%" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "48px 24px 8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            fontWeight: 600,
            color: "#6d28d9",
          }}
        >
          <div>
            <Spinner />
            Uploading PDF
          </div>
          <div>{percent}%</div>
        </div>

        <div
          style={{
            height: 10,
            marginTop: 16,
            background: "#eee",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${percent}%`,
              background: "#8b5cf6",
              transition: "width 120ms linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function UploadCard({ onReady }) {
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const upload = Upload({ apiKey: PUBLIC_KEY });

  const handleFiles = useCallback(
    async (files) => {
      const file = files?.[0];
      if (!file) return;
      if (file.type !== "application/pdf") {
        alert("Please select a PDF file.");
        return;
      }

      try {
        setBusy(true);
        setProgress(1);

        const { fileUrl } = await upload.uploadFile(file, {
          onProgress: ({ bytesSent, bytesTotal }) => {
            const p = Math.max(1, Math.round((bytesSent / bytesTotal) * 100));
            setProgress(p);
          },
        });

        const rawUrl = fileUrl.includes("/raw/")
          ? fileUrl
          : fileUrl.replace("/file/", "/raw/");

        const { data } = await axios.post(`${API}/api/upload/register`, {
          url: rawUrl,
          title: file.name,
        });

        const { pdf } = data || {};
        setProgress(100);

        onReady?.({
          pdfId: pdf?._id,
          title: pdf?.title || file.name,
          url: pdf?.url || rawUrl,
          collectionName: pdf?.collectionName,
        });
      } catch (err) {
        console.error(err);
        alert("Upload failed. Check your Upload.io key and backend logs.");
        setBusy(false);
        setProgress(0);
      }
    },
    [upload, onReady]
  );

  const onInputChange = (e) => handleFiles(e.target.files);

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  if (busy) {
    return <UploadProgress percent={progress} />;
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{ display: "grid", placeItems: "center", width: "100%" }}
    >
      <label className="upload-card">
        <div className="upload-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
          Upload PDF to start chatting
        </div>
        <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>
          Click or drag and drop your file here
        </div>

        <input
          type="file"
          accept="application/pdf"
          onChange={onInputChange}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}
