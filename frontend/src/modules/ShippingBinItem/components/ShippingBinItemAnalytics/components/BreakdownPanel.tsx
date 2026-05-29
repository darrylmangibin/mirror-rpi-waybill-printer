import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { BreakdownPanelProps } from "../types";
import { formatChartValue } from "../utils";

const chartConfig = {
  total_items: {
    label: "Total Items",
    color: "#7c3aed",
  },
} satisfies ChartConfig;

export const BreakdownPanel = ({
  title,
  description,
  data,
}: BreakdownPanelProps) => {
  const totalItems = data.reduce((sum, item) => sum + item.total_items, 0);
  const chartData = data.length ? data : [{ label: "No data", total_items: 0 }];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-snug text-slate-900">
            {title}
          </h2>
          <p className="text-sm leading-snug text-slate-500">{description}</p>
        </div>
        <div className="shrink-0 sm:text-right">
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
