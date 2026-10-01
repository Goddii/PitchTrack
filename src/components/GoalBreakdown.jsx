import { donutArcs, goalBreakdown } from "../utils/goalBreakdown"

const RADIUS = 15.9155 // a circle this size is 100 units round, so arc lengths read as percentages
const STROKE = { right_foot_goals: "stroke-floodlight", left_foot_goals: "stroke-chalk", headed_goals: "stroke-emerald-400", penalty_goals: "stroke-flare" }
const DOT = { right_foot_goals: "bg-floodlight", left_foot_goals: "bg-chalk", headed_goals: "bg-emerald-400", penalty_goals: "bg-flare" }

/** Donut of how a player's goals were scored. Renders nothing until the player has scored. */
export default function GoalBreakdown({ stats, className = "" }) {
    if (!stats || stats.goals === 0) return null

    const { slices, total, unclassified } = goalBreakdown(stats)
    const arcs = donutArcs(slices)
    const goalWord = total === 1 ? "goal" : "goals"

    return (
        <div className={`rounded-lg border border-line bg-pitch/10 p-6 ${className}`}>
            <h3 className="mb-1 font-display text-lg uppercase tracking-wide text-chalk">How the goals were scored</h3>
            <p className="mb-6 font-body text-xs text-chalk/70">
                {total} {goalWord} this season
                {unclassified > 0 && slices.length > 0 && ` · ${unclassified} not classified`}
            </p>

            {slices.length === 0 ? (
                <p className="py-6 font-body text-sm text-chalk/70">How these goals were scored hasn&apos;t been recorded yet.</p>
            ) : (
                <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-12">
                    <div className="relative h-40 w-40 shrink-0">
                        <svg
                            viewBox="0 0 36 36"
                            className="h-full w-full -rotate-90"
                            role="img"
                            aria-label={`Goals by type: ${slices.map((s) => `${s.label.toLowerCase()} ${s.value}`).join(", ")}`}
                        >
                            <circle cx="18" cy="18" r={RADIUS} fill="none" strokeWidth="4" className="stroke-chalk/10" />
                            {arcs.map((arc) => (
                                <circle
                                    key={arc.key}
                                    cx="18"
                                    cy="18"
                                    r={RADIUS}
                                    fill="none"
                                    strokeWidth="4"
                                    strokeDasharray={`${arc.length} ${100 - arc.length}`}
                                    strokeDashoffset={-arc.start}
                                    className={STROKE[arc.key]}
                                />
                            ))}
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold tabular-nums text-chalk">
                            {total}
                        </span>
                    </div>

                    <ul className="m-0 w-full max-w-xs list-none space-y-3 p-0">
                        {slices.map((slice) => (
                            <li key={slice.key} className="flex items-center gap-3 font-body text-sm">
                                <span className={`h-3 w-3 shrink-0 rounded-sm ${DOT[slice.key]}`} aria-hidden="true" />
                                <span className="flex-1 text-chalk">{slice.label}</span>
                                <span className="font-display text-lg font-bold tabular-nums text-chalk">{slice.value}</span>
                                <span className="w-10 text-right tabular-nums text-chalk/70">{Math.round(slice.fraction * 100)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
