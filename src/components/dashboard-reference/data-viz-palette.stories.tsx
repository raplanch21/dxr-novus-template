import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import {
  DATA_VIZ_DARK_PALETTE,
  DATA_VIZ_LIGHT_PALETTE,
} from "./data-viz-palette";
import { catalogParameters, type DashboardCatalogContract } from "./story-docs";

const FIGMA_PALETTE_URL =
  "https://www.figma.com/design/CIVBfzmaaeLz1GrmoKg5ss/%E2%9A%A1%EF%B8%8F-Novus?node-id=1757-1220";

const catalogContract = {
  id: "dashboard.data-viz-palette",
  availability: "renderer-owned",
  summary:
    "The renderer-owned categorical chart palette for light and dark dashboard surfaces.",
  useWhen: [
    "The renderer assigns colors to one or more approved chart series.",
  ],
  doNotUseWhen: [
    "Color would encode favorable, unfavorable, warning, or error status.",
    "A chart contains more than nine categorical series.",
  ],
  requiredInputs: ["A stable series identifier for every categorical series."],
  rules: [
    "Use Chart 1 for a single series and assign additional categorical colors in sequence.",
    "Keep each series color stable everywhere that series appears in one dashboard.",
    "Reject a grouped bar chart with more than nine series instead of repeating colors.",
    "Never substitute semantic status colors.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Foundations/Data visualization palette",
  parameters: catalogParameters(catalogContract, {
    sourceDescription: `Source Figma node: [1757:1220](${FIGMA_PALETTE_URL}).`,
  }),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type PaletteEntry = {
  token: string;
  value: string;
};

interface PaletteReferenceProps {
  mode: "dark" | "light";
  palette: readonly PaletteEntry[];
}

function PaletteReference({ mode, palette }: PaletteReferenceProps) {
  return (
    <div
      className={`@container grid gap-6 rounded-lg bg-background p-6 text-foreground ${mode === "dark" ? "dark" : ""}`}
      data-palette-mode={mode}
    >
      <div
        aria-label={`${mode === "dark" ? "Dark" : "Light"}-mode data visualization palette`}
        className="flex flex-wrap gap-1.5"
        role="img"
      >
        {palette.map(({ token }) => (
          <div
            key={token}
            aria-hidden="true"
            className="size-11"
            data-palette-swatch={token}
            style={{ backgroundColor: `var(${token})` }}
          />
        ))}
      </div>

      <ol className="grid gap-3 @[560px]:grid-cols-3" role="list">
        {palette.map(({ token, value }, index) => (
          <li key={token} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-6 shrink-0 rounded-[3px]"
              style={{ backgroundColor: `var(${token})` }}
            />
            <span className="grid">
              <span className="text-[12.64px] leading-[1.5] font-semibold">
                Chart {index + 1}
              </span>
              <span className="font-mono text-[12px] leading-[18px] text-muted-foreground">
                {token} · {value}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function cssColorToRgb(color: string): [number, number, number] {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Canvas context is required to verify palette contrast.");
  }

  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue];
}

function relativeLuminance([red, green, blue]: [number, number, number]) {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(
  foreground: [number, number, number],
  background: [number, number, number],
) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

async function verifyPalette(
  canvasElement: HTMLElement,
  mode: PaletteReferenceProps["mode"],
  palette: readonly PaletteEntry[],
  verifyContrast = false,
) {
  const paletteRoot = canvasElement.querySelector<HTMLElement>(
    `[data-palette-mode="${mode}"]`,
  );

  await expect(paletteRoot).not.toBeNull();
  if (!paletteRoot) return;

  const rootStyles = getComputedStyle(paletteRoot);

  for (const { token, value } of palette) {
    await expect(rootStyles.getPropertyValue(token).trim().toLowerCase()).toBe(
      value,
    );
  }

  if (verifyContrast) {
    const background = cssColorToRgb(rootStyles.backgroundColor);
    const swatches = paletteRoot.querySelectorAll<HTMLElement>(
      "[data-palette-swatch]",
    );

    for (const swatch of swatches) {
      const swatchColor = cssColorToRgb(
        getComputedStyle(swatch).backgroundColor,
      );
      await expect(
        contrastRatio(swatchColor, background),
      ).toBeGreaterThanOrEqual(4.5);
    }
  }
}

export const LightMode: Story = {
  render: () => (
    <PaletteReference mode="light" palette={DATA_VIZ_LIGHT_PALETTE} />
  ),
  play: async ({ canvasElement }) => {
    await verifyPalette(canvasElement, "light", DATA_VIZ_LIGHT_PALETTE);
  },
  parameters: {
    docs: {
      description: {
        story:
          "Canonical light-mode sequence for categorical chart marks and single-series defaults.",
      },
    },
  },
};

export const DarkMode: Story = {
  render: () => (
    <PaletteReference mode="dark" palette={DATA_VIZ_DARK_PALETTE} />
  ),
  play: async ({ canvasElement }) => {
    await verifyPalette(canvasElement, "dark", DATA_VIZ_DARK_PALETTE, true);
  },
  parameters: {
    docs: {
      description: {
        story:
          "Perceptually adapted dark-mode sequence preserving light-palette identity with at least 4.5:1 contrast against the app dark canvas.",
      },
    },
  },
};
