import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  ManifestQueueJob,
  QueueJobState,
} from "@/modules/ShippingManifest/types/shipping-manifest.type";
import { formatLabel } from "@/modules/ShippingManifest/utils/shipping-manifest.util";
import {
  CheckCircle2,
  Clock3,
  Copy,
  ListChecks,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type TenantResultGroup =
  ManifestQueueJob["result"][keyof ManifestQueueJob["result"]][number] & {
    job_ids: string[];
  };

type SelectedTenantInvoices = {
  title: string;
  tenantId: string;
  invoiceNumbers: string[];
  variant: "success" | "failure";
};

interface QueueJobsPanelProps {
  jobs: ManifestQueueJob[];
  isLoading: boolean;
}

const invoicePreviewLimit = 8;

const queueJobStateConfig: Record<
  QueueJobState,
  { bg: string; text: string; border: string; dot: string }
> = {
  active: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  waiting: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  failed: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-400",
  },
  delayed: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  paused: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-400",
  },
};

const isQueueJobState = (state: unknown): state is QueueJobState =>
  typeof state === "string" && state in queueJobStateConfig;

const QueueJobStateBadge = ({
  state,
}: {
  state: ManifestQueueJob["state"];
}) => {
  if (!isQueueJobState(state)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Unknown
      </span>
    );
  }

  const cfg = queueJobStateConfig[state];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        cfg.bg,
        cfg.text,
        cfg.border
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {formatLabel(state)}
    </span>
  );
};

const groupTenantResults = (
  jobs: ManifestQueueJob[],
  resultKey: "success_tenants" | "failure_tenants"
) => {
  const groups = new Map<string, TenantResultGroup>();

  jobs.forEach((job) => {
    job.result[resultKey].forEach((tenantResult) => {
      const existing = groups.get(tenantResult.tenant_id);

      if (existing) {
        existing.invoice_numbers.push(...tenantResult.invoice_numbers);
        existing.job_ids.push(job.job_id);
        return;
      }

      groups.set(tenantResult.tenant_id, {
        tenant_id: tenantResult.tenant_id,
        invoice_numbers: [...tenantResult.invoice_numbers],
        job_ids: [job.job_id],
      });
    });
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    invoice_numbers: Array.from(new Set(group.invoice_numbers)),
    job_ids: Array.from(new Set(group.job_ids)),
  }));
};

const InvoiceNumbersModal = ({
  open,
  selectedTenantInvoices,
  onOpenChange,
}: {
  open: boolean;
  selectedTenantInvoices: SelectedTenantInvoices | null;
  onOpenChange: (open: boolean) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const invoiceNumbers = useMemo(
    () => selectedTenantInvoices?.invoiceNumbers ?? [],
    [selectedTenantInvoices]
  );
  const filteredInvoiceNumbers = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) return invoiceNumbers;

    return invoiceNumbers.filter((invoiceNumber) =>
      invoiceNumber.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [invoiceNumbers, searchTerm]);

  const copyInvoices = async () => {
    if (!selectedTenantInvoices) return;

    try {
      await navigator.clipboard.writeText(invoiceNumbers.join("\n"));
      toast.success("Invoice numbers copied");
    } catch {
      toast.error("Failed to copy invoice numbers");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setSearchTerm("");
      }}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <DialogTitle className="text-base text-slate-900">
                {selectedTenantInvoices?.title ?? "Invoice numbers"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Tenant{" "}
                <span className="font-mono">
                  {selectedTenantInvoices?.tenantId}
                </span>{" "}
                has {invoiceNumbers.length.toLocaleString()} invoice
                {invoiceNumbers.length !== 1 ? "s" : ""}.
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit rounded-lg border-slate-200"
              onClick={copyInvoices}
              disabled={invoiceNumbers.length === 0}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy all
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search invoice number..."
              className="h-10 rounded-xl border-slate-200 pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Showing {filteredInvoiceNumbers.length.toLocaleString()} of{" "}
              {invoiceNumbers.length.toLocaleString()} invoices
            </span>
            {selectedTenantInvoices?.variant === "failure" ? (
              <span className="rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-600">
                Failure results
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-600">
                Success results
              </span>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
            {filteredInvoiceNumbers.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No invoice numbers matched your search.
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredInvoiceNumbers.map((invoiceNumber) => (
                  <div
                    key={invoiceNumber}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs font-medium text-slate-700"
                  >
                    {invoiceNumber}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TenantResultGroups = ({
  title,
  description,
  icon: Icon,
  groups,
  variant,
  onViewInvoices,
}: {
  title: string;
  description: string;
  icon: typeof CheckCircle2;
  groups: TenantResultGroup[];
  variant: "success" | "failure";
  onViewInvoices: (selectedTenantInvoices: SelectedTenantInvoices) => void;
}) => {
  const isSuccess = variant === "success";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            isSuccess
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No {isSuccess ? "successful" : "failed"} tenant results yet.
          </div>
        ) : (
          groups.map((group) => {
            const previewInvoiceNumbers = group.invoice_numbers.slice(
              0,
              invoicePreviewLimit
            );
            const hiddenInvoiceCount =
              group.invoice_numbers.length - previewInvoiceNumbers.length;

            return (
              <div
                key={group.tenant_id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-mono text-sm font-semibold text-slate-800">
                    {group.tenant_id}
                  </p>
                  <span className="text-xs text-slate-500">
                    {group.invoice_numbers.length.toLocaleString()} invoice
                    {group.invoice_numbers.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {previewInvoiceNumbers.map((invoiceNumber) => (
                    <span
                      key={invoiceNumber}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs font-medium text-slate-600"
                    >
                      {invoiceNumber}
                    </span>
                  ))}
                  {hiddenInvoiceCount > 0 && (
                    <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
                      +{hiddenInvoiceCount.toLocaleString()} more
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-lg border-slate-200"
                  onClick={() =>
                    onViewInvoices({
                      title,
                      tenantId: group.tenant_id,
                      invoiceNumbers: group.invoice_numbers,
                      variant,
                    })
                  }
                >
                  View all invoices
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const QueueJobsPanel = ({ jobs, isLoading }: QueueJobsPanelProps) => {
  const [selectedTenantInvoices, setSelectedTenantInvoices] =
    useState<SelectedTenantInvoices | null>(null);
  const successTenantGroups = useMemo(
    () => groupTenantResults(jobs, "success_tenants"),
    [jobs]
  );
  const failureTenantGroups = useMemo(
    () => groupTenantResults(jobs, "failure_tenants"),
    [jobs]
  );
  const totalInvoiceResults =
    successTenantGroups.reduce(
      (total, group) => total + group.invoice_numbers.length,
      0
    ) +
    failureTenantGroups.reduce(
      (total, group) => total + group.invoice_numbers.length,
      0
    );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Queue jobs
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {isLoading
                ? "Loading queue jobs..."
                : `${jobs.length.toLocaleString()} job${jobs.length !== 1 ? "s" : ""} with ${totalInvoiceResults.toLocaleString()} invoice result${totalInvoiceResults !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
            <Clock3 className="h-8 w-8 animate-pulse text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">
                Loading queue jobs
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Fetching the latest status job results for this manifest.
              </p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
            <Clock3 className="h-8 w-8 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">
                No queue jobs found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                No status jobs are linked to this shipping manifest yet.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <TenantResultGroups
                title="Success tenants"
                description="Invoices grouped by tenant from successful job results."
                icon={CheckCircle2}
                groups={successTenantGroups}
                variant="success"
                onViewInvoices={setSelectedTenantInvoices}
              />
              <TenantResultGroups
                title="Failure tenants"
                description="Invoices grouped by tenant from failed job results."
                icon={XCircle}
                groups={failureTenantGroups}
                variant="failure"
                onViewInvoices={setSelectedTenantInvoices}
              />
            </div>

            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.job_id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-semibold text-slate-800">
                        {job.job_id}
                      </p>
                      <QueueJobStateBadge state={job.state} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Manifest ID{" "}
                      <span className="font-mono">{job.manifest_id}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <InvoiceNumbersModal
        open={Boolean(selectedTenantInvoices)}
        selectedTenantInvoices={selectedTenantInvoices}
        onOpenChange={(open) => {
          if (!open) setSelectedTenantInvoices(null);
        }}
      />
    </section>
  );
};
