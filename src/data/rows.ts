import type { Adjustment, Brand, BrandStatus, PartnerOverview, Tracking } from "./types";
import { statusMeta } from "./status";

/** One table row: the brand plus the derived numbers the table shows and sorts on. */
export interface BrandRow {
  id: string;
  name: string;
  category: string;
  market: string;
  /** True when the brand's market differs from the partner's, e.g. a NO program for a SE partner. */
  isForeignMarket: boolean;
  status: BrandStatus;
  statusLabel: string;
  statusDetail: string | null;
  tracking: Tracking;
  clicks: number | null;
  /** Approved + pending. */
  conversions: number;
  commission: {
    currency: string;
    fxToSEK: number;
    approved: number | null;
    pending: number | null;
    declined: number | null;
    /** Approved + pending in SEK. null if neither is reported. */
    totalSEK: number | null;
  };
  /** (approved + pending) / clicks. null if clicks are null or 0. */
  cvr: number | null;
  lastConversionDate: string | null;
  adjustments: Adjustment[];
}

function toRow(brand: Brand, data: PartnerOverview): BrandRow {
  const fx = data.fxToSEK[brand.currency] ?? 1;
  const { approved, pending, declined } = brand.commission;
  const conversions = brand.conversions.approved + brand.conversions.pending;
  const clicks = brand.uniqueClicks;

  return {
    id: brand.id,
    name: brand.name,
    category: brand.category,
    market: brand.market,
    isForeignMarket: brand.market !== data.partner.market,
    status: brand.status,
    statusLabel: statusMeta(brand.status).label,
    statusDetail: brand.statusDetail,
    tracking: brand.tracking,
    clicks,
    conversions,
    commission: {
      currency: brand.currency,
      fxToSEK: fx,
      approved,
      pending,
      declined,
      totalSEK: approved === null && pending === null ? null : ((approved ?? 0) + (pending ?? 0)) * fx,
    },
    cvr: clicks ? conversions / clicks : null,
    lastConversionDate: brand.lastConversionDate,
    adjustments: brand.adjustments,
  };
}

export const toRows = (data: PartnerOverview) => data.brands.map((brand) => toRow(brand, data));

// ---------- Sorting ----------

/** Brand and the numeric columns sort. Category and status filter instead (see facetOptions). */
export type SortKey = "name" | "commission" | "clicks" | "conversions" | "cvr" | "lastConversionDate";

export type SortDirection = "asc" | "desc";

export interface Sort {
  key: SortKey;
  direction: SortDirection;
}

const sortValue: Record<SortKey, (row: BrandRow) => string | number | null> = {
  name: (r) => r.name,
  commission: (r) => r.commission.totalSEK,
  clicks: (r) => r.clicks,
  conversions: (r) => r.conversions,
  cvr: (r) => r.cvr,
  lastConversionDate: (r) => r.lastConversionDate,
};

/** Text sorts A–Z first. Numbers and dates sort highest / newest first, which is what people look for. */
export const defaultDirection = (key: SortKey): SortDirection => (key === "name" ? "asc" : "desc");

const collator = new Intl.Collator("sv", { sensitivity: "base", numeric: true });

function compareValues(a: string | number, b: string | number) {
  return typeof a === "number" && typeof b === "number" ? a - b : collator.compare(String(a), String(b));
}

/** Unknown values (null) always go last, whichever way the column is sorted. Ties fall back to name. */
export function sortRows(rows: BrandRow[], { key, direction }: Sort) {
  const sign = direction === "asc" ? 1 : -1;
  const get = sortValue[key];
  return [...rows].sort((a, b) => {
    const va = get(a);
    const vb = get(b);
    if (va === null && vb === null) return collator.compare(a.name, b.name);
    if (va === null) return 1;
    if (vb === null) return -1;
    return sign * compareValues(va, vb) || collator.compare(a.name, b.name) || a.market.localeCompare(b.market);
  });
}

// ---------- Header filters (category, status) ----------

export type FacetKey = "category" | "status";

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

const STATUS_ORDER = ["active", "under_review", "paused", "closing", "ended"];

/** The values present in the data with a count each. Statuses in a fixed order, unknown ones last. */
export function facetOptions(rows: BrandRow[], key: FacetKey): FacetOption[] {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row[key], (counts.get(row[key]) ?? 0) + 1);
  const options = [...counts].map(([value, count]) => ({
    value,
    label: key === "status" ? statusMeta(value).label : value,
    count,
  }));
  const rank = (v: string) => (STATUS_ORDER.includes(v) ? STATUS_ORDER.indexOf(v) : STATUS_ORDER.length);
  return options.sort((a, b) =>
    key === "status" ? rank(a.value) - rank(b.value) || collator.compare(a.label, b.label) : collator.compare(a.label, b.label),
  );
}
