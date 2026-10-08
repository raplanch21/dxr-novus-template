import type { ReactNode } from "react";

export type DashboardDeltaValence = "positive" | "negative" | "null";

export interface DashboardMetricCardProps {
  description?: ReactNode;
  delta?: { label: string; valence: DashboardDeltaValence };
  label: string;
  period?: string;
  showBaseline?: boolean;
  supportingValue?: string;
  type: "key" | "general";
  value: string;
}

export interface DashboardNarrativeBlock {
  body: string;
  heading: string;
}

export interface DashboardContentContainerProps {
  blocks:
    | [DashboardNarrativeBlock]
    | [DashboardNarrativeBlock, DashboardNarrativeBlock];
  heading: string;
}

export interface DashboardSectionDividerProps {
  number: number;
  onAsk?: () => void;
  onEdit?: () => void;
  title: string;
}

export interface DashboardRankedTableRow {
  id: string;
  label: string;
  value: string;
}

export interface DashboardRecordTableRow {
  id: string;
  primary: string;
  secondary: string;
  secondaryLabel?: string;
}

export interface DashboardRecordsSummary {
  label: string;
  onViewAll?: () => void;
  total: number;
}

interface DashboardTableBaseProps {
  description: string;
  emptyMessage?: string;
  title: string;
}

export type DashboardTableProps =
  | (DashboardTableBaseProps & {
      headerAction?: {
        label: string;
        onClick: () => void;
      };
      onRowSelect?: (row: DashboardRankedTableRow) => void;
      rows: readonly DashboardRankedTableRow[];
      variant: "ranked";
    })
  | (DashboardTableBaseProps & {
      onRowSelect?: (row: DashboardRecordTableRow) => void;
      rows: readonly DashboardRecordTableRow[];
      summary?: DashboardRecordsSummary;
      variant: "records";
    });

export type DashboardStatus = "healthy" | "watch" | "attention";

export interface DashboardStatusItem {
  description: string;
  id: string;
  status: DashboardStatus;
  title: string;
}

export interface DashboardStatusListProps {
  emptyMessage?: string;
  items: readonly DashboardStatusItem[];
}
