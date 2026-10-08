# Novus prototype agent contract

Read `DESIGN.md` and `README.md` before changing user-facing UI.

## Reuse before creating

- Use primitives from `src/components/ui` for controls, forms, navigation,
  overlays, feedback, and basic surfaces.
- Review `src/components/dashboard-reference` and its Storybook stories before
  building dashboard, metric, table, status, or visualization UI.
- Compose existing components in project routes. Don't copy their markup into
  route files or create a competing local version.
- Add a new reusable component only when the existing library can't express the
  required behavior. New reusable components must include a focused test and a
  Storybook story.

## Data visualization

- Use `var(--chart-1)` through `var(--chart-9)` for categorical chart series.
- Assign categorical colors in sequence and keep each series color stable
  within a visualization.
- Don't hardcode categorical series colors or substitute semantic status,
  identity, or brand colors.
- Structural neutrals for axes, grids, inactive marks, and white dot outlines
  are allowed when they don't encode a series.
- Project routes must consume approved chart components. Don't import
  `recharts` directly outside `src/components/ui` or
  `src/components/dashboard-reference`.
- Review the Storybook data visualization palette and matching chart stories
  before selecting or creating a chart pattern.

## Verification

Run these checks before handing off UI changes:

```bash
npm run lint
npm test
npm run test:storybook
```
