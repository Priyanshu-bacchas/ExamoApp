import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";

import "./VideoButton.css";

// YouTube link (watch / youtu.be / shorts / embed) se embed URL banata hai
export function youtubeEmbedUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

    let id = null;

    if (host === "youtu.be") {
      id = url.pathname.slice(1).split("/")[0];
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v");
      } else {
        const match = /^\/(embed|shorts|live|v)\/([^/?]+)/.exec(url.pathname);

        id = match ? match[2] : null;
      }
    }

    return id && /^[\w-]{6,20}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
      : null;
  } catch {
    return null;
  }
}

// "Watch" button: YouTube video popup me chalta hai.
// Link khaali ho to "-" dikhta hai.
function VideoButton({ url, title }) {
  const [open, setOpen] = useState(false);

  // Escape dabane par popup band
  useEffect(() => {
    if (!open) return undefined;

    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!url) return "-";

  const embed = youtubeEmbedUrl(url);

  // YouTube embed na ban sake to link naye tab me khulta hai
  if (!embed) {
    return /^https?:\/\//i.test(url) ? (
      <a
        className="video-btn"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Play size={13} />
        Watch
      </a>
    ) : (
      "-"
    );
  }

  return (
    <>
      <button
        type="button"
        className="video-btn"
        onClick={() => setOpen(true)}
      >
        <Play size={13} />
        Watch
      </button>

      {open && (
        <div className="video-overlay" onClick={() => setOpen(false)}>
          <div
            className="video-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="video-head">
              <strong>{title || "Details"}</strong>

              <button
                type="button"
                className="video-close"
                onClick={() => setOpen(false)}
                aria-label="Close video"
              >
                <X size={18} />
              </button>
            </div>

            <div className="video-frame">
              <iframe
                src={embed}
                title={title || "Details"}
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VideoButton;
