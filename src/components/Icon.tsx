import arrowDown from "../assets/icons/arrow-down.svg";
import arrowUp from "../assets/icons/arrow-up.svg";
import arrowUpDown from "../assets/icons/arrow-up-down.svg";
import chevronDown from "../assets/icons/chevron-down.svg";
import info from "../assets/icons/info.svg";
import listFilter from "../assets/icons/list-filter.svg";
import "./Icon.css";

const ICONS = {
  "arrow-down": arrowDown,
  "arrow-up": arrowUp,
  "arrow-up-down": arrowUpDown,
  "chevron-down": chevronDown,
  info,
  "list-filter": listFilter,
};

export type IconName = keyof typeof ICONS;

/**
 * Icons exported from Figma, used as a mask so they take the text colour (a token) of their parent
 * instead of the colour baked into the SVG.
 */
export function Icon({ name, size = "sm", className }: { name: IconName; size?: "sm" | "md"; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`icon icon--${size} ${className ?? ""}`}
      style={{ maskImage: `url("${ICONS[name]}")`, WebkitMaskImage: `url("${ICONS[name]}")` }}
    />
  );
}
