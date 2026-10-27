import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePopover } from "./usePopover";
import "./DropdownMenu.css";

export type MenuItem =
  | { type: "checkbox"; key: string; label: string; count?: number; checked: boolean; onToggle: () => void }
  | { type: "action"; key: string; label: string; onSelect: () => void; disabled?: boolean }
  | { type: "separator"; key: string };

interface DropdownMenuProps {
  /** Renders the trigger button. Spread `props` onto it. */
  trigger: (props: {
    ref: React.RefObject<HTMLButtonElement>;
    "aria-expanded": boolean;
    "aria-controls": string;
    onClick: () => void;
  }) => ReactNode;
  /** Figma "Dropdown Menu Group Label", e.g. "Show brands that are". */
  groupLabel?: string;
  items: MenuItem[];
  align?: "start" | "end";
}

/** Figma "Dropdown Menu": a group label, checkbox items with counts, a separator and plain actions. */
export function DropdownMenu({ trigger, groupLabel, items, align = "start" }: DropdownMenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const { triggerRef, popoverRef, position } = usePopover<HTMLButtonElement>(open, setOpen, align, true);

  // The menu is portalled to the end of <body>, so move focus into it on open and back out when
  // tabbing past either end.
  useEffect(() => {
    if (open) popoverRef.current?.querySelector<HTMLElement>("input, button")?.focus();
  }, [open, popoverRef]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const focusable = popoverRef.current?.querySelectorAll<HTMLElement>("input, button:not(:disabled)");
    if (!focusable?.length) return;
    const leavingEnd = !e.shiftKey && document.activeElement === focusable[focusable.length - 1];
    const leavingStart = e.shiftKey && document.activeElement === focusable[0];
    if (leavingEnd || leavingStart) {
      e.preventDefault();
      close();
    }
  };

  return (
    <>
      {trigger({ ref: triggerRef, "aria-expanded": open, "aria-controls": id, onClick: () => setOpen(!open) })}
      {open &&
        createPortal(
          <div
            ref={popoverRef}
            id={id}
            className="dropdown-menu"
            style={position}
            onKeyDown={onKeyDown}
          >
            <fieldset className="dropdown-menu__group">
              {groupLabel && <legend className="dropdown-menu__label">{groupLabel}</legend>}
              {items.map((item) => {
                if (item.type === "separator") return <hr key={item.key} className="dropdown-menu__separator" />;
                if (item.type === "action")
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className="dropdown-menu__item"
                      disabled={item.disabled}
                      onClick={() => {
                        item.onSelect();
                        close();
                      }}
                    >
                      {item.label}
                    </button>
                  );
                return (
                  <label key={item.key} className="dropdown-menu__item">
                    <input type="checkbox" checked={item.checked} onChange={item.onToggle} />
                    <span className="dropdown-menu__item-label">{item.label}</span>
                    {item.count !== undefined && <span className="dropdown-menu__count">{item.count}</span>}
                  </label>
                );
              })}
            </fieldset>
          </div>,
          document.body,
        )}
    </>
  );
}
