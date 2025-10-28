import React from "react";

export default function ThreadCard({ thread, onClose, onJump }) {
  return (
    <div className="nb-thread">
      <div className="nb-q">
        <div className="nb-q-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.5" stroke="#2563eb" strokeWidth="2" />
            <path
              d="M5 19c1.3-3 4-4.5 7-4.5s5.7 1.5 7 4.5"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="nb-q-bubble">{thread.question}</div>

        <button
          className="thread-close"
          onClick={() => onClose(thread.id)}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="nb-a">
        <div className="nb-a-bubble">
          <div className="nb-abot">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <rect
                x="4"
                y="7"
                width="16"
                height="10"
                rx="4"
                fill="#8b5cf6"
                opacity=".18"
              />
              <rect
                x="4.5"
                y="7.5"
                width="15"
                height="9"
                rx="4"
                stroke="#8b5cf6"
              />
              <circle cx="10" cy="12" r="1.3" fill="#8b5cf6" />
              <circle cx="14" cy="12" r="1.3" fill="#8b5cf6" />
              <path
                d="M12 5v2"
                stroke="#8b5cf6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="nb-atext">{thread.answer}</div>

          {Array.isArray(thread.citations) && thread.citations.length > 0 && (
            <div className="nb-afooter">
              {thread.citations.map((c, i) => (
                <button
                  key={i}
                  className="nb-pagechip"
                  title={c.text || `Page ${c.page}`}
                  onClick={() => onJump?.(c.page || 1)}
                >
                  {c.tag ? `#${c.tag}` : `#${i + 1}`} — Page {c.page ?? "?"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
