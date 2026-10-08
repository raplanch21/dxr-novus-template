import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";

import { DashboardTable } from "./dashboard-table";
import { rankedTableRows, recordTableRows } from "./fixtures";
import {
  catalogParameters,
  type DashboardCatalogContract,
  storyDescription,
} from "./story-docs";

const tableCatalogContract = {
  id: "dashboard.table",
  availability: "selectable",
  summary:
    "A structured dashboard data panel with ranked-comparison and record-collection variants.",
  useWhen: [
    "Use ranked for an ordered comparison with one label and one value per row.",
    "Use records for a collection where each row pairs a primary identifier or timestamp with secondary metadata.",
  ],
  doNotUseWhen: [
    "The content is a narrative health assessment; use DashboardStatusList.",
    "The content needs more than the approved row fields or interactive data-grid behavior.",
  ],
  requiredInputs: [
    "variant: ranked or records.",
    "A concise title and one-sentence description.",
    "Stable row IDs and the fields required by the selected variant.",
  ],
  optionalInputs: [
    "Ranked only: a row-selection callback and header action.",
    "Records only: a total, item label, view-all callback, and row-selection callback.",
    "A specific empty-state message.",
  ],
  rules: [
    "Choose the variant from the row structure, never from the fixture topic.",
    "Keep ranked values right-aligned and preserve the input order.",
    "Use record rows for compact identifiers, timestamps, or other paired metadata.",
    "When records are a subset, keep the summary and rows on the same measured scope and state how many recent records are shown.",
    "Label record totals and expose View all only when the total exceeds the visible rows.",
    "Keep loading and transport errors at the parent level.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Components/Table",
  component: DashboardTable,
  args: {
    variant: "ranked",
    title: "Top pages by visitors",
    description: "Pages ordered by unique visitors during the measured period.",
    rows: rankedTableRows,
  },
  parameters: catalogParameters(tableCatalogContract),
} satisfies Meta<typeof DashboardTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ranked: Story = {
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Use for a static ordered comparison when rows do not open another surface.",
        ),
      },
    },
  },
};

export const RankedInteractive: Story = {
  args: {
    headerAction: {
      label: "Table",
      onClick: fn(),
    },
    onRowSelect: fn(),
  },
  play: async ({ args, canvas }) => {
    if (args.variant !== "ranked") {
      throw new Error("RankedInteractive requires the ranked table variant.");
    }

    const headerAction = canvas.getByRole("button", { name: "Table" });
    const firstRowAction = canvas.getByRole("row", {
      name: "Open Overview details",
    });

    await userEvent.tab();
    await expect(headerAction).toHaveFocus();
    await userEvent.click(headerAction);
    await userEvent.tab();
    await expect(firstRowAction).toHaveFocus();
    await userEvent.click(firstRowAction);

    await expect(args.headerAction?.onClick).toHaveBeenCalledTimes(1);
    await expect(args.onRowSelect).toHaveBeenCalledWith(rankedTableRows[0]);
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Use ranked row disclosure only when each row has a defined detail destination; the visible header action is optional.",
        ),
      },
    },
  },
};

export const RecordsWithSummary: Story = {
  args: {
    variant: "records",
    title: "Rage-click sessions",
    description: "June 14 to July 14, 2026",
    summary: {
      total: 43,
      label: "sessions",
      onViewAll: fn(),
    },
    rows: recordTableRows,
    onRowSelect: fn(),
  },
  play: async ({ args, canvas }) => {
    if (args.variant !== "records") {
      throw new Error("RecordsWithSummary requires the records table variant.");
    }

    await userEvent.click(
      canvas.getByRole("row", {
        name: "Open Aug 6, 2026, 2:57 PM details",
      }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "View all sessions" }),
    );

    await expect(args.onRowSelect).toHaveBeenCalledWith(recordTableRows[0]);
    await expect(args.summary?.onViewAll).toHaveBeenCalledTimes(1);
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Use for compact record collections with paired metadata and an optional collection summary.",
        ),
      },
    },
  },
};

export const RecordsCompleteSummary: Story = {
  args: {
    variant: "records",
    title: "Rage-click sessions",
    description: "June 14 to July 14, 2026",
    summary: {
      total: 1,
      label: "session",
      onViewAll: fn(),
    },
    rows: recordTableRows.slice(0, 1),
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "A complete collection keeps the labeled total but omits partial-list and view-all copy.",
        ),
      },
    },
  },
};

export const RecordsWithoutSummary: Story = {
  args: {
    variant: "records",
    title: "Recent sessions",
    description: "June 14 to July 14, 2026",
    rows: recordTableRows,
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Legacy-compatible records collection when no trustworthy aggregate is available.",
        ),
      },
    },
  },
};

export const RecordsZeroSummary: Story = {
  args: {
    variant: "records",
    title: "Rage-click sessions",
    description: "June 14 to July 14, 2026",
    summary: {
      total: 0,
      label: "sessions",
    },
    rows: [],
    emptyMessage: "No rage-click sessions were found.",
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "A known zero remains visible as a labeled aggregate beside the explicit empty state.",
        ),
      },
    },
  },
};

export const RecordsUnavailablePreview: Story = {
  args: {
    variant: "records",
    title: "Rage-click sessions",
    description: "June 14 to July 14, 2026",
    summary: {
      total: 43,
      label: "sessions",
      onViewAll: fn(),
    },
    rows: [],
    emptyMessage: "No recent sessions are available in this preview.",
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "A known aggregate can still offer View all when no recent preview rows are available.",
        ),
      },
    },
  },
};

export const RankedEmpty: Story = {
  args: {
    rows: [],
    emptyMessage: "No ranked activity is available for this period.",
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Ranked empty state; loading and transport errors remain outside this component.",
        ),
      },
    },
  },
};

export const RecordsEmpty: Story = {
  args: {
    variant: "records",
    title: "Recent sessions",
    description: "June 14 to July 14, 2026",
    rows: [],
    emptyMessage: "No matching sessions were found.",
  },
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Records empty state without an invented zero-value summary.",
        ),
      },
    },
  },
};

export const CompactWidthStress: Story = {
  render: () => (
    <div className="w-[288px] max-w-full">
      <DashboardTable
        variant="records"
        title="Recent records"
        description="June 14 to July 14, 2026"
        summary={{ total: 43, label: "records" }}
        rows={[
          {
            id: "compact-record",
            primary: "Aug 6, 2026, 2:57 PM",
            secondaryLabel: "Record",
            secondary:
              "50981735-5101-472c-a909-e5c4bd145994-extra-long-record-identifier",
          },
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: storyDescription(
          "Stress reference for long record values at a compact MCP widget width.",
        ),
      },
    },
  },
};
