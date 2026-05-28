import { useMemo, useState, type ComponentType } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CalendarIcon,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTenantConfigurations } from "@/modules/TenantConfiguration/hooks/useTenantConfigurations";
import { useShippingBinItemAnalytics } from "@/modules/ShippingBinItem/hooks/useShippingBinItems";
import type {
  ShippingBinItemAnalytics as ShippingBinItemAnalyticsData,
  ShippingBinItemAnalyticsParams,
  ShippingBinItemAnalyticsTotal,
  ShippingBinItemValidationStatus,
  ShippingBinItemWorkflowStep,
} from "@/modules/ShippingBinItem/types/shipping-bin-item.type";

const ALL_OPTION = "all";
const chartConfig = {
  total_items: {
    label: "Total Items",
    color: "#7c3aed",
  },
} satisfies ChartConfig;

const marketplaceOptions = ["tiktok", "shopee", "zalora", "lazada", "shopify"];
const validationStatusOptions: ShippingBinItemValidationStatus[] = [
  "pending",
  "verified_present",
  "missing_from_bin",
  "not_accepted_by_courier",
  "no_tracking_number",
];
const workflowStepOptions: ShippingBinItemWorkflowStep[] = [
  "at_packing_station",
  "being_validated",
  "in_collection_bin",
  "shipped_out",
  "for_loading",
  "loaded",
  "not_accepted_by_courier",
];

interface AnalyticsFilters {
  created_at_from: string;
  created_at_to: string;
  tenant_id: string;
  marketplace: string;
  validation_status: string;
  workflow_step: string;
  skip_sweeping: boolean;
}

interface ChartDatum {
  label: string;
  total_items: number;
}

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

interface BreakdownPanelProps {
  title: string;
  description: string;
  data: ChartDatum[];
}

interface ValueListPanelProps {
  title: string;
  description: string;
  values: string[];
}

const todayDate = () => format(new Date(), "yyyy-MM-dd");

const formatLabel = (value: string | null | undefined) => {
  if (!value) return "Unassigned";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const parseDateOnly = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const getTotalItems = (total: ShippingBinItemAnalyticsTotal | undefined) =>
  total?.total_items ?? total?.total ?? total?.count ?? 0;

const formatChartValue = (value: unknown) =>
  typeof value === "number" ? value.toLocaleString() : String(value ?? "");

const hasAnalyticsData = (data: ShippingBinItemAnalyticsData | undefined) => {
  if (!data) return false;

  const validationTotal = Object.values(data.validation ?? {}).reduce(
    (sum, item) => sum + getTotalItems(item),
    0
  );
  const workflowTotal = Object.values(data.workflow ?? {}).reduce(
    (sum, item) => sum + getTotalItems(item),
    0
  );
  const processTotal =
    getTotalItems(data.process?.normal) + getTotalItems(data.process?.skip);

  return data.total_items > 0 || validationTotal > 0 || workflowTotal > 0 || processTotal > 0;
};

const DatePicker = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const selectedDate = parseDateOnly(value);

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "h-9 justify-start rounded-md border-slate-200 bg-white text-left font-normal shadow-xs",
              !value && "text-slate-400"
            )}
          >
            <CalendarIcon className="h-4 w-4 text-slate-500" />
            {value || "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) onChange(format(date, "yyyy-MM-dd"));
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">
          {value.toLocaleString()}
        </p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <p className="mt-3 text-sm text-slate-500">{description}</p>
  </div>
);

const BreakdownPanel = ({ title, description, data }: BreakdownPanelProps) => {
  const totalItems = data.reduce((sum, item) => sum + item.total_items, 0);
  const chartData = data.length ? data : [{ label: "No data", total_items: 0 }];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-2xl font-semibold tabular-nums text-slate-950">
            {totalItems.toLocaleString()}
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            total_items
          </p>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[240px]">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 64, bottom: 8, left: 8 }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="label"
            type="category"
            tickLine={false}
            axisLine={false}
            width={130}
            tick={{ fontSize: 12 }}
          />
          <XAxis dataKey="total_items" type="number" hide />
          <Tooltip
            cursor={false}
            content={(props) => <ChartTooltipContent {...props} />}
          />
          <Bar
            dataKey="total_items"
            fill="var(--color-total_items)"
            radius={4}
            maxBarSize={28}
          >
            <LabelList
              dataKey="total_items"
              position="right"
              formatter={formatChartValue}
              fill="var(--foreground)"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </section>
  );
};

const ValueListPanel = ({ title, description, values }: ValueListPanelProps) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="sm:text-right">
        <p className="text-2xl font-semibold tabular-nums text-slate-950">
          {values.length.toLocaleString()}
        </p>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          count
        </p>
      </div>
    </div>
    {values.length ? (
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm font-medium text-slate-700"
          >
            {formatLabel(value)}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-slate-500">No values returned.</p>
    )}
  </section>
);

const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-36 rounded-lg" />
      ))}
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-80 rounded-lg" />
      ))}
    </div>
  </div>
);

const toValidationChartData = (
  data: ShippingBinItemAnalyticsData | undefined
): ChartDatum[] =>
  validationStatusOptions.map((status) => ({
    label: formatLabel(status),
    total_items: getTotalItems(data?.validation?.[status]),
  }));

const toWorkflowChartData = (
  data: ShippingBinItemAnalyticsData | undefined
): ChartDatum[] =>
  workflowStepOptions.map((step) => ({
    label: formatLabel(step),
    total_items: getTotalItems(data?.workflow?.[step]),
  }));

const toProcessChartData = (
  data: ShippingBinItemAnalyticsData | undefined
): ChartDatum[] => [
  {
    label: "Normal",
    total_items: getTotalItems(data?.process?.normal),
  },
  {
    label: "Skip Sweeping",
    total_items: getTotalItems(data?.process?.skip),
  },
];

const ShippingBinItemAnalytics = () => {
  const navigate = useNavigate();
  const today = useMemo(() => todayDate(), []);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    created_at_from: today,
    created_at_to: today,
    tenant_id: ALL_OPTION,
    marketplace: ALL_OPTION,
    validation_status: ALL_OPTION,
    workflow_step: ALL_OPTION,
    skip_sweeping: false,
  });

  const params = useMemo<ShippingBinItemAnalyticsParams>(
    () => ({
      created_at_from: filters.created_at_from,
      created_at_to: filters.created_at_to,
      tenant_id:
        filters.tenant_id === ALL_OPTION ? undefined : filters.tenant_id,
      marketplace:
        filters.marketplace === ALL_OPTION ? undefined : filters.marketplace,
      validation_status:
        filters.validation_status === ALL_OPTION
          ? undefined
          : (filters.validation_status as ShippingBinItemValidationStatus),
      workflow_step:
        filters.workflow_step === ALL_OPTION
          ? undefined
          : (filters.workflow_step as ShippingBinItemWorkflowStep),
      skip_sweeping: filters.skip_sweeping ? true : undefined,
    }),
    [filters]
  );

  const analyticsQuery = useShippingBinItemAnalytics(params);
  const tenantQuery = useTenantConfigurations();
  const analytics = analyticsQuery.data;
  const hasData = hasAnalyticsData(analytics);

  const tenantOptions = useMemo(
    () =>
      (tenantQuery.data ?? []).map((tenant) => ({
        value: tenant.tenant_id,
        label: tenant.system_name || tenant.database_name || tenant.tenant_id,
      })),
    [tenantQuery.data]
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 shadow-sm">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight text-slate-900">
                Shipping Bin Items Analytics
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Daily workload, validation, courier, tenant, and workflow
                totals.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-fit rounded-lg border-slate-200 bg-white shadow-xs"
            onClick={() => navigate("/shipping-manifests")}
          >
            <ArrowLeft className="h-4 w-4" />
            Manifests
          </Button>
        </div>

        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DatePicker
              id="created-at-from"
              label="Created from"
              value={filters.created_at_from}
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  created_at_from: value,
                }))
              }
            />
            <DatePicker
              id="created-at-to"
              label="Created to"
              value={filters.created_at_to}
              onChange={(value) =>
                setFilters((current) => ({ ...current, created_at_to: value }))
              }
            />

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-slate-600">
                Tenant
              </label>
              <Select
                value={filters.tenant_id}
                onValueChange={(value) =>
                  setFilters((current) => ({ ...current, tenant_id: value }))
                }
              >
                <SelectTrigger className="h-9 w-full rounded-md border-slate-200 bg-white shadow-xs">
                  <SelectValue placeholder="All tenants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>All tenants</SelectItem>
                  {tenantOptions.map((tenant) => (
                    <SelectItem key={tenant.value} value={tenant.value}>
                      {tenant.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-slate-600">
                Marketplace
              </label>
              <Select
                value={filters.marketplace}
                onValueChange={(value) =>
                  setFilters((current) => ({ ...current, marketplace: value }))
                }
              >
                <SelectTrigger className="h-9 w-full rounded-md border-slate-200 bg-white shadow-xs">
                  <SelectValue placeholder="All marketplaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>All marketplaces</SelectItem>
                  {marketplaceOptions.map((marketplace) => (
                    <SelectItem key={marketplace} value={marketplace}>
                      {formatLabel(marketplace)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-slate-600">
                Validation status
              </label>
              <Select
                value={filters.validation_status}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    validation_status: value,
                  }))
                }
              >
                <SelectTrigger className="h-9 w-full rounded-md border-slate-200 bg-white shadow-xs">
                  <SelectValue placeholder="All validation states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>All validation states</SelectItem>
                  {validationStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-slate-600">
                Workflow step
              </label>
              <Select
                value={filters.workflow_step}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    workflow_step: value,
                  }))
                }
              >
                <SelectTrigger className="h-9 w-full rounded-md border-slate-200 bg-white shadow-xs">
                  <SelectValue placeholder="All workflow steps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>All workflow steps</SelectItem>
                  {workflowStepOptions.map((step) => (
                    <SelectItem key={step} value={step}>
                      {formatLabel(step)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 shadow-xs">
                <label
                  htmlFor="skip-sweeping"
                  className="text-sm font-medium text-slate-700"
                >
                  Skip sweeping only
                </label>
                <Switch
                  id="skip-sweeping"
                  checked={filters.skip_sweeping}
                  onCheckedChange={(checked) =>
                    setFilters((current) => ({
                      ...current,
                      skip_sweeping: checked,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                className="h-9 rounded-lg border-slate-200 bg-white shadow-xs"
                onClick={() => analyticsQuery.refetch()}
                disabled={analyticsQuery.isFetching}
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    analyticsQuery.isFetching && "animate-spin"
                  )}
                />
                Refresh
              </Button>
              <Button
                variant="ghost"
                className="h-9 text-slate-600"
                onClick={() =>
                  setFilters({
                    created_at_from: today,
                    created_at_to: today,
                    tenant_id: ALL_OPTION,
                    marketplace: ALL_OPTION,
                    validation_status: ALL_OPTION,
                    workflow_step: ALL_OPTION,
                    skip_sweeping: false,
                  })
                }
              >
                Reset
              </Button>
            </div>
          </div>
        </section>

        {analyticsQuery.isLoading ? (
          <AnalyticsSkeleton />
        ) : analyticsQuery.isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Analytics failed to load</h2>
                <p className="mt-1 text-sm text-red-700">
                  The remote analytics API did not return data for this request.
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => analyticsQuery.refetch()}
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        ) : !hasData ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-xs">
            <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-3 text-base font-semibold text-slate-900">
              No analytics found
            </h2>
            <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
              No shipping bin item totals or breakdowns are available for the
              selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <SummaryCard
                title="Shipping Bin Items"
                value={analytics?.total_items ?? 0}
                description="Primary total_items count for the selected range."
                icon={PackageCheck}
              />
              <SummaryCard
                title="Tenants"
                value={analytics?.tenants?.count ?? 0}
                description="Tenant count represented in this analytics slice."
                icon={Truck}
              />
              <SummaryCard
                title="Couriers"
                value={analytics?.courier?.count ?? 0}
                description="Courier count represented in this analytics slice."
                icon={ShoppingBag}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <ValueListPanel
                title="Tenant Distribution"
                description="Tenant IDs represented in this analytics response."
                values={analytics?.tenants?.tenant_ids ?? []}
              />
              <ValueListPanel
                title="Courier Distribution"
                description="Courier codes represented in this analytics response."
                values={analytics?.courier?.codes ?? []}
              />
              <ValueListPanel
                title="Marketplace Distribution"
                description="Marketplace integrations represented in this analytics response."
                values={analytics?.marketplace?.integration_name ?? []}
              />
              <BreakdownPanel
                title="Validation State"
                description="total_items by validation status."
                data={toValidationChartData(analytics)}
              />
              <BreakdownPanel
                title="Workflow State"
                description="total_items by workflow step."
                data={toWorkflowChartData(analytics)}
              />
              <BreakdownPanel
                title="Skip Sweeping"
                description="total_items for normal and skip-sweeping items."
                data={toProcessChartData(analytics)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingBinItemAnalytics;
