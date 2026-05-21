import type {
  ShippingBinItemSyncStatus,
  ShippingBinItemValidationStatus,
  ShippingBinItemWorkflowStep,
} from "@/modules/ShippingBinItem/types/shipping-bin-item.type";
import {
  defaultBadgeConfig,
  syncStatusConfig,
  validationConfig,
  workflowConfig,
} from "../constants";
import { formatLabel } from "../utils";
import { CompactBadge } from "./CompactBadge";

export const SyncStatusBadge = ({
  status,
}: {
  status: ShippingBinItemSyncStatus;
}) => (
  <CompactBadge label={formatLabel(status)} config={syncStatusConfig[status]} />
);

export const WorkflowBadge = ({
  status,
}: {
  status: ShippingBinItemWorkflowStep | null;
}) => {
  if (!status) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  return (
    <CompactBadge
      label={formatLabel(status)}
      config={workflowConfig[status] ?? defaultBadgeConfig}
    />
  );
};

export const ValidationBadge = ({
  status,
}: {
  status: ShippingBinItemValidationStatus | null;
}) => {
  if (!status) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  return (
    <CompactBadge
      label={formatLabel(status)}
      config={validationConfig[status] ?? defaultBadgeConfig}
    />
  );
};
