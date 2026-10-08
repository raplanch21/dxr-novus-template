import type { Preview } from "@storybook/nextjs-vite";
import { geistMono, inter } from "../src/app/fonts";
import "../src/app/globals.css";

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div
        className={`${inter.variable} ${geistMono.variable} min-h-screen bg-background p-6 font-sans`}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    a11y: { test: "error" },
    controls: { expanded: true },
    viewport: {
      options: {
        mcpCompact: {
          name: "MCP compact",
          styles: { width: "480px", height: "900px" },
          type: "other",
        },
        mcpMedium: {
          name: "MCP medium",
          styles: { width: "768px", height: "900px" },
          type: "other",
        },
        mcpWide: {
          name: "MCP wide",
          styles: { width: "1000px", height: "900px" },
          type: "desktop",
        },
        nativeWide: {
          name: "Native wide",
          styles: { width: "1200px", height: "900px" },
          type: "desktop",
        },
      },
    },
  },
};

export default preview;
