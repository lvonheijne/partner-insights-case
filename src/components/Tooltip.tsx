import { useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { usePopover } from "./usePopover";
import "./Tooltip.css";

interface InfoTooltipProps {
  /** Accessible name for the info button, e.g. "About commission". */
  label: string;
  content: ReactNode;
  align?: "start" | "end";
}

/** The Figma "Info" icon as a button. Hover, focus or tap it to show the content. */
export function InfoTooltip({ label, content, align = "start" }: InfoTooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const { triggerRef, popoverRef, position } = usePopover<HTMLButtonElement>(open, setOpen, align);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="info-tooltip"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
      >
        <Icon name="info" />
      </button>
      {open &&
        createPortal(
          <div ref={popoverRef} id={id} role="tooltip" className="tooltip" style={position}>
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
