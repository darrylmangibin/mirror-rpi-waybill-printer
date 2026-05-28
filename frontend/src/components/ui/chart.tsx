import * as React from "react"
import * as RechartsPrimitive from "recharts"
import type { TooltipContentProps } from "recharts"

import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    color?: string
  }
}

const ChartContext = React.createContext<ChartConfig | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={config}>
      <div
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/60 [&_.recharts-tooltip-cursor]:fill-muted [&_.recharts-sector]:outline-none [&_.recharts-layer]:outline-none min-h-[200px] w-full",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, item]) => item.color)

  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, item]) => `  --color-${key}: ${item.color};`)
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
}: TooltipContentProps & { className?: string }) {
  const config = useChart()

  if (!active || !payload?.length) return null

  return (
    <div
      className={cn(
        "bg-background grid min-w-[8rem] gap-1.5 rounded-md border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {label && <div className="font-medium text-slate-700">{label}</div>}
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const key = String(item.dataKey || item.name || "")
          const itemConfig = config[key]
          const value =
            typeof item.value === "number"
              ? item.value.toLocaleString()
              : String(item.value ?? "")

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-4 text-slate-600"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
                <span>{itemConfig?.label || item.name}</span>
              </div>
              <span className="font-mono font-medium tabular-nums text-slate-900">
                {value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltipContent }
