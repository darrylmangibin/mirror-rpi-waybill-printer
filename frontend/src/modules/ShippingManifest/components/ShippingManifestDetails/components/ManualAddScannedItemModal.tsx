import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TenantConfiguration } from "@/modules/TenantConfiguration/types/tenant-configuration.type";

type ManualAddScannedItemModalProps = {
  open: boolean;
  trackingNumber: string | null;
  tenantConfigurations?: TenantConfiguration[];
  isPending: boolean;
  onClose: () => void;
  onConfirm: (tenantId: string) => void;
};

export const ManualAddScannedItemModal = ({
  open,
  trackingNumber,
  tenantConfigurations,
  isPending,
  onClose,
  onConfirm,
}: ManualAddScannedItemModalProps) => {
  const tenantOptions = useMemo(() => tenantConfigurations ?? [], [tenantConfigurations]);
  const [selectedTenantId, setSelectedTenantId] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedTenantId("");
  }, [open, tenantOptions]);

  const isSubmitDisabled =
    isPending || !trackingNumber?.trim() || !selectedTenantId || tenantOptions.length === 0;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manually Add Scanned Item</DialogTitle>
          <DialogDescription>
            The scanned tracking number was not resolved automatically. Select the
            tenant to retry adding this item to the manifest.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Tracking Number</p>
            <Input value={trackingNumber ?? ""} readOnly className="font-mono" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Tenant</p>
            <Select
              value={selectedTenantId}
              onValueChange={setSelectedTenantId}
              disabled={isPending || tenantOptions.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    tenantOptions.length === 0
                      ? "No tenant configurations available"
                      : "Select tenant"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tenantOptions.map((tenantConfiguration) => (
                  <SelectItem
                    key={tenantConfiguration.id}
                    value={tenantConfiguration.tenant_id}
                  >
                    {tenantConfiguration.system_name
                      ? `${tenantConfiguration.system_name} (${tenantConfiguration.tenant_id})`
                      : tenantConfiguration.tenant_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selectedTenantId)}
            disabled={isSubmitDisabled}
          >
            {isPending ? "Adding..." : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
