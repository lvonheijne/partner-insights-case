import type { PartnerOverview } from "../data/types";

// This is where your table goes: the brand table, sorting and the status filter.
// Split it into more components if you like.
export function BrandTable({ data }: { data: PartnerOverview }) {
  return (
    <p>
      {data.brands.length} brands loaded for {data.partner.name} ({data.period.label}). Replace this
      with your table.
    </p>
  );
}
