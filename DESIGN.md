# DESIGN.md - Novus Generative Dashboard
*AI-generated executive dashboard for proactive product health monitoring without manual setup.*

---

## Product Brief
Novus is a product intelligence system that scans a codebase, instruments tracking, and helps product builders monitor behavior signals and address issues proactively. The dashboard is designed for fast executive comprehension first, then immediate diagnostic guidance and next-best actions. The interface must surface signal quality, instrumentation readiness, and risk posture without requiring users to know which metrics to configure or which questions to ask.

---

## Design Principles
1. Readability beats density: every section should be scannable in under 10 seconds.
2. Narrative over raw metrics: each chart or metric block must explain what changed and why it matters.
3. Actionable by default: when signal quality is weak, the UI must suggest the next concrete step.
4. Status language is consistent: instrumentation, activity, and funnel readiness states should never conflict.
5. Calm, analytical tone: visual treatment stays neutral and avoids decorative emphasis.

---

## Color Tokens
```yaml
surface:
  page: "#FFFFFF" # Primary dashboard canvas. Keep backgrounds flat and neutral for reading-heavy content.
  card: "#FFFFFF" # Metric cards, chart containers, and spotlight menus. Avoid tinted card backgrounds in default state.

text:
  primary: "#0A0A0A" # Main narrative and section headings. Use for high-priority reading paths only.
  secondary: "#2A2C35" # Control labels and medium-emphasis metadata.
  muted: "#737373" # Eyebrow labels, timestamps, and supporting context only; never primary conclusions.

border:
  subtle: "#E5E5E5" # Standard separators and card boundaries.
  strong: "#DADCE5" # Dense table/grid outlines when structural grouping is required.

status:
  positive-bg: "#E3F7ED" # Favorable filled trend-tag background on dashboard detail and directory List/Product surfaces.
  positive-on-bg: "#005027" # Text on a favorable filled trend tag.
  positive-fg: "#007A3D" # Favorable text-only delta in Agent Grid cards; maintains WCAG AA contrast on white.
  negative-bg: "#FFE8D2" # Unfavorable filled trend-tag background on dashboard detail and directory List/Product surfaces.
  negative-on-bg: "#8E0B00" # Text on an unfavorable filled trend tag.
  negative-fg: "#B42318" # Unfavorable text-only delta in Agent Grid cards; maintains WCAG AA contrast on white.
  neutral-bg: "#F5F5F5" # Warm neutral filled trend-tag background on dashboard detail and directory List/Product surfaces; keep #E5E5E5 for borders.
  neutral-on-bg: "#2A2C35" # Text on a neutral filled trend tag.
  neutral-fg: "#5F626B" # Neutral text-only delta in Agent Grid cards; maintains WCAG AA contrast on white.
  open-bg: "#DBEAFE" # Open workflow status background, matched to the product's blue badge.
  open-on-bg: "#193CB8" # Open workflow status text; maintains WCAG AA contrast on open-bg.
  needs-decision-bg: "#FEF3C6" # Needs decision workflow status background, matched to the product's yellow badge.
  needs-decision-on-bg: "#973C00" # Needs decision workflow status text; maintains WCAG AA contrast on needs-decision-bg.
  # Boundary: dashboard detail, directory List view, and Product overview use filled semantic tags. Only Agent cards in directory Grid view use foreground-only deltas. Open and Needs decision colors are reserved for explicit workflow-status labels. Status colors are semantic only; never use them decoratively in charts, page chrome, or headings.

identity:
  blue-bg: "#E8EEF8"
  blue-fg: "#254A7C"
  violet-bg: "#F1EAF6"
  violet-fg: "#69417A"
  teal-bg: "#E7F3F2"
  teal-fg: "#25645F"
  amber-bg: "#F7EFE3"
  amber-fg: "#80542E"
  rose-bg: "#F7EAEF"
  rose-fg: "#7A3F58"
  # Boundary: identity colors provide stable recognition cues for named dashboards or agents. Never use them to imply health, trend, urgency, or status.

data_viz_light:
  chart-1: "#454453" # Default single-series color and first categorical series.
  chart-2: "#26968D"
  chart-3: "#E38A3F"
  chart-4: "#25508D"
  chart-5: "#C74E7E"
  chart-6: "#73B8C3"
  chart-7: "#763880"
  chart-8: "#368951"
  chart-9: "#9F9399"
  # Apply categorical colors in order and keep each series color stable within a visualization.
  # Boundary: use this sequence only on light surfaces.

data_viz_dark:
  chart-1: "#858495" # Default single-series color and first categorical series.
  chart-2: "#50B8AF"
  chart-3: "#F59B51"
  chart-4: "#5F8DCF"
  chart-5: "#F073A1"
  chart-6: "#7FC5D0"
  chart-7: "#B371BD"
  chart-8: "#61B378"
  chart-9: "#B6AAB0"
  # Perceptually adapted from the light palette by preserving hue, chroma, and relative lightness hierarchy. Every color maintains at least 4.5:1 contrast against the app dark canvas, oklch(0.145 0 0).
  # Boundary: use this sequence only on dark surfaces. Across both modes, chart colors encode series identity only; never use semantic status colors as chart-series colors.
```

---

## Typography
```yaml
display_editorial:
  family: "Instrument Serif"
  style: "italic"
  size: "clamp(44px, 8vw, 88px)"
  weight: 400
  line_height: 1.05
  letter_spacing: "0em"
  usage: "Editorial hero titles on dedicated landing experiences, such as the Daily brief masthead. One per page. Never use in dashboard sections, cards, tables, metrics, or UI controls."

display_h3:
  family: "Inter"
  size: "22.78px"
  weight: 600
  line_height: 1.3
  usage: "Primary dashboard state headlines and section anchors. One dominant headline per section."

section_title:
  family: "Inter"
  size: "18px"
  weight: 600
  line_height: "24px"
  usage: "Numbered section headings (e.g., Instrumentation coverage, Funnel readiness)."

subsection_title:
  family: "Inter"
  size: "16px"
  weight: 600
  line_height: "24px"
  usage: "Grouped content headings within a page, below the 18px app page title. Use for categories such as Product overview and Agent overview."

body_base:
  family: "Inter"
  size: "14.22px"
  weight: 400
  line_height: 1.5
  usage: "Narrative analysis paragraphs and explanatory copy. Default paragraph style."

body_base_semibold:
  family: "Inter"
  size: "14.22px"
  weight: 600
  line_height: 1.5
  usage: "Short conclusions, key takeaways, and summary row labels."

body_small:
  family: "Inter"
  size: "12.64px"
  weight: 400
  line_height: 1.5
  usage: "Secondary metadata like timestamps, notes, and compact helper text."

body_small_semibold:
  family: "Inter"
  size: "12.64px"
  weight: 600
  line_height: 1.5
  usage: "Badge text and compact inline labels that need emphasis without becoming headings."

metric_label:
  family: "Inter"
  size: "12px"
  weight: 500
  line_height: "16px"
  transform: "none"
  usage: "Sentence-case KPI and metric names above compact values. Keep labels muted and visually secondary to their values."

eyebrow:
  family: "Inter"
  size: "12px"
  weight: 500
  line_height: "18px"
  letter_spacing: "0.3px"
  transform: "uppercase"
  usage: "Contextual framing labels only; never metric or KPI names."

section_number:
  family: "Geist Mono"
  size: "12px"
  weight: 400
  line_height: "18px"
  letter_spacing: "0.3px"
  usage: "Numeric section markers only. Geist Mono is reserved for numbers and must not style adjacent labels."

metric_value_large:
  family: "Geist Mono"
  size: "32px"
  weight: 700
  line_height: "30px"
  usage: "Top-row KPI values only. Do not use for paragraph or table content."

metric_value_compact:
  family: "Geist Mono"
  size: "22px"
  weight: 700
  line_height: 1.2
  usage: "Compact metric grid values in dense summary blocks."
```
Geist Mono is reserved for numeric content: metric values, quantities, deltas, chart and table numbers, and numeric section markers. Use Inter for words, labels, dates, timestamps, IDs, and other text, even when those strings contain digits.

---

## Spacing
```yaml
base_unit: 4px # Core spacing rhythm.
scale:
  - 4px   # Tight chip internals and text/icon micro-gaps.
  - 8px   # Small component gaps and row paddings.
  - 12px  # Card content separation and control group spacing.
  - 16px  # Standard card/body padding.
  - 24px  # Section internals, table rows, and high-readability spacing.
  - 32px  # Separation between section header and content.
  - 36px  # Left-label to content gutter in analysis sections.
```
When in doubt, add breathing room before adding visual decoration; this product serves interpretation under ambiguity, and cramped layouts read as noise.

---

## Components
Buttons should communicate hierarchy through containment, not color saturation. Use outlined neutral buttons for global actions like refresh and "Edit with Novus", and preserve one clear primary intention per local context. If two actions compete ("Edit" and "Ask"), keep visual parity and let placement order imply the default flow.

Interactive controls must always use Lucide icons when an icon is needed (buttons, menus, toggles, dropdown options, and inline action affordances). Do not mix icon sets within the dashboard. One exception: a button that hands work off to a third-party service, such as "Open in Gmail", may use that service's official logo at icon size in its full brand colors. Use it only when the button names the service, and never as decoration elsewhere.

Every clickable element must communicate interactivity with pointer cursor behavior (`cursor: pointer` / `cursor-pointer`) in addition to its visual styling.

### Component and visualization enforcement

- Product UI must compose the configured primitives in `src/components/ui`.
  Review the existing library before creating local control, form, navigation,
  overlay, feedback, or surface markup.
- Dashboard and visualization UI must reuse patterns from
  `src/components/dashboard-reference`. Review the matching Storybook stories
  before selecting or creating a pattern.
- New reusable components must include a focused test and a Storybook story.
- Categorical chart marks must use `var(--chart-1)` through
  `var(--chart-9)`. Assign colors in sequence and keep each series stable
  within a visualization.
- Never hardcode categorical series colors. Hardcoded neutral colors are
  allowed only for non-series structure such as axes, grids, inactive marks,
  and white mark outlines.
- Project routes must not import `recharts` directly. Chart implementation
  belongs in `src/components/ui` or `src/components/dashboard-reference`.

Dashboard metric cards are for top-level health orientation, not deep investigation. Each card should contain a compact sentence-case metric label, one dominant value, an optional trend delta, one explanatory sentence, and timeframe metadata. If users need more than one sentence to understand a metric, move that context to the section analysis area below.

Section headers (number + title) anchor narrative progression. Use them when introducing a new diagnostic dimension such as coverage, page activity, or funnel readiness. The left number is an orientation cue, not a progress bar; never encode success/failure in that number styling.

The recommendation strip is mandatory when confidence is low or data quality is suspect. It should always pair a concise diagnosis with a concrete next-best action in the same viewport. If the diagnosis cannot produce action, rewrite the diagnosis until an operator can act immediately.

Trend deltas encode favorable, unfavorable, or neutral movement. Dashboard detail, directory List view, and Product overview use compact filled semantic tags; only Agent cards in directory Grid view use brighter foreground-only deltas. Keep the numeric sign visible, preserve explicit semantic tone when direction alone is ambiguous, and provide a non-color cue for assistive technology. Product overview keeps sentence-case Inter metric labels stacked above Geist Mono numeric values so the lead card remains visually continuous with the established product summary.

Large analytical sections should use a two-column pattern: evidence container on the left (chart/table) and narrative interpretation on the right. This keeps executive readability high while preserving analyst depth. If horizontal space is constrained, preserve narrative before preserving chart complexity.

General usage metric grids are for breadth snapshots across segments. Keep row and column structure stable so users can compare cells by position. If a metric card needs a caveat longer than a label, promote that caveat to a summary sentence above the grid.

Dashboard tables are for structurally comparable rows. Use the ranked variant only for an ordered label/value comparison and preserve the input order; use the records variant only for paired identifiers, timestamps, or compact metadata. A records summary must render a labeled aggregate, not a bare number, and must share the rows' filters and measured period. When only recent records are visible, state the visible count and provide View all only when the aggregate exceeds that count. Format primary timestamps for people, keep shortened identifiers secondary, and preserve access to the complete identifier. Keep compared values and secondary record metadata right-aligned, use Geist Mono only for numeric values, and use Inter for identifiers and timestamps. Retain explicit row dividers. Table loading and transport errors belong to the parent surface, not to table variants.

Dashboard status lists are for narrative health or readiness assessments where the explanation matters more than numeric comparison. Each row must contain a concise title, one-sentence description, and one visible status label: healthy, watch, or attention. Status meaning must never depend on color alone. Do not use a status list for ranked values or record metadata; select the matching dashboard table variant instead. Status-list loading and transport errors also remain parent-owned.

---

## Copy & Casing
All UI copy uses sentence case: capitalize only the first word and any proper nouns. This applies everywhere text appears — headlines, section titles, metric and KPI labels, buttons, menu items, table column headers, chart titles, badges, tooltips, and helper text. Sentence case keeps the interface calm and reading-first, and reserves emphasis for hierarchy and semantic status rather than capitalization.

Proper nouns stay capitalized: the product name (Novus), tracked page/feature/event names (Sign In, Overview, Product Knowledge, AI Chat, Goals, Launches, Guides, MCP Setup, Session Replay), named Pendo categories (Visitor Activity, Account Activity, Frustration Signals), and acronyms (ID, AI, MCP, NPS). Do not Title-Case a label just because it names a metric or action — write "Overview activation rate", not "Overview Activation Rate". The eyebrow style already handles uppercase framing labels via `text-transform`; never hard-code uppercase or Title Case into the copy itself.

---

## Diagnostic Loop
After updates, run a three-pass generation test on the most complex Novus dashboard state: one pass for "no traffic", one for "mixed signal quality", and one for "healthy traffic with one regression". Track where the output violates readability or semantic status rules, then tighten this file's boundaries rather than patching screens ad hoc.

---

## Explicit Donts
```text
- No gradients in dashboard UI surfaces, buttons, chips, charts, status indicators, or callouts. The Daily brief masthead may use a decorative, non-semantic gradient inside its decorative banner artwork only. Version B's new tab page may show the same Pulse artwork as a faint background band behind its greeting, never behind reading content.
- No more than one primary recommendation per section.
- No status color usage outside semantic indicators (trend text, explicit status text, critical state callouts).
- No chart-only conclusions; every chart must have adjacent narrative interpretation.
- No dense data block without a one-sentence executive summary nearby.
- No critical diagnostic information hidden behind hover, tooltip, or overflow menu.
- No full-width action button rows on desktop dashboard sections.
- No contradictory states across sections (e.g., "ready" and "blocked" for the same capability).
- No Title Case in UI copy; use sentence case only, capitalizing just the first word plus proper nouns and acronyms.
```
