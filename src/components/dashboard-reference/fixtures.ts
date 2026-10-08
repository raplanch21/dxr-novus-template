import type {
  DashboardMetricCardProps,
  DashboardNarrativeBlock,
  DashboardRankedTableRow,
  DashboardRecordTableRow,
  DashboardStatusItem,
} from "./dashboard-types";

const REFERENCE_PERIOD = "June 14 to July 14, 2026";

export const headlineMetrics: DashboardMetricCardProps[] = [
  {
    type: "key",
    label: "Sign-in visitors",
    value: "24",
    delta: { label: "+4.8%", valence: "positive" },
    supportingValue: "4",
    description: "Unique visitors who reached sign in.",
    period: REFERENCE_PERIOD,
  },
  {
    type: "key",
    label: "Overview activation rate",
    value: "30.0%",
    delta: { label: "-37.0%", valence: "negative" },
    supportingValue: "12",
    description: "Visitors who continued from sign in to overview.",
    period: REFERENCE_PERIOD,
  },
  {
    type: "key",
    label: "In-app feedback score",
    value: "1.53 / 5",
    description: "Average score after using key actions.",
    period: REFERENCE_PERIOD,
  },
];

export const neutralKeyMetric: DashboardMetricCardProps = {
  type: "key",
  label: "Tracked errors",
  value: "4",
  delta: { label: "0.0%", valence: "null" },
  description: "Tracked errors remained stable during this reporting period.",
  period: REFERENCE_PERIOD,
};

export const generalMetrics: DashboardMetricCardProps[] = [
  {
    type: "general",
    label: "Weekly visitors",
    value: "18",
    delta: { label: "+12.5%", valence: "positive" },
  },
  {
    type: "general",
    label: "Guide completions",
    value: "12",
    delta: { label: "-8.3%", valence: "negative" },
  },
  {
    type: "general",
    label: "Tracked errors",
    value: "4",
    delta: { label: "0.0%", valence: "null" },
  },
  {
    type: "general",
    label: "Session replays viewed",
    value: "9",
  },
  {
    type: "general",
    label: "Activation drop-offs",
    value: "7",
    delta: { label: "+16.7%", valence: "negative" },
  },
  {
    type: "general",
    label: "Survey responses",
    value: "22",
    delta: { label: "-2.1%", valence: "null" },
  },
];

export const singleNarrative: [DashboardNarrativeBlock] = [
  {
    heading: "Signal quality",
    body: "Traffic is stable enough to evaluate this period, but baseline consistency remains uneven in lower-volume paths.",
  },
];

export const doubleNarrative: [
  DashboardNarrativeBlock,
  DashboardNarrativeBlock,
] = [
  {
    heading: "Signal quality",
    body: "Traffic is stable enough to evaluate this period, but baseline consistency remains uneven in lower-volume paths.",
  },
  {
    heading: "Comparison context",
    body: "Lower-volume paths have less stable baselines, so comparisons in those paths carry less confidence.",
  },
];

export const rankedTableRows: readonly DashboardRankedTableRow[] = [
  { id: "overview", label: "Overview", value: "3,193" },
  { id: "dashboards", label: "Dashboards", value: "2,736" },
  { id: "product-areas", label: "Product areas", value: "1,914" },
  { id: "session-replay", label: "Session Replay", value: "1,448" },
  { id: "guides", label: "Guides", value: "987" },
];

export const recordTableRows: readonly DashboardRecordTableRow[] = [
  {
    id: "session-1",
    primary: "Aug 6, 2026, 2:57 PM",
    secondaryLabel: "Session",
    secondary: "50981735-5101-472c-a909-e5c4bd145994",
  },
  {
    id: "session-2",
    primary: "Aug 6, 2026, 2:42 PM",
    secondaryLabel: "Session",
    secondary: "61bb538d-6a6f-4433-bc8c-c99b533448c1",
  },
  {
    id: "session-3",
    primary: "Aug 6, 2026, 2:18 PM",
    secondaryLabel: "Session",
    secondary: "df32788c-d923-42ab-b9af-f10ee53a5327",
  },
];

export const dashboardStatusItems: readonly DashboardStatusItem[] = [
  {
    id: "setup-onboarding",
    title: "Setup & onboarding",
    description: "Core installation and onboarding events are collecting data.",
    status: "healthy",
  },
  {
    id: "features-events",
    title: "Features & events",
    description:
      "Several tracked interactions need naming or ownership review.",
    status: "watch",
  },
  {
    id: "feedback-guides",
    title: "Feedback & guides",
    description:
      "No feedback collection path is configured for this experience.",
    status: "attention",
  },
];
