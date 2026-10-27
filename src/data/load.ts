import data from "./partner-overview-data.json";
import type { PartnerOverview } from "./types";

/** Sara, an established partner with 31 brands. */
export const established = data as PartnerOverview;

/** Sara's data with every brand and daily total removed, to show the empty state. Nothing else changes. */
export const withoutBrands: PartnerOverview = { ...established, brands: [], dailyTotals: [] };
