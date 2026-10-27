// Number and date formatting. Numbers use Swedish conventions (the partner market and the
// display currency), dates use short English month names to match the rest of the UI.

const sek = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const sekPrecise = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const count = new Intl.NumberFormat("sv-SE");

const percent = new Intl.NumberFormat("sv-SE", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export const formatSEK = (value: number) => sek.format(value);

/** With öre, as on the KPI card. */
export const formatSEKPrecise = (value: number) => sekPrecise.format(value);

export const formatCount = (value: number) => count.format(value);

export const formatPercent = (value: number) => percent.format(value);

/** Amount in any currency, no decimals unless the value has them. */
export function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency,
    currencyDisplay: currency === "SEK" ? "symbol" : "code",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

/** "2026-10-14" -> "Oct 14, 2026". Parsed as UTC so the day never shifts with the time zone. */
export const formatDate = (isoDate: string) => date.format(new Date(`${isoDate}T00:00:00Z`));
