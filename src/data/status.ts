import type { BrandStatus, KnownStatus } from "./types";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusMeta {
  label: string;
  tone: StatusTone;
}

const KNOWN: Record<KnownStatus, StatusMeta> = {
  active: { label: "Active", tone: "success" },
  under_review: { label: "Under review", tone: "info" },
  paused: { label: "Paused", tone: "warning" },
  closing: { label: "Closing", tone: "danger" },
  ended: { label: "Ended", tone: "neutral" },
};

/** "under_review" -> "Under review". Used for statuses the API sends that we don't know yet. */
function humanize(status: string) {
  const words = status.replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function statusMeta(status: BrandStatus): StatusMeta {
  return KNOWN[status as KnownStatus] ?? { label: humanize(status), tone: "neutral" };
}
