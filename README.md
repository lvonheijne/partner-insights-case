# Partner Overview – Insights page

Task 4 of the design case, extended to the whole screen: the Insights page from the Figma file (sidebar,
header, banner, filter bar, KPI cards and the brand table) built on Sara's data and the file's tokens and
components. The brand table has sorting, category and status filters in the column headers, and
pagination. Vite, React and TypeScript, with no other dependencies.

## Run it

You need Node.js 20 or later.

```bash
npm install
npm run dev
```

Below the table there's a "Demo" checkbox, which isn't part of the design. It removes every brand from
Sara's data so you can see the empty state. Nothing else in her data changes.

## Structure

Each Figma component exists once in code, and the page is built from them. Components only use semantic
tokens. There are no hex values, pixel sizes or font sizes outside `src/styles/tokens.css`.

| Figma | Code |
| --- | --- |
| Button (default, destructive) | `components/Button.tsx` |
| menu-items, primary-menu | `components/Sidebar.tsx` |
| dropdown | `components/Dropdown.tsx`, a labelled native `<select>` |
| Dropdown Menu | `components/DropdownMenu.tsx`: header filters and the mobile "Actions" menu |
| badge | `components/StatusBadge.tsx` |
| card | `components/KpiCard.tsx` |
| table (header and body cells) | `components/BrandTable.tsx` + `.css` |
| Info icon | `components/Tooltip.tsx` (`InfoTooltip`) |
| Notification Banner | `components/Banner.tsx` |
| Icons (arrow-up-down, arrow-down, arrow-up, list-filter, info, chevron-down), logo | `assets/`, rendered by `components/Icon.tsx` |
| Table footer | `components/Pagination.tsx` |

| Data | What it does |
| --- | --- |
| `data/rows.ts` | Brand → table row (SEK total, CVR), sorting, header filter options. |
| `data/kpis.ts` | Totals for the period and the previous 30 days, and the change between them. |
| `data/status.ts` | Status → label and badge colour, with a fallback for unknown statuses. |
| `data/format.ts` | Number, currency and date formatting. |
| `data/load.ts` | Sara's data, plus the same data with no brands. |

## Decisions

**Filters live in the column header.** Category and Status have the list-filter icon. Clicking it opens
the Dropdown Menu with a checkbox and a count for each value in the data, and "Show all" at the bottom.
They filter only the table, not the KPI cards, so they belong with the table rather than in the page
filter bar. The header shows how many values are selected ("Status (2)"). The list only shows values
that exist, so a status the API adds later, like Sara's `suspended`, appears automatically. If no brand
matches, the table says so and offers "Show all brands".

**Sorting.** Brand and every number column sort. One click sorts (numbers and dates highest or newest
first, brand A–Z), and a second click reverses it. The Clarity heatmaps show rage clicks on the headers,
so people already expect this. Unknown values (`null`) always sort last in both directions. Each header
has `aria-sort`, and a hidden live region announces the change.

**Pagination.** 10 rows per page by default, with 10, 25 or 50 to choose from. "Showing 1–10 of 31" on
the left, as in Figma. Up to 7 pages are all listed; with more, "…" appears. Sorting, filtering and
changing the page size go back to page 1.

**Commission.** Approved + pending, converted to SEK with `fxToSEK` before summing or sorting. The info
icon next to each amount shows approved, pending and declined in the brand's own currency, the exchange
rate for NOK brands, and any reversals from `adjustments`. When pending is `null` (Hotellhjälpen), the
total is approved only and the breakdown says so. That's my choice of how to compute it, not something
the data states.

**KPI cards are calculated from the data.** Order as in the 1440 frame:

- **Commission:** approved + pending in SEK.
- **Unique clicks:** brands with `null` clicks aren't counted.
- **Conversions:** approved + pending.
- **CVR:** total conversions ÷ total clicks, using only brands that have clicks.

The pill compares with the previous 30 days, summed from each brand's `previousPeriod`. Brands without
one count as 0, because the partnership didn't exist yet. The change is relative, so CVR "Up 1,4 %" means
1,4 % higher, not 1,4 percentage points.

The Figma numbers turned out to be real data. Clicks (65 072) and conversions (1 278) match exactly. The
frame's commission of 481 042,25 kr is 4 762,50 kr higher than mine, which is exactly what you get by
adding the NOK amounts as if they were SEK. The frame's CVR (2,04 %) is labelled "average per brand"; I
show the overall rate (1,84 %) instead, because an average of rates gives a brand with 85 clicks the same
weight as one with 18 532.

**The filter bar shows real values but doesn't filter.** The data has one period and no split by channel:

- **Date range:** shows "Last 30 days", with the dates on hover.
- **Group by:** "Program ID", as in Figma.
- **Channel:** "All channels" plus Sara's three channels from the data.
- **Export, Create link, Add channel:** not wired to anything.

**Apply and Reset are disabled until there's something to do.** Changes in the filter bar are a draft
until Apply. Apply is enabled only when the draft differs from what's applied, and Reset only when
something differs from the defaults. Clarity shows people change the date range and never press Apply.
An Apply button that lights up the moment something changes should make that step visible. Applying
updates the applied state but doesn't change the numbers yet, because the data has nothing to filter by.
Figma's Button has no disabled variant, so the disabled colours are new tokens (see Tokens).

**Missing values explain themselves.** "Not tracked" in Clicks, and "—" in CVR and Last conversion, each
have the info icon. Its explanation follows from the data definitions:

- **Clicks, Not tracked:** clicks aren't tracked for this brand, for example some app installs.
- **CVR, —:** the reason depends on the brand:
  - Clicks aren't tracked.
  - Discount-code tracking, where conversions come without clicks (Gröna Kassen).
  - No clicks in the period (Pluggpaketet, Resfeber Charter).
- **Last conversion, —:** unknown, no date is reported (the data says null means unknown).

**Not taken from the data, so labelled or removed.**

- **Taken from the data or its `definitions`:**
  - "Not tracked" (null clicks)
  - "Declined, won't be paid"
  - "Not reported yet" (null pending)
  - "—" for a missing CVR or a missing last-conversion date (null means unknown)
  - Market suffix "(NO)", needed because Kreditkollen is in both SE and NO
  - The partner's name, company and channels
- **My wording, restating the data definitions without adding anything:** the KPI info tooltips.
- **From the Figma frame, not the data:**
  - The banner text
  - The nav labels
  - "Program ID"
  - "Welcome back … Here's how your brands are doing."
- **The empty state** says only "No brands yet. Brands you partner with show up here."
- **Removed from the previous version:**
  - A made-up new partner
  - Timing claims like "numbers show up within a day"
  - A "Find brands" link with nowhere to go

**One grid for filters and KPI cards.** The filter bar uses the same four columns and gap
(`--space-grid-gap`) as the KPI cards, so each dropdown sits exactly above a card and Apply/Reset sits
above the fourth. At 1440 the columns start at 264, 554, 844 and 1134 px, as in the frame. At 720 the
three dropdowns and the 2 × 2 cards match the 720 frame to the pixel. They can't share a grid there,
because the frame puts 3 dropdowns over 2 cards.

**Responsive.**

- **From 1280 px:** the 1440 layout.
- **Below 1280:** the filter buttons wrap under the dropdowns and the KPI cards go 2 × 2 (as at 720).
- **Below 720:** everything stacks. The three page buttons become one "Actions" menu and the banner drops
  the NEW tag (as at 360).
- **The table** scrolls sideways at every width where it doesn't fit, with the Brand column sticky.

**Sidebar.** Full width from 1024 px. Below that it's the blank 48 px strip from the 720 and 360 frames.
A menu button and an overlay that open the navigation there are **out of scope because of the case's
time limit**. They need an icon and an overlay pattern that aren't in the Figma file. Until then the nav
can't be reached below 1024 px.

## Where code and Figma differ

The Figma file disagrees with itself in a few places. I followed the 1440 frame.

- **KPI order:** 1440 has Commission first, while 720 and 360 have it third. Code uses the 1440 order
  everywhere.
- **Info icons in the table:** 720 and 360 have one on every number, 1440 only on Commission. Code has
  them on Commission only, where there's a breakdown to show.
- **Row colours:** 720 and 360 alternate row colours, 1440 doesn't. Code doesn't.
- **Brand column at 360:** it's collapsed to 1 px in the frame. Code keeps it sticky, because the rows
  mean nothing without the name.
- **Leftover formatting in the table:** some rows are bold, and the numbers mix "1,350" and "12 750 kr".
  Code uses no bold and Swedish formatting throughout.

## Tokens

`src/styles/tokens.css` has the primitives first, then semantic tokens. Names follow the Figma variables
(`space/cell-x` → `--space-cell-x`). Tokens marked `code only` have no Figma variable yet:

- **Added from Figma:**
  - `primary-blue/600` (#051151)
  - `button/primary-bg` (#051151, button and menu hover)
  - `primary-blue/300`
  - `text/inverse-subtle`
  - `surface/table-bg`
  - The text styles: heading 1, heading 2, body, table header, table body, label
- **Fixed:** the inherited `--button-primary-bg` was #0d1e79. Figma's `button/primary-bg` is #051151, and
  the code now matches Figma.
- **Code only, to add in Figma:**
  - Semantic names where Figma uses a primitive directly:
    - `surface/nav-bg`, `surface/nav-item-active-bg`, `surface/nav-item-hover-bg`
    - `surface/avatar-bg`, `text/avatar`
    - `surface/selected-bg` (the current page uses `border/focus` as a fill)
    - `surface/table-header-bg` (uses `status/neutral-bg`)
  - Layout spacing, each aliasing the `size/space` scale:

    | Token | Size | Use |
    | --- | --- | --- |
    | `space/page` | 32 | Page padding |
    | `space/section` | 24 | Between page sections |
    | `space/grid-gap` | 16 | Filter and KPI columns |
    | `space/button-group` | 12 | Between buttons |
    | `space/field-gap` | 4 | Label to control |
    | `space/heading-gap` | 8 | Title to the line under it |

  - Sizes: icon, avatar, menu, sidebar and brand-name width, plus z-index and `opacity/disabled`.
  - `button/disabled-bg` and `button/disabled-fg`, because Figma's Button has no disabled variant.
- **Changed on purpose:**
  - **Reset** uses `--text-danger` (red/800) instead of red/600, following the file's own rule that 600
    is too light for text on white (3.4:1).
  - **Off-scale font sizes** are snapped to the scale: menu items 15 → 14, avatar initials 13 → 12, NEW
    tag 11 → 12, rows per page 13 → 12.
  - **The pagination arrows** are the chevron icon instead of the ‹ › characters.
  - **Gap between buttons:** Figma uses 12 between the page buttons but 16 between Apply and Reset. Both
    now use `space/button-group` (12).
  - **Brand names** truncate at 144 px, so all eight columns fit at 1440 with real categories and the
    info icons. Figma's `<Category>` placeholder was shorter than the real values.
- **Icons** are the exported Figma SVGs, unchanged. They're drawn as a CSS mask, so their colour comes
  from tokens instead of the colours baked into the files. One of those baked-in colours is `#57534E`
  (`unofficial/mid alt`) on the sort arrow; another is `#1E1E1E` (`sds-color-icon-default-default`) on the
  chevron.

Still to fix in Figma:

- `status/succes-bg` and `status/succes-fg` are missing an "s". CSS uses `success`.
- The Dropdown Menu comes from a shadcn "Nova" kit. It uses that kit's variables (`shadcn-colors/general/*`,
  Geist for the counts, `--xs`, `--radius-md`) instead of ours. Code maps them to our tokens.
- The badge has no variant for unknown statuses. Code uses the neutral (Ended) colours with the status
  name, e.g. "Suspended".
- Remove `unofficial/mid alt` and the `sds-color-*` leftovers.

## What I'd do next

- Build the menu button and overlay for the sidebar below 1024 px.
- Wire the filter bar and page buttons to real data, and keep table sort, filters and page in the URL.
  Clarity shows people reload this page.
- Show each brand's change from the previous period, to answer "what changed, and why?".
- Write unit tests for `sortRows`, `toRows` and the KPI totals, covering nulls, negative commission, NOK
  and unknown statuses.
- Test the menus and tooltips with a screen reader. So far I've only checked them with the keyboard.

## How I used AI

**Task 1, prioritization.** I used AI to synthesise my own observations of the screen together with the
feedback in the brief, and to challenge my prioritization: arguing against my first pick and pointing
out what I was leaving out. The prioritization and its reasoning are mine.

**Task 2, cleaning up the system.** No AI. Restructuring the Figma file, the variables and the three
components was manual work. It took longer than planned and cut into the time I had for task 3.

**Tasks 3 and 4, the page and the code.** I moved back and forth between Figma and Claude, mostly
iterating on the filtering and sorting interactions: designing in Figma, building and testing it in code,
then adjusting the design. I ran out of time, so I spent less time on ideation and exploring alternatives
than I wanted to. That's the first thing I'd go back to.

For the code I worked with Claude Code (Claude Opus) in the Claude desktop app, connected to the Figma file
through the Figma MCP server.

- **Reading the brief and the file.** Claude read the brief, the data and my frames, listed what the frames
  didn't cover yet, and asked me questions before writing any code. I made those calls: the filter pattern,
  the sort interaction, how to show commission, scope, how the KPIs are calculated, how the filter bar
  behaves, empty states and the sidebar.
- **Design to code.** Claude pulled spacing, text styles, variables and icons from each Figma component and
  frame through the MCP server, so the code uses the same names as the file. That also surfaced the token
  and component problems listed above, and the KPI check against the data.
- **Demo states.** Claude built the demo states for checking how the page behaves before there's data. The
  first version invented a new partner. After the audit below, only one is left: Sara's real data with the
  brands removed.
- **Keeping it honest.** I asked Claude to audit what came from the data and what it had made up. That
  removed the invented partner and unsupported copy, and produced the list in this README.
- **Checking.** Claude checked the page in a browser at 1440, 720 and 360 px: sorting, both header filters,
  pagination and page size, the no-match and no-brands states, the tooltips, and no sideways page scroll.
  It also searched the CSS for hard-coded values.

**Where I steered or overrode it.**

- Claude's first version put the status filter above the table. I moved it, and a new category filter,
  into the column headers. The filters only change the table, so they belong with it, not next to the page
  filters that change everything.
- Claude suggested dropping pagination and showing all 31 rows. I kept the paginated footer from the design.
- I asked for the whole screen instead of only the table, and for stricter use of tokens and components.
- After reviewing it in the browser I asked for:
  - the filter bar and KPI cards to share one grid,
  - Apply and Reset to stay disabled until there's a change, to make the Apply step visible,
  - explanations for "Not tracked" and "—" in the table.
