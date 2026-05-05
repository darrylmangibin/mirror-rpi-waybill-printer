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
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type TenantResult = NonNullable<
  ManifestQueueJob["result"]
>[keyof NonNullable<ManifestQueueJob["result"]>][number];

type SelectedTenantInvoices = {
  title: string;
  tenantId: string;
  invoiceNumbers: string[];
  variant: "success" | "failure";
};

interface QueueJobsPanelProps {
  jobs: ManifestQueueJob[];
  isLoading: boolean;
  isRetrying: boolean;
  onRetryJob?: (manifestId: string, jobId: string) => Promise<void> | void;
}

const invoicePreviewLimit = 2;

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

const JobTenantResults = ({
  results,
  variant,
  onViewInvoices,
}: {
  results: TenantResult[];
  variant: "success" | "failure";
  onViewInvoices: (selectedTenantInvoices: SelectedTenantInvoices) => void;
}) => {
  const isSuccess = variant === "success";

  if (results.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {results.map((tenantResult, tenantResultIndex) => {
        const previewInvoiceNumbers = tenantResult.invoice_numbers.slice(
          0,
          invoicePreviewLimit
        );
        const hiddenInvoiceCount =
          tenantResult.invoice_numbers.length - previewInvoiceNumbers.length;

        return (
          <div
            key={`${variant}-${tenantResult.tenant_id}-${tenantResultIndex}`}
            className={cn(
              "rounded-md border px-2 py-1.5",
              isSuccess
                ? "border-emerald-100 bg-emerald-50/40"
                : "border-rose-100 bg-rose-50/40"
            )}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="font-mono text-xs font-semibold text-slate-800">
                {tenantResult.tenant_id}
              </p>
              <span className="text-[11px] text-slate-500">
                {tenantResult.invoice_numbers.length.toLocaleString()} invoice
                {tenantResult.invoice_numbers.length !== 1 ? "s" : ""}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 rounded px-1.5 text-[11px] text-slate-600 hover:bg-white"
                onClick={() =>
                  onViewInvoices({
                    title: `${isSuccess ? "Success" : "Failure"} invoices`,
                    tenantId: tenantResult.tenant_id,
                    invoiceNumbers: tenantResult.invoice_numbers,
                    variant,
                  })
                }
              >
                View
              </Button>
            </div>

            <div className="mt-1 flex flex-wrap gap-1">
              {previewInvoiceNumbers.map((invoiceNumber) => (
                <span
                  key={invoiceNumber}
                  className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-600"
                >
                  {invoiceNumber}
                </span>
              ))}
              {hiddenInvoiceCount > 0 && (
                <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  +{hiddenInvoiceCount.toLocaleString()} more
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const QueueJobList = ({
  jobs,
  isRetrying,
  onRetryJob,
  onViewInvoices,
}: {
  jobs: ManifestQueueJob[];
  isRetrying: boolean;
  onRetryJob?: (manifestId: string, jobId: string) => Promise<void> | void;
  onViewInvoices: (selectedTenantInvoices: SelectedTenantInvoices) => void;
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-[190px] px-3 py-2">Job</th>
              <th className="w-[130px] px-3 py-2">Status</th>
              <th className="px-3 py-2">
                <span className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-rose-500" />
                  Failed tenants
                </span>
              </th>
              <th className="px-3 py-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Success tenants
                </span>
              </th>
              <th className="w-[110px] px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {jobs.map((job) => {
              const successTenants = job.result?.success_tenants ?? [];
              const failureTenants = job.result?.failure_tenants ?? [];
              const tenantResultCount =
                successTenants.length + failureTenants.length;
              const canRetry = failureTenants.length > 0 && Boolean(onRetryJob);

              return (
                <tr key={job.job_id} className="align-top">
                  <td className="px-3 py-2.5">
                    <p className="break-all font-mono text-xs font-semibold text-slate-800">
                      {job.job_id}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {tenantResultCount} tenant result
                      {tenantResultCount !== 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <QueueJobStateBadge state={job.state} />
                  </td>
                  <td className="px-3 py-2.5">
                    {failureTenants.length > 0 ? (
                      <JobTenantResults
                        results={failureTenants}
                        variant="failure"
                        onViewInvoices={onViewInvoices}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {successTenants.length > 0 ? (
                      <JobTenantResults
                        results={successTenants}
                        variant="success"
                        onViewInvoices={onViewInvoices}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {canRetry && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-md border-rose-200 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        disabled={isRetrying}
                        onClick={() => onRetryJob?.(job.manifest_id, job.job_id)}
                      >
                        <RotateCcw
                          className={cn(
                            "h-3.5 w-3.5",
                            isRetrying && "animate-spin"
                          )}
                        />
                        {isRetrying ? "Retrying..." : "Retry"}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const QueueJobsPanel = ({
  jobs,
  isLoading,
  isRetrying,
  onRetryJob,
}: QueueJobsPanelProps) => {
  const [selectedTenantInvoices, setSelectedTenantInvoices] =
    useState<SelectedTenantInvoices | null>(null);
  const totalTenantResults = useMemo(
    () =>
      jobs.reduce(
        (total, job) =>
          total +
          (job.result?.success_tenants.length ?? 0) +
          (job.result?.failure_tenants.length ?? 0),
        0
      ),
    [jobs]
  );
  const totalInvoiceResults = useMemo(
    () =>
      jobs.reduce((total, job) => {
        const tenantResults = [
          ...(job.result?.success_tenants ?? []),
          ...(job.result?.failure_tenants ?? []),
        ];

        return (
          total +
          tenantResults.reduce(
            (invoiceTotal, tenantResult) =>
              invoiceTotal + tenantResult.invoice_numbers.length,
            0
          )
        );
      }, 0),
    [jobs]
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <ListChecks className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Queue jobs
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {isLoading
                ? "Loading queue jobs..."
                : `${jobs.length.toLocaleString()} job${
                    jobs.length !== 1 ? "s" : ""
                  } with ${totalTenantResults.toLocaleString()} tenant result${
                    totalTenantResults !== 1 ? "s" : ""
                  } and ${totalInvoiceResults.toLocaleString()} invoice${
                    totalInvoiceResults !== 1 ? "s" : ""
                  }`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
            <Clock3 className="h-6 w-6 animate-pulse text-slate-400" />
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
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
            <Clock3 className="h-6 w-6 text-slate-400" />
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
            <QueueJobList
              jobs={jobs}
              isRetrying={isRetrying}
              onRetryJob={onRetryJob}
              onViewInvoices={setSelectedTenantInvoices}
            />
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
