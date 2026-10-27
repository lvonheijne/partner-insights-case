import { useState } from "react";
import "./Banner.css";

/** Figma "Notification Banner". Dismissing hides it for this page view only. */
export function Banner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <aside className="banner" aria-label="Announcement">
      <p className="banner__content">
        <span className="banner__tag">New</span>
        <span>
          You can now connect your TikTok account to Adtraction.{" "}
          <a href="#" className="banner__link">
            Read more →
          </a>
        </span>
      </p>
      <button type="button" className="banner__close" aria-label="Dismiss announcement" onClick={() => setOpen(false)}>
        ✕
      </button>
    </aside>
  );
}
