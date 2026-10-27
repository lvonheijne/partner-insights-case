import { useState } from "react";
import { established, withoutBrands } from "./data/load";
import { change, currentTotals, previousTotals } from "./data/kpis";
import { formatCount, formatDate, formatPercent, formatSEKPrecise } from "./data/format";
import type { PartnerOverview } from "./data/types";
import { Banner } from "./components/Banner";
import { BrandTable } from "./components/BrandTable";
import { FilterBar } from "./components/FilterBar";
import { KpiCard } from "./components/KpiCard";
import { PageHeader } from "./components/PageHeader";
import { Sidebar } from "./components/Sidebar";

function Kpis({ data }: { data: PartnerOverview }) {
  const now = currentTotals(data);
  const before = previousTotals(data);
  const period = `${formatDate(data.period.from)} – ${formatDate(data.period.to)}`;
  const changeLabel = data.previousPeriod ? `from ${data.previousPeriod.label.toLowerCase()}` : undefined;
  // Plain-language versions of the `definitions` in the data file. They restate it and add nothing.
  const definitions = {
    commission:
      "What you earn: approved + pending, converted to SEK. Approved can go down after a reversal, for example a cancelled order.",
    uniqueClicks:
      "De-duplicated clicks on your tracking links. Brands that don't track clicks, for example some app installs, aren't counted.",
    conversions: "Sales or leads from your links: approved + pending. Declined ones won't be paid and aren't counted.",
    conversionRate: "Conversions ÷ unique clicks, for brands that have clicks.",
  };

  return (
    <section className="kpis" aria-label="Totals">
      <KpiCard
        label="Commission"
        value={formatSEKPrecise(now.commissionSEK)}
        caption={period}
        definition={definitions.commission}
        change={change(now.commissionSEK, before?.commissionSEK)}
        changeLabel={changeLabel}
      />
      <KpiCard
        label="Unique clicks"
        value={formatCount(now.clicks)}
        caption={period}
        definition={definitions.uniqueClicks}
        change={change(now.clicks, before?.clicks)}
        changeLabel={changeLabel}
      />
      <KpiCard
        label="Conversions"
        value={formatCount(now.conversions)}
        caption={period}
        definition={definitions.conversions}
        change={change(now.conversions, before?.conversions)}
        changeLabel={changeLabel}
      />
      <KpiCard
        label="CVR"
        value={now.cvr === null ? "—" : formatPercent(now.cvr)}
        caption="Brands with clicks"
        definition={definitions.conversionRate}
        change={change(now.cvr, before?.cvr)}
        changeLabel={changeLabel}
      />
    </section>
  );
}

export default function App() {
  const [showBrands, setShowBrands] = useState(true);
  const data = showBrands ? established : withoutBrands;
  const { partner } = data;

  return (
    <div className="app">
      <Sidebar partnerName={partner.name} company={partner.company} current="Insights" />
      <main className="page">
        <PageHeader title="Insights" firstName={partner.name.split(" ")[0]} />
        <Banner />
        <FilterBar data={data} />
        <Kpis data={data} />
        {/* key resets sort, filters and page when switching data */}
        <BrandTable key={String(showBrands)} data={data} />

        {/* Demo control, not part of the design: shows the page with the brands removed from Sara's data. */}
        <label className="demo-switch">
          <input type="checkbox" checked={!showBrands} onChange={(e) => setShowBrands(!e.target.checked)} />
          Demo: remove all brands from Sara's data
        </label>
      </main>
    </div>
  );
}
