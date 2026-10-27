import type { BrandStatus } from "../data/types";
import { statusMeta } from "../data/status";
import "./StatusBadge.css";

/** Figma "badge". Statuses the API sends that we don't know yet get the neutral look and a readable label. */
export function StatusBadge({ status }: { status: BrandStatus }) {
  const { label, tone } = statusMeta(status);
  return <span className={`badge badge--${tone}`}>{label}</span>;
}
