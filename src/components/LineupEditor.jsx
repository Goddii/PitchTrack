import { MAX_STARTERS, lineupProblem } from "../utils/matchStatsForm"

const FORMATION_PRESETS = ["4-4-2", "4-3-3", "4-2-3-1", "4-1-4-1", "4-5-1", "3-5-2", "3-4-3", "5-3-2", "5-4-1"]

/** One team's announced XI for a scheduled match: a formation plus who starts. */
export default function LineupEditor({ title, players, drafts, formation, onFormation, onToggle, disabled }) {
    const starters = players.filter((player) => drafts[player.id]?.started).length
    const problem = lineupProblem(players, drafts)
    const options = formation && !FORMATION_PRESETS.includes(formation) ? [formation, ...FORMATION_PRESETS] : FORMATION_PRESETS
    const selectId = `formation-${title.replace(/\s+/g, "-").toLowerCase()}`

    return (
        <section className="rounded-lg border border-line bg-pitch/10 p-5">
            <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl uppercase tracking-wide text-chalk">{title}</h2>
                <div className="flex items-center gap-3">
                    <label htmlFor={selectId} className="font-body text-sm text-chalk/70">
                        Formation
                    </label>
                    <select
                        id={selectId}
                        value={formation ?? ""}
                        onChange={(e) => onFormation(e.target.value || null)}
                        disabled={disabled}
                        className="min-h-11 rounded-lg border border-line bg-night px-3 font-body text-sm text-chalk"
                    >
                        <option value="">Auto (by position)</option>
                        {options.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            <p
                role={problem ? "alert" : undefined}
                className={`mb-3 font-body text-sm tabular-nums ${problem ? "text-flare" : "text-chalk/70"}`}
            >
                {problem ?? `${starters} of ${MAX_STARTERS} starters picked`}
            </p>

            <ul className="grid gap-1 sm:grid-cols-2">
                {players.map((player) => (
                    <li key={player.id}>
                        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 font-body text-sm text-chalk hover:bg-chalk/5">
                            <input
                                type="checkbox"
                                checked={Boolean(drafts[player.id]?.started)}
                                onChange={() => onToggle(player.id)}
                                disabled={disabled}
                                className="size-4 accent-floodlight"
                            />
                            <span className="flex-1">{player.name}</span>
                            {player.position && <span className="text-xs uppercase text-chalk/60">{player.position}</span>}
                        </label>
                    </li>
                ))}
            </ul>
        </section>
    )
}
