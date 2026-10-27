import { useState } from "react";
import type { PartnerOverview } from "../data/types";
import { formatDate } from "../data/format";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import "./FilterBar.css";

interface Filters {
  dateRange: string;
  groupBy: string;
  channel: string;
}

const DEFAULTS: Filters = { dateRange: "current", groupBy: "program", channel: "all" };

const same = (a: Filters, b: Filters) =>
  a.dateRange === b.dateRange && a.groupBy === b.groupBy && a.channel === b.channel;

/**
 * Date range, Group by and Channel. Changes are a draft until Apply, so Apply is only enabled when the
 * draft differs from what's applied, and Reset only when something differs from the defaults.
 * The case data covers one period and has no per-channel split, so applying doesn't change the numbers
 * yet (see README).
 */
export function FilterBar({ data }: { data: PartnerOverview }) {
  const { period, partner } = data;
  const [applied, setApplied] = useState(DEFAULTS);
  const [draft, setDraft] = useState(DEFAULTS);

  const canApply = !same(draft, applied);
  const canReset = !same(draft, DEFAULTS) || !same(applied, DEFAULTS);
  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <form
      className="filter-bar"
      aria-label="Page filters"
      onSubmit={(e) => {
        e.preventDefault();
        setApplied(draft);
      }}
      onReset={(e) => {
        e.preventDefault();
        setDraft(DEFAULTS);
        setApplied(DEFAULTS);
      }}
    >
      <div className="filter-bar__fields">
        <Dropdown
          label="Date range"
          title={`${formatDate(period.from)} – ${formatDate(period.to)}`}
          value={draft.dateRange}
          onChange={set("dateRange")}
          options={[{ value: "current", label: period.label }]}
        />
        <Dropdown
          label="Group by"
          value={draft.groupBy}
          onChange={set("groupBy")}
          options={[{ value: "program", label: "Program ID" }]}
        />
        <Dropdown
          label="Channel"
          value={draft.channel}
          onChange={set("channel")}
          options={[
            { value: "all", label: "All channels" },
            ...partner.channels.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
      </div>
      <div className="filter-bar__buttons">
        <Button type="submit" disabled={!canApply}>
          Apply
        </Button>
        <Button type="reset" variant="destructive" disabled={!canReset}>
          Reset
        </Button>
      </div>
    </form>
  );
}
