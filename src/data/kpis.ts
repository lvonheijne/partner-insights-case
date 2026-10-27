import type { PartnerOverview } from "./types";

export interface Totals {
  /** Approved + pending, in SEK. */
  commissionSEK: number;
  /** Sum over brands that track clicks. */
  clicks: number;
  /** Approved + pending. */
  conversions: number;
  /** Conversions ÷ clicks, counting only brands with clicks. null if there are no clicks. */
  cvr: number | null;
}

function cvr(pairs: { clicks: number | null; conversions: number }[]) {
  const withClicks = pairs.filter((p) => p.clicks);
  const clicks = withClicks.reduce((sum, p) => sum + (p.clicks ?? 0), 0);
  const conversions = withClicks.reduce((sum, p) => sum + p.conversions, 0);
  return clicks ? conversions / clicks : null;
}

/** Totals for the current period, across all brands. */
export function currentTotals(data: PartnerOverview): Totals {
  const rows = data.brands.map((b) => ({
    clicks: b.uniqueClicks,
    conversions: b.conversions.approved + b.conversions.pending,
    commissionSEK: ((b.commission.approved ?? 0) + (b.commission.pending ?? 0)) * (data.fxToSEK[b.currency] ?? 1),
  }));
  return {
    commissionSEK: rows.reduce((sum, r) => sum + r.commissionSEK, 0),
    clicks: rows.reduce((sum, r) => sum + (r.clicks ?? 0), 0),
    conversions: rows.reduce((sum, r) => sum + r.conversions, 0),
    cvr: cvr(rows),
  };
}

/**
 * Totals for the previous 30 days from each brand's previousPeriod. Brands without one (newer
 * partnerships) earned nothing then, so they add 0. null if the partner has no previous period at all.
 */
export function previousTotals(data: PartnerOverview): Totals | null {
  if (!data.previousPeriod) return null;
  const rows = data.brands.flatMap((b) =>
    b.previousPeriod
      ? [{ ...b.previousPeriod, commissionSEK: b.previousPeriod.commission * (data.fxToSEK[b.currency] ?? 1) }]
      : [],
  );
  return {
    commissionSEK: rows.reduce((sum, r) => sum + r.commissionSEK, 0),
    clicks: rows.reduce((sum, r) => sum + (r.uniqueClicks ?? 0), 0),
    conversions: rows.reduce((sum, r) => sum + r.conversions, 0),
    cvr: cvr(rows.map((r) => ({ clicks: r.uniqueClicks, conversions: r.conversions }))),
  };
}

/** Relative change, e.g. 0.12 for +12 %. null when there's nothing to compare with. */
export function change(current: number | null, previous: number | null | undefined) {
  if (current === null || previous === null || previous === undefined || previous === 0) return null;
  return (current - previous) / previous;
}
