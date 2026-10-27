// Types for the fictional case data. Field meanings are in `definitions` inside the JSON
// and in the case brief. null means unknown or not tracked; 0 means zero.

/** Status values we know about today. The API can send others, so treat the list as open. */
export type KnownStatus = "active" | "paused" | "closing" | "ended" | "under_review";
export type BrandStatus = KnownStatus | (string & {});

export type Tracking = "link" | "voucher" | "app";

export interface ByStatus<T> {
  approved: T;
  pending: T;
  declined: T;
}

export interface Adjustment {
  date: string;
  /** In the brand's currency. Negative for reversals. */
  amount: number;
  reason: string;
}

export interface Brand {
  /** Unique. Use this as the key: two brands can share a display name. */
  id: string;
  name: string;
  category: string;
  /** Country code of the brand's program, e.g. "SE" or "NO". */
  market: string;
  /** The brand's currency. Convert with `fxToSEK` before comparing or summing. */
  currency: string;
  status: BrandStatus;
  statusDetail: string | null;
  tracking: Tracking;
  uniqueClicks: number | null;
  conversions: ByStatus<number>;
  commission: ByStatus<number | null>;
  /**
   * The previous 30 days. conversions and commission are approved + pending, commission in the
   * brand's currency. null if the partnership is newer than that.
   */
  previousPeriod: {
    uniqueClicks: number | null;
    conversions: number;
    commission: number;
  } | null;
  lastConversionDate: string | null;
  adjustments: Adjustment[];
}

export interface Channel {
  id: string;
  name: string;
  type: string;
  market: string;
}

export interface Period {
  label: string;
  from: string;
  to: string;
}

export interface DailyTotal {
  date: string;
  uniqueClicks: number;
  conversions: number;
  commissionSEK: number;
}

export interface PartnerOverview {
  partner: {
    id: string;
    name: string;
    company: string;
    market: string;
    memberSince: string;
    channels: Channel[];
  };
  period: Period;
  previousPeriod: Period | null;
  displayCurrency: string;
  fxToSEK: Record<string, number>;
  definitions: Record<string, string>;
  brands: Brand[];
  dailyTotals: DailyTotal[];
}
