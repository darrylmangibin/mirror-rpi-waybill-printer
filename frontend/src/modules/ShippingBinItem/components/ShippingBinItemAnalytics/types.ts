import type { ComponentType } from "react";
import type { ShippingBinItem } from "@/modules/ShippingBinItem/types/shipping-bin-item.type";

export interface AnalyticsFilters {
  created_at_from: string;
  created_at_to: string;
  tenant_id: string;
  marketplace: string;
  validation_status: string;
  workflow_step: string;
  manifest_status: string;
  skip_sweeping: boolean;
}

export interface ChartDatum {
  label: string;
  total_items: number;
}

export interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export interface BreakdownPanelProps {
  title: string;
  description: string;
  data: ChartDatum[];
}

export interface CurrentBinCodesPanelProps {
  title: string;
  description: string;
  data: ChartDatum[];
}

export interface ValueListPanelProps {
  title: string;
  description: string;
  values: string[];
}

export interface MatchingItemsTableProps {
  items: ShippingBinItem[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  page: number;
  perPage: number;
  totalRows: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onRefresh: () => void;
}
