import React from "react";

export default function ReadyBanner({ onClose }) {
  return (
    <div className="nb-banner">
      <button className="banner-close" onClick={onClose} aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>

      <div className="nb-banner-head">
        <span className="nb-docicon">
          <svg className="nb-doc" width="28" height="28" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="nb-violet" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#B794F4" />
                <stop offset="1" stopColor="#7C3AED" />
              </linearGradient>
            </defs>

            <path
              d="M14 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8l-6-6Z"
              fill="url(#nb-violet)"
              opacity="0.25"
            />
            <path
              d="M14 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8l-6-6Z"
              stroke="#7C3AED"
              strokeWidth="1.8"
              fill="none"
            />

            <path
              d="M15 3.5V9h5.5"
              stroke="#7C3AED"
              strokeWidth="1.8"
              fill="none"
            />

            <rect
              x="8"
              y="10.2"
              width="7.5"
              height="1.6"
              rx="0.8"
              fill="#7C3AED"
            />
            <rect
              x="8"
              y="13.2"
              width="9"
              height="1.6"
              rx="0.8"
              fill="#7C3AED"
              opacity=".9"
            />
            <rect
              x="8"
              y="16.2"
              width="6.2"
              height="1.6"
              rx="0.8"
              fill="#7C3AED"
              opacity=".8"
            />
          </svg>
        </span>
        <span className="nb-banner-title">Your document is ready!</span>
      </div>

      <div className="nb-banner-body">
        <p>You can now ask questions about your document. For example:</p>
        <ul>
          <li>“What is the main topic of this document?”</li>
          <li>“Can you summarize the key points?”</li>
          <li>“What are the conclusions or recommendations?”</li>
        </ul>
      </div>
    </div>
  );
}
