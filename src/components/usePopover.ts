import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Shared positioning and dismissal for Tooltip and DropdownMenu. The popover is rendered in a portal
 * with fixed positioning, so the sideways-scrolling table can't clip it. It follows its trigger when the
 * page or the table scrolls, and closes on Escape or a click outside.
 */
export function usePopover<T extends HTMLElement>(
  open: boolean,
  setOpen: (open: boolean) => void,
  align: "start" | "end",
  /** Move focus back to the trigger when Escape closes the popover. */
  returnFocus = false,
) {
  const triggerRef = useRef<T>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const place = useCallback(() => {
    if (!triggerRef.current || !popoverRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const popover = popoverRef.current.getBoundingClientRect();
    const gutter = 8;
    let left = align === "end" ? trigger.right - popover.width : trigger.left;
    left = Math.min(Math.max(left, gutter), window.innerWidth - popover.width - gutter);
    let top = trigger.bottom + 4;
    if (top + popover.height > window.innerHeight - gutter) top = Math.max(gutter, trigger.top - popover.height - 4);
    setPosition({ top, left });
  }, [align]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !popoverRef.current?.contains(target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, setOpen, returnFocus, place]);

  return { triggerRef, popoverRef, position };
}
