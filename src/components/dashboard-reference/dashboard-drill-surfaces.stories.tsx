import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  DashboardDrillFullScreenModal,
  DashboardDrillSideBlade,
  type DashboardDrillKvPayload,
  type DashboardDrillTablePayload,
} from "./dashboard-drill-surfaces";
import { catalogParameters, type DashboardCatalogContract } from "./story-docs";

const tablePayload: DashboardDrillTablePayload = {
  dataType: "table",
  title: "Register details",
  subtitle: "Mapped category: Visitor Activity",
  summary: "Activation funnel entry at Register",
  selection: {
    section: "kpi",
    chartMode: "funnel",
    sourceChartTitle: "Activation funnel",
    sublabel: "Continued visitors",
    label: "Register",
    value: 34,
    seriesKey: "continued",
    interaction: "bar",
  },
  columns: ["Visitor ID", "Account name", "Last active"],
  rows: [
    {
      "Visitor ID": "ava.rivera@northgate.io",
      "Account name": "Northgate Labs",
      "Last active": "Jul 14, 2026",
    },
    {
      "Visitor ID": "maya.chen@bluefield.co",
      "Account name": "Bluefield Health",
      "Last active": "Jul 13, 2026",
    },
  ],
};

const emptyTablePayload: DashboardDrillTablePayload = {
  ...tablePayload,
  title: "Register details",
  summary: "Activation funnel entry at Register",
  rows: [],
  emptyMessage: "No visitors match this selection.",
};

const kvPayload: DashboardDrillKvPayload = {
  dataType: "kv",
  title: "Instrumentation details",
  subtitle: "Mapped category: Instrumentation coverage",
  selection: {
    section: "instrumentation",
    chartMode: "bar",
    sourceChartTitle: "Instrumentation status",
    label: "Complete",
    value: 12,
    seriesKey: "complete",
    interaction: "bar",
  },
  items: [
    { label: "Status", value: "Complete" },
    { label: "Tracked events", value: "12" },
    { label: "Last updated", value: "Jul 14, 2026" },
  ],
};

const fullScreenPayload: DashboardDrillTablePayload = {
  dataType: "table",
  title: "Sign-in visitors",
  subtitle: "",
  isFullMetricList: true,
  metricContext: {
    value: "24",
    delta: "+4.8%",
    timeframe: "June 14 to July 14, 2026",
  },
  selection: {
    section: "kpi",
    chartMode: "kpi",
    sourceChartTitle: "Sign-in visitors",
    label: "Visitors",
    value: 0,
    seriesKey: "sign-in",
    interaction: "bar",
  },
  columns: ["Visitor ID", "Account name", "Sign-in visits", "Last visit"],
  rows: Array.from({ length: 24 }, (_, index) => ({
    "Visitor ID": `visitor-${index + 1}@northgate.io`,
    "Account name": index % 2 === 0 ? "Northgate Labs" : "Bluefield Health",
    "Sign-in visits": 6 - (index % 4),
    "Last visit": `Jul ${14 - (index % 7)}, 2026`,
  })),
};

function SideBladePreview({
  payload,
}: {
  payload: DashboardDrillTablePayload | DashboardDrillKvPayload;
}) {
  return (
    <div className="flex min-h-[720px] w-full justify-end bg-white">
      <DashboardDrillSideBlade
        payload={payload}
        isOpen
        onClose={() => undefined}
        widthMode="half"
      />
    </div>
  );
}

function FullScreenPreview() {
  return (
    <DashboardDrillFullScreenModal
      payload={fullScreenPayload}
      isOpen
      onClose={() => undefined}
    />
  );
}

const catalogContract = {
  id: "dashboard.drill-surfaces",
  availability: "renderer-owned",
  summary:
    "Renderer-owned detail surfaces for key metrics, general usage metrics, and chart marks with underlying records.",
  useWhen: [
    "A user selects a general usage metric.",
    "A user selects a chart mark that maps to underlying records or one tracked item.",
    "A user requests the complete data set from an inline key metric insight.",
  ],
  doNotUseWhen: [
    "A chart mark has no underlying detail.",
    "The agent is selecting a standalone dashboard block.",
  ],
  requiredInputs: [
    "The source selection, title, measured period, and detail payload.",
    "A table payload for a collection or labeled key-value facts for one item.",
  ],
  optionalInputs: [
    "A specific empty-results message for a valid selection with no matching records.",
    "Metric value and signed percent delta context for a full-screen key metric data set.",
  ],
  rules: [
    "Open general usage metrics and eligible chart marks in the half-width blade.",
    "Open a key metric’s complete data set in the full-screen surface after its inline insight.",
    "Use labeled facts for one page, feature, event, or record.",
    "Use a sortable table for multiple records.",
  ],
} satisfies DashboardCatalogContract;

const meta = {
  title: "Dashboard reference/Components/Drill surfaces",
  component: DashboardDrillSideBlade,
  subcomponents: { DashboardDrillFullScreenModal },
  parameters: {
    ...catalogParameters(catalogContract),
    layout: "fullscreen",
  },
} satisfies Meta<typeof DashboardDrillSideBlade>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ContextualHalfWidthBlade: Story = {
  args: {
    payload: tablePayload,
    isOpen: true,
    onClose: () => undefined,
    widthMode: "half",
  },
  render: () => <SideBladePreview payload={tablePayload} />,
};

export const EmptyResultsHalfWidthBlade: Story = {
  args: {
    payload: emptyTablePayload,
    isOpen: true,
    onClose: () => undefined,
    widthMode: "half",
  },
  render: () => <SideBladePreview payload={emptyTablePayload} />,
};

export const KeyValueHalfWidthBlade: Story = {
  args: {
    payload: kvPayload,
    isOpen: true,
    onClose: () => undefined,
    widthMode: "half",
  },
  render: () => <SideBladePreview payload={kvPayload} />,
};

export const FullScreenKpiRecords: Story = {
  args: {
    payload: fullScreenPayload,
    isOpen: true,
    onClose: () => undefined,
  },
  render: () => <FullScreenPreview />,
};
