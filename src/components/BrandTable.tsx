import { useMemo, useState } from "react";
import type { PartnerOverview } from "../data/types";
import {
  defaultDirection,
  facetOptions,
  sortRows,
  toRows,
  type BrandRow,
  type FacetKey,
  type Sort,
  type SortKey,
} from "../data/rows";
import { formatCount, formatDate, formatMoney, formatPercent, formatSEK } from "../data/format";
import { Button } from "./Button";
import { DropdownMenu } from "./DropdownMenu";
import { Icon } from "./Icon";
import { Pagination } from "./Pagination";
import { StatusBadge } from "./StatusBadge";
import { InfoTooltip } from "./Tooltip";
import "./BrandTable.css";

type Column =
  | { kind: "sort"; key: SortKey; label: string; align: "start" | "end" }
  | { kind: "filter"; key: FacetKey; label: string; groupLabel: string };

const COLUMNS: Column[] = [
  { kind: "sort", key: "name", label: "Brand", align: "start" },
  { kind: "sort", key: "commission", label: "Commission", align: "end" },
  { kind: "sort", key: "clicks", label: "Clicks", align: "end" },
  { kind: "sort", key: "conversions", label: "Conversions", align: "end" },
  { kind: "sort", key: "cvr", label: "CVR", align: "end" },
  { kind: "sort", key: "lastConversionDate", label: "Last conversion", align: "end" },
  { kind: "filter", key: "category", label: "Category", groupLabel: "Show brands in" },
  { kind: "filter", key: "status", label: "Status", groupLabel: "Show brands that are" },
];

const PAGE_SIZES = [10, 25, 50];
const NO_FILTERS: Record<FacetKey, string[]> = { category: [], status: [] };

function directionLabel(key: SortKey, direction: Sort["direction"]) {
  if (key === "name") return direction === "asc" ? "A to Z" : "Z to A";
  if (key === "lastConversionDate") return direction === "desc" ? "newest first" : "oldest first";
  return direction === "desc" ? "highest first" : "lowest first";
}

export function BrandTable({ data }: { data: PartnerOverview }) {
  const allRows = useMemo(() => toRows(data), [data]);
  const [sort, setSort] = useState<Sort>({ key: "commission", direction: "desc" });
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [scrolled, setScrolled] = useState(false);

  const filtered = useMemo(
    () =>
      sortRows(
        allRows.filter(
          (r) =>
            (!filters.category.length || filters.category.includes(r.category)) &&
            (!filters.status.length || filters.status.includes(r.status)),
        ),
        sort,
      ),
    [allRows, filters, sort],
  );
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const sortBy = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: defaultDirection(key) },
    );
    setPage(1);
  };

  const toggleFilter = (key: FacetKey, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: current[key].includes(value) ? current[key].filter((v) => v !== value) : [...current[key], value],
    }));
    setPage(1);
  };

  const clearFilter = (key: FacetKey) => {
    setFilters((current) => ({ ...current, [key]: [] }));
    setPage(1);
  };

  const countText =
    filtered.length === allRows.length ? `${allRows.length} brands` : `${filtered.length} of ${allRows.length} brands`;
  const sortLabel = COLUMNS.find((c) => c.key === sort.key)!.label;

  return (
    <section className="brand-table" aria-labelledby="brand-table-title">
      <header className="brand-table__header">
        <h2 id="brand-table-title" className="brand-table__title">
          Brands
        </h2>
        {allRows.length > 0 && <span className="brand-table__count">{countText}</span>}
      </header>

      {allRows.length === 0 ? (
        <div className="brand-table__empty">
          <h3 className="brand-table__empty-title">No brands yet</h3>
          <p className="brand-table__empty-text">Brands you partner with show up here.</p>
        </div>
      ) : (
        <>
          <p className="visually-hidden" aria-live="polite">
            {`Showing ${countText}, sorted by ${sortLabel}, ${directionLabel(sort.key, sort.direction)}.`}
          </p>
          <div
            className={scrolled ? "brand-table__scroll is-scrolled" : "brand-table__scroll"}
            tabIndex={0}
            role="region"
            aria-label="Brands table, scrolls sideways"
            onScroll={(e) => setScrolled(e.currentTarget.scrollLeft > 0)}
          >
            <table>
              <thead>
                <tr>
                  {COLUMNS.map((column) =>
                    column.kind === "sort" ? (
                      <SortHeader key={column.key} column={column} sort={sort} onSort={sortBy} />
                    ) : (
                      <FilterHeader
                        key={column.key}
                        column={column}
                        rows={allRows}
                        selected={filters[column.key]}
                        onToggle={(value) => toggleFilter(column.key, value)}
                        onClear={() => clearFilter(column.key)}
                      />
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" className="cell--brand">
                      <span className="brand-cell" title={row.name}>
                        {row.name}
                      </span>
                      {row.isForeignMarket && <span className="cell--muted"> ({row.market})</span>}
                    </th>
                    <td className="cell--end">
                      <CommissionCell row={row} />
                    </td>
                    <td className="cell--end">
                      {row.clicks === null ? (
                        <MissingValue
                          text="Not tracked"
                          label={`Why clicks aren't tracked for ${row.name}`}
                          explanation="Clicks aren't tracked for this brand, for example for some app installs."
                        />
                      ) : (
                        formatCount(row.clicks)
                      )}
                    </td>
                    <td className="cell--end">{formatCount(row.conversions)}</td>
                    <td className="cell--end">
                      {row.cvr === null ? (
                        <MissingValue
                          text="—"
                          label={`Why ${row.name} has no conversion rate`}
                          explanation={cvrMissingReason(row)}
                        />
                      ) : (
                        formatPercent(row.cvr)
                      )}
                    </td>
                    <td className="cell--end">
                      {row.lastConversionDate ? (
                        formatDate(row.lastConversionDate)
                      ) : (
                        <MissingValue
                          text="—"
                          label={`Why ${row.name} has no last conversion date`}
                          explanation="Unknown. No last conversion date is reported for this brand."
                        />
                      )}
                    </td>
                    <td>{row.category}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 ? (
            <div className="brand-table__empty">
              <p className="brand-table__empty-text">No brands match these filters.</p>
              <Button
                onClick={() => {
                  setFilters(NO_FILTERS);
                  setPage(1);
                }}
              >
                Show all brands
              </Button>
            </div>
          ) : (
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filtered.length}
              pageSizes={PAGE_SIZES}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </>
      )}
    </section>
  );
}

function SortHeader({
  column,
  sort,
  onSort,
}: {
  column: Extract<Column, { kind: "sort" }>;
  sort: Sort;
  onSort: (key: SortKey) => void;
}) {
  const active = sort.key === column.key;
  return (
    <th
      scope="col"
      aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      className={column.align === "end" ? "cell--end" : undefined}
    >
      <button type="button" className="header-button" onClick={() => onSort(column.key)}>
        {column.label}
        <Icon
          name={active ? "arrow-down" : "arrow-up-down"}
          className={active && sort.direction === "asc" ? "header-button__icon--asc" : undefined}
        />
      </button>
    </th>
  );
}

function FilterHeader({
  column,
  rows,
  selected,
  onToggle,
  onClear,
}: {
  column: Extract<Column, { kind: "filter" }>;
  rows: BrandRow[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  const options = facetOptions(rows, column.key);
  return (
    <th scope="col">
      <DropdownMenu
        align="end"
        groupLabel={column.groupLabel}
        items={[
          ...options.map((o) => ({
            type: "checkbox" as const,
            key: o.value,
            label: o.label,
            count: o.count,
            checked: selected.includes(o.value),
            onToggle: () => onToggle(o.value),
          })),
          { type: "separator", key: "separator" },
          { type: "action", key: "all", label: "Show all", onSelect: onClear, disabled: selected.length === 0 },
        ]}
        trigger={(props) => (
          <button
            {...props}
            type="button"
            className={selected.length ? "header-button is-filtered" : "header-button"}
            aria-label={`Filter by ${column.label.toLowerCase()}${selected.length ? `, ${selected.length} selected` : ""}`}
          >
            {column.label}
            {selected.length > 0 && ` (${selected.length})`}
            <Icon name="list-filter" />
          </button>
        )}
      />
    </th>
  );
}

/** CVR is null when clicks are null or 0 (data definition). The reason follows from the brand's tracking. */
function cvrMissingReason(row: BrandRow) {
  if (row.clicks === null) return "No conversion rate, because clicks aren't tracked for this brand.";
  if (row.tracking === "voucher")
    return "No conversion rate. This brand tracks discount-code redemptions, which are conversions without clicks.";
  return "No conversion rate, because there were no clicks in this period.";
}

/** A value the data doesn't have, with the info icon explaining why. */
function MissingValue({ text, label, explanation }: { text: string; label: string; explanation: string }) {
  return (
    <span className="cell-info">
      <span className="cell--muted">{text}</span>
      <InfoTooltip label={label} content={explanation} align="end" />
    </span>
  );
}

function CommissionCell({ row }: { row: BrandRow }) {
  const { approved, pending, declined, currency, fxToSEK, totalSEK } = row.commission;
  if (totalSEK === null) return <span className="cell--muted">Not reported</span>;

  const money = (value: number | null) => (value === null ? "Not reported yet" : formatMoney(value, currency));
  const reversals = row.adjustments.filter((a) => a.amount < 0);

  return (
    <span className="cell-info">
      <span className={totalSEK < 0 ? "cell--negative" : undefined}>{formatSEK(totalSEK)}</span>
      <InfoTooltip
        label={`Commission breakdown for ${row.name}`}
        align="end"
        content={
          <div className="breakdown">
            <dl>
              <dt>Approved</dt>
              <dd>{money(approved)}</dd>
              <dt>Pending</dt>
              <dd>{money(pending)}</dd>
              {currency !== "SEK" && (
                <>
                  <dt>Total in SEK</dt>
                  <dd>{formatSEK(totalSEK)}</dd>
                </>
              )}
              <dt className="breakdown__muted">Declined, won't be paid</dt>
              <dd className="breakdown__muted">{money(declined)}</dd>
            </dl>
            {currency !== "SEK" && (
              <p className="breakdown__note">
                Paid in {currency}. Converted at 1 {currency} = {String(fxToSEK).replace(".", ",")} kr.
              </p>
            )}
            {pending === null && <p className="breakdown__note">The total is approved only. Pending is not reported yet.</p>}
            {reversals.map((r) => (
              <p key={r.date + r.reason} className="breakdown__note">
                {formatDate(r.date)}: {formatMoney(r.amount, currency)}, {r.reason}
              </p>
            ))}
          </div>
        }
      />
    </span>
  );
}
