import { Icon } from "./Icon";
import { InfoTooltip } from "./Tooltip";
import "./KpiCard.css";

interface KpiCardProps {
  label: string;
  value: string;
  /** Line under the value, e.g. the period. */
  caption: string;
  /** Definition shown behind the info icon. */
  definition?: string;
  /** Change from the previous period as a fraction (0.12 = +12 %). null hides the pill. */
  change: number | null;
  changeLabel?: string;
}

const percent = new Intl.NumberFormat("sv-SE", { style: "percent", maximumFractionDigits: 1 });

/** Figma "card" (style=default). */
export function KpiCard({ label, value, caption, definition, change, changeLabel }: KpiCardProps) {
  const direction = change === null ? null : change > 0 ? "up" : change < 0 ? "down" : "flat";
  return (
    <article className="kpi-card">
      <div className="kpi-card__body">
        <h3 className="kpi-card__label">
          {label}
          {definition && <InfoTooltip label={`About ${label.toLowerCase()}`} content={definition} />}
        </h3>
        <p className="kpi-card__value">{value}</p>
        <p className="kpi-card__caption">{caption}</p>
      </div>
      {direction && change !== null && (
        <p className={`kpi-card__change kpi-card__change--${direction}`}>
          {direction !== "flat" && <Icon name="arrow-up" className={direction === "down" ? "kpi-card__arrow--down" : undefined} />}
          {direction === "flat" ? "No change" : `${direction === "up" ? "Up" : "Down"} ${percent.format(Math.abs(change))}`}{" "}
          {changeLabel}
        </p>
      )}
    </article>
  );
}
