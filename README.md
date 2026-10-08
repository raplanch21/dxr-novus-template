# DXR Novus template

A reusable foundation for building Novus product prototypes without carrying
forward existing prototype routes or data.

## Get started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `DESIGN.md` defines the product, copy, visual, and component standards.
- `src/components/ui` contains the complete configured shadcn component library.
- `src/components/dashboard-reference` contains reusable charts, metrics, tables,
  status patterns, tests, fixtures, and Storybook stories.
- `src/components/app-shell.tsx` provides the shared Novus application frame.
- `src/app/projects` is the home for isolated prototype routes.

Use shared shadcn primitives for controls, forms, overlays, navigation,
feedback, and basic surfaces. Develop reusable dashboard and visualization
patterns in Storybook.

## Commands

```bash
npm run lint
npm test
npm run storybook
npm run build-storybook
npm run build
```

This folder is intentionally not initialized as a Git repository. Initialize
one when you’re ready to manage the template as an independent project.
