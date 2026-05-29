import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  MapPinned,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTenantConfigurations } from "@/modules/TenantConfiguration/hooks/useTenantConfigurations";
import {
  useShippingBinItemAnalytics,
  useShippingBinItems,
} from "@/modules/ShippingBinItem/hooks/useShippingBinItems";
import type { ApiQueryParams } from "@/common/types/common.types";
import type {
  ShippingBinItemAnalyticsParams,
  ShippingBinItemManifestStatusFilter,
  ShippingBinItemValidationStatus,
  ShippingBinItemWorkflowStep,
} from "@/modules/ShippingBinItem/types/shipping-bin-item.type";
import { AnalyticsSkeleton } from "./components/AnalyticsSkeleton";
import { BreakdownPanel } from "./components/BreakdownPanel";
import { CurrentBinCodesPanel } from "./components/CurrentBinCodesPanel";
import { DatePicker } from "./components/DatePicker";
import { MatchingItemsTable } from "./components/MatchingItemsTable";
import { SummaryCard } from "./components/SummaryCard";
import { ValueListPanel } from "./components/ValueListPanel";
import type { AnalyticsFilters } from "./types";
import {
  ALL_OPTION,
  formatLabel,
  getManifestStatusAnalyticsParams,
  getManifestStatusWhere,
  hasAnalyticsData,
  manifestStatusOptions,
  marketplaceOptions,
  toEndOfDayIso,
  toManifestChartData,
  toProcessChartData,
  toShippingBinCodeChartData,
  toStartOfDayIso,
  toValidationChartData,
  toWorkflowChartData,
  todayDate,
  validationStatusOptions,
  workflowStepOptions,
} from "./utils";

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
    manifest_status: ALL_OPTION,
    skip_sweeping: false,
  });
  const [itemPage, setItemPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);

  const manifestWhere = useMemo(
    () =>
      filters.manifest_status === ALL_OPTION
        ? undefined
        : getManifestStatusWhere(
            filters.manifest_status as ShippingBinItemManifestStatusFilter,
          ),
    [filters.manifest_status],
  );

  const manifestAnalyticsParams = useMemo(
    () =>
      filters.manifest_status === ALL_OPTION
        ? undefined
        : getManifestStatusAnalyticsParams(
            filters.manifest_status as ShippingBinItemManifestStatusFilter,
          ),
    [filters.manifest_status],
  );

  const params = useMemo<ShippingBinItemAnalyticsParams>(() => {
    const analyticsParams: ShippingBinItemAnalyticsParams = {
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
      ...manifestAnalyticsParams,
    };

    return analyticsParams;
  }, [filters, manifestAnalyticsParams]);

  const analyticsQuery = useShippingBinItemAnalytics(params);
  const listParams = useMemo<ApiQueryParams>(() => {
    const where: Record<string, unknown> = {
      created_at: {
        gte: toStartOfDayIso(filters.created_at_from),
        lte: toEndOfDayIso(filters.created_at_to),
      },
    };

    if (filters.tenant_id !== ALL_OPTION) {
      where.tenant_id = filters.tenant_id;
    }

    if (filters.marketplace !== ALL_OPTION) {
      where.marketplace = filters.marketplace;
    }

    if (filters.validation_status !== ALL_OPTION) {
      where.validation_status = filters.validation_status;
    }

    if (filters.workflow_step !== ALL_OPTION) {
      where.workflow_step = filters.workflow_step;
    }

    if (filters.skip_sweeping) {
      where.skip_sweeping = true;
    }

    if (manifestWhere) {
      Object.assign(where, manifestWhere);
    }

    return {
      page: itemPage,
      perPage: itemPerPage,
      query: {
        where,
        orderBy: { created_at: "desc" },
      },
    };
  }, [filters, itemPage, itemPerPage, manifestWhere]);

  const itemQuery = useShippingBinItems(listParams);
  const tenantQuery = useTenantConfigurations();
  const analytics = analyticsQuery.data;
  const hasData = hasAnalyticsData(analytics);
  const items = useMemo(() => itemQuery.data?.data ?? [], [itemQuery.data?.data]);
  const itemCurrentPage = itemQuery.data?.meta.current_page ?? itemPage;
  const itemTotalPages = Math.max(itemQuery.data?.meta.last_page ?? 1, 1);
  const itemTotalRows = itemQuery.data?.meta.total ?? 0;

  useEffect(() => {
    setItemPage(1);
  }, [filters]);

  const tenantOptions = useMemo(
    () =>
      (tenantQuery.data ?? []).map((tenant) => ({
        value: tenant.tenant_id,
        label: tenant.system_name || tenant.database_name || tenant.tenant_id,
      })),
    [tenantQuery.data],
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
                Daily workload, validation, courier, tenant, and workflow totals.
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

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-slate-600">
                Manifest status
              </label>
              <Select
                value={filters.manifest_status}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    manifest_status: value,
                  }))
                }
              >
                <SelectTrigger className="h-9 w-full rounded-md border-slate-200 bg-white shadow-xs">
                  <SelectValue placeholder="All manifest states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>All manifest states</SelectItem>
                  {manifestStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatLabel(status)}
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
                onClick={() => {
                  void analyticsQuery.refetch();
                  void itemQuery.refetch();
                }}
                disabled={analyticsQuery.isFetching || itemQuery.isFetching}
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    (analyticsQuery.isFetching || itemQuery.isFetching) &&
                      "animate-spin",
                  )}
                />
                Refresh
              </Button>
              <Button
                variant="ghost"
                className="h-9 text-slate-600"
                onClick={() => {
                  setItemPage(1);
                  setFilters({
                    created_at_from: today,
                    created_at_to: today,
                    tenant_id: ALL_OPTION,
                    marketplace: ALL_OPTION,
                    validation_status: ALL_OPTION,
                    workflow_step: ALL_OPTION,
                    manifest_status: ALL_OPTION,
                    skip_sweeping: false,
                  });
                }}
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
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  title="Shipping Bin Items"
                  value={analytics?.total_items ?? 0}
                  description="Primary total items count for the selected range."
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
                <SummaryCard
                  title="Current Bin Items"
                  value={analytics?.current_bin?.total_count ?? 0}
                  description="Items currently assigned to shipping stations or collection hubs."
                  icon={MapPinned}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
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
              </div>
            </div>

            <section className="space-y-4">
              <div>
                <h2 className="text-base font-semibold leading-snug text-slate-900">
                  Current Bin Codes
                </h2>
                <p className="text-sm leading-snug text-slate-500">
                  Dynamic current-bin counts separated by shipping stations and collection hubs.
                </p>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                <CurrentBinCodesPanel
                  title="Shipping Station Codes"
                  description="Station bin codes currently holding items in this analytics slice."
                  data={toShippingBinCodeChartData(
                    analytics,
                    "shipping_station",
                  )}
                />
                <CurrentBinCodesPanel
                  title="Collection Hub Codes"
                  description="Collection hub codes currently holding items in this analytics slice."
                  data={toShippingBinCodeChartData(
                    analytics,
                    "collection_hub",
                  )}
                />
              </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-2">
              <BreakdownPanel
                title="Manifest Status"
                description="Items with manifests, without manifests, and courier dispatch milestones."
                data={toManifestChartData(analytics)}
              />
              <BreakdownPanel
                title="Validation State"
                description="total items by validation status."
                data={toValidationChartData(analytics)}
              />
              <BreakdownPanel
                title="Workflow State"
                description="total items by workflow step."
                data={toWorkflowChartData(analytics)}
              />
              <BreakdownPanel
                title="Skip Sweeping"
                description="total items for normal and skip-sweeping items."
                data={toProcessChartData(analytics)}
              />
            </div>
          </div>
        )}

        <MatchingItemsTable
          items={items}
          isLoading={itemQuery.isLoading}
          isFetching={itemQuery.isFetching}
          isError={itemQuery.isError}
          page={itemPage}
          perPage={itemPerPage}
          totalRows={itemTotalRows}
          currentPage={itemCurrentPage}
          totalPages={itemTotalPages}
          onPageChange={setItemPage}
          onPerPageChange={(nextPerPage) => {
            setItemPerPage(nextPerPage);
            setItemPage(1);
          }}
          onRefresh={() => itemQuery.refetch()}
        />
      </div>
    </div>
  );
};

export default ShippingBinItemAnalytics;
