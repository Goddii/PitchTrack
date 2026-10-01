import { createContext, useContext, useId, useMemo } from "react"
import { ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"


/**
 * Ported from shadcn/ui's chart.tsx (https://ui.shadcn.com/docs/components/chart)
 * to plain JS, and restyled to reference this project's own tokens
 * (night/chalk/line) instead of shadcn's default --background/--popover
 * variables, which this project doesn't define.
 *
 * Trimmed: only ChartContainer + Tooltip pieces are included.
 * ChartLegend/ChartLegendContent can be added the same way later if a
 * multi-series chart needs one.
 */

const ChartContext = createContext(null)

function useChart() {
    const context = useContext(ChartContext)
    if (!context) {
        throw new Error("useChart must be used within a <ChartContainer />")
    }
    return context
}

export function ChartContainer({ id, className = "", children, config = {}, ...props }) {
    const reactId = useId()
    const chartId = `chart-${(id ?? reactId).replace(/:/g, "")}`

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                data-chart={chartId}
                className={`flex justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-current [&_.recharts-polar-angle-axis-tick_text]:fill-current [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-line/30 [&_.recharts-layer]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none ${className}`}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                <ResponsiveContainer>{children}</ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    )
}

function ChartStyle({ id, config }) {
    const colorLines = Object.entries(config)
        .filter(([, cfg]) => cfg.color)
        .map(([key, cfg]) => `  --color-${key}: ${cfg.color};`)
    if (!colorLines.length) return null

    const css = `[data-chart=${id}] {\n${colorLines.join("\n")}\n}`
    return <style>{css}</style>
}

export const ChartTooltip = RechartsTooltip

export function ChartTooltipContent({
    active,
    payload,
    className = "",
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    nameKey,
}) {
    const { config } = useChart()

    const items = useMemo(() => payload ?? [], [payload])

    if (!active || !items.length) return null

    return (
        <div className={`grid min-w-[9rem] items-start gap-1.5 rounded-lg border border-line bg-night px-3 py-2 text-xs shadow-xl ${className}`}>
            <div className="grid gap-1.5">
                {items.map((item, index) => {
                    const key = nameKey || item.name || item.dataKey || "value"
                    const itemConfig = config[key] ?? {}
                    const indicatorColor = item.payload?.fill || itemConfig.color

                    return (
                        <div key={item.dataKey ?? index} className="flex w-full items-center gap-2">
                            {!hideIndicator && (
                                <span
                                    className={indicator === "line" ? "h-0.5 w-3 rounded-full" : "h-2.5 w-2.5 rounded-[2px]"}
                                    style={{ backgroundColor: indicatorColor || "currentColor" }}
                                />
                            )}
                            <div className="flex flex-1 justify-between items-center gap-3 leading-none">
                                {!hideLabel && (
                                    <span className="text-chalk/60">
                                        {item.payload?.attribute ?? itemConfig.label ?? item.name}
                                    </span>
                                )}
                                <span className="font-display font-semibold tabular-nums text-chalk">{item.value}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
