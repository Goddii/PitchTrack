import { draftProblem, teamGoalTotal } from "../utils/matchStatsForm"

const COUNT_COLUMNS = [
    { field: "minutes_played", label: "Min", title: "Minutes played", max: 120 },
    { field: "goals", label: "G", title: "Goals" },
    { field: "assists", label: "A", title: "Assists" },
    { field: "yellow_cards", label: "YC", title: "Yellow cards" },
    { field: "red_cards", label: "RC", title: "Red cards" },
]

const TYPE_COLUMNS = [
    { field: "right_foot_goals", label: "Right", title: "Right-foot goals" },
    { field: "left_foot_goals", label: "Left", title: "Left-foot goals" },
    { field: "headed_goals", label: "Head", title: "Headed goals" },
    { field: "penalty_goals", label: "Pen", title: "Penalties" },
]

const HEAD = "px-2 py-2 text-center font-body text-xs font-normal uppercase tracking-widest2 text-chalk/70"

function NumberCell({ player, column, value, onChange, invalid }) {
    return (
        <td className="px-1.5 py-2 text-center">
            <input
                type="number"
                inputMode="numeric"
                min="0"
                max={column.max}
                value={value}
                onChange={(e) => onChange(player.id, column.field, e.target.value === "" ? 0 : Math.max(0, Math.trunc(Number(e.target.value))))}
                aria-label={`${player.name}: ${column.title}`}
                aria-invalid={invalid || undefined}
                className={`w-14 rounded border bg-night px-2 py-1.5 text-center font-body tabular-nums text-chalk focus:border-floodlight focus:outline-none ${
                    invalid ? "border-flare" : "border-line"
                }`}
            />
        </td>
    )
}

/** Editable stats for one club's players in a match, with a running goals tally against the score. */
export default function TeamStatsTable({ title, players, drafts, score, onChange, onStarters, disabled }) {
    const entered = teamGoalTotal(players, drafts)
    const overScore = score != null && entered > score
    const tallyColour = overScore ? "text-flare" : score != null && entered === score ? "text-emerald-300" : "text-chalk/70"

    return (
        <section className="rounded-lg border border-line bg-pitch/10" aria-label={`${title} player stats`}>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                <h2 className="font-display text-lg uppercase tracking-wide text-chalk">{title}</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <span className={`font-body text-sm tabular-nums ${tallyColour}`} role="status">
                        Goals entered {entered}
                        {score != null && ` of ${score}`}
                        {overScore && ": more than the team scored"}
                    </span>
                    <button
                        type="button"
                        onClick={onStarters}
                        disabled={disabled}
                        className="min-h-11 cursor-pointer rounded-lg border border-chalk/25 px-4 font-body text-sm font-semibold text-chalk/80 transition-colors hover:border-chalk/50 hover:text-chalk disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Everyone started
                    </button>
                </div>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[56rem]">
                    <thead>
                        <tr className="border-b border-line">
                            <th rowSpan={2} className="px-4 py-2 text-left font-body text-xs font-normal uppercase tracking-widest2 text-chalk/70">
                                Player
                            </th>
                            <th rowSpan={2} className={HEAD}>Started</th>
                            {COUNT_COLUMNS.map((c) => (
                                <th key={c.field} rowSpan={2} className={HEAD} title={c.title}>{c.label}</th>
                            ))}
                            <th colSpan={TYPE_COLUMNS.length} className={`${HEAD} border-l border-line`}>Goal types</th>
                        </tr>
                        <tr className="border-b border-line">
                            {TYPE_COLUMNS.map((c, i) => (
                                <th key={c.field} className={`${HEAD} ${i === 0 ? "border-l border-line" : ""}`} title={c.title}>{c.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {players.map((player) => {
                            const draft = drafts[player.id]
                            const problem = draftProblem(draft)
                            return (
                                <tr key={player.id}>
                                    <td className="px-4 py-2">
                                        <div className="font-body text-sm text-chalk">
                                            {player.name}
                                            {player.jersey_number != null && <span className="ml-2 text-chalk/60">#{player.jersey_number}</span>}
                                        </div>
                                        {problem && <p className="mt-0.5 font-body text-xs text-flare" role="alert">{problem}</p>}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={draft.started}
                                            onChange={(e) => onChange(player.id, "started", e.target.checked)}
                                            aria-label={`${player.name}: started`}
                                            className="h-5 w-5 cursor-pointer accent-floodlight"
                                        />
                                    </td>
                                    {COUNT_COLUMNS.map((c) => (
                                        <NumberCell key={c.field} player={player} column={c} value={draft[c.field]} onChange={onChange} invalid={Boolean(problem)} />
                                    ))}
                                    {TYPE_COLUMNS.map((c) => (
                                        <NumberCell key={c.field} player={player} column={c} value={draft[c.field]} onChange={onChange} invalid={Boolean(problem)} />
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
