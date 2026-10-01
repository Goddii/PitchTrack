import { useState } from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { POSITION_FILTERS, rosterGroups } from "../utils/roster"

const SKELETON_ROWS = 6

function playerRole(row) {
    if (row.started) return "Starter"
    return row.minutes_played > 0 ? "Substitute" : "Unused substitute"
}

function StatChip({ label, value, title, tone }) {
    if (!value) return null

    return (
        <span
            title={`${value} ${title}`}
            aria-label={`${value} ${title}`}
            className={`rounded px-1.5 py-0.5 font-body text-[0.65rem] font-bold tabular-nums ${tone}`}
        >
            {label} {value}
        </span>
    )
}

function PlayerRow({ row }) {
    const { player } = row

    return (
        <li>
            <Link
                to={`/players/${player.id}`}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-chalk/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/60"
            >
                <span className="w-6 text-right font-display text-sm tabular-nums text-chalk/60">
                    {player.jersey_number ?? "–"}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate font-body text-sm text-chalk">{player.name}</span>
                    <span className="block font-body text-[0.65rem] uppercase tracking-widest2 text-chalk/50">
                        {playerRole(row)}
                    </span>
                </span>
                <span className="flex shrink-0 gap-1">
                    <StatChip label="G" value={row.goals} title="goals" tone="bg-floodlight/20 text-floodlight" />
                    <StatChip label="A" value={row.assists} title="assists" tone="bg-chalk/10 text-chalk" />
                    <StatChip label="YC" value={row.yellow_cards} title="yellow cards" tone="bg-yellow-400/20 text-yellow-300" />
                    <StatChip label="RC" value={row.red_cards} title="red cards" tone="bg-flare/20 text-flare" />
                </span>
            </Link>
        </li>
    )
}

function SideToggle({ match, side, onSideChange }) {
    const sides = [
        { value: "home", team: match.home_team },
        { value: "away", team: match.away_team },
    ]

    return (
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-black/30 p-1">
            {sides.map(({ value, team }) => (
                <button
                    key={value}
                    type="button"
                    aria-pressed={side === value}
                    onClick={() => onSideChange(value)}
                    className={`min-h-9 min-w-0 cursor-pointer truncate rounded-md px-2 font-body text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/60 ${
                        side === value ? "bg-chalk/15 text-chalk" : "text-chalk/60 hover:text-chalk"
                    }`}
                >
                    {team?.name ?? "TBD"}
                </button>
            ))}
        </div>
    )
}

function RosterList({ groups, hasRows, isLoading }) {
    if (isLoading) {
        return (
            <div className="space-y-2 animate-pulse" aria-hidden="true">
                {Array.from({ length: SKELETON_ROWS }, (_, i) => (
                    <div key={i} className="h-9 rounded-md bg-chalk/5" />
                ))}
            </div>
        )
    }
    if (!hasRows) {
        return <p className="py-6 text-center font-body text-sm text-chalk/60">No players listed for this match yet.</p>
    }
    if (groups.length === 0) {
        return <p className="py-6 text-center font-body text-sm text-chalk/60">No players match your filters.</p>
    }

    return groups.map((group) => (
        <section key={group.position} aria-label={group.label} className="mb-3">
            <h3 className="mb-1 flex items-center justify-between px-2 font-body text-[0.7rem] font-semibold uppercase tracking-widest2 text-chalk/60">
                {group.label}
                <span className="tabular-nums">{group.rows.length}</span>
            </h3>
            <ul>
                {group.rows.map((row) => (
                    <PlayerRow key={row.player.id} row={row} />
                ))}
            </ul>
        </section>
    ))
}

/** The right panel of the Matches page: one team's players for the selected match, filterable by position. */
export default function PlayerRail({ match, rows, isLoading }) {
    const [side, setSide] = useState("home")
    const [position, setPosition] = useState("all")
    const [query, setQuery] = useState("")

    const team = side === "home" ? match.home_team : match.away_team
    const groups = rosterGroups(rows, { teamId: team?.id, position, query })

    return (
        <aside
            aria-label="Players"
            className="flex min-h-0 flex-col gap-3 rounded-xl border border-glass-border bg-glass-bg p-3"
        >
            <SideToggle match={match} side={side} onSideChange={setSide} />

            <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by position">
                {POSITION_FILTERS.map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={position === value}
                        onClick={() => setPosition(value)}
                        className={`min-h-9 cursor-pointer rounded-full px-3 font-body text-xs font-semibold uppercase tracking-widest2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/60 ${
                            position === value ? "bg-floodlight text-night" : "bg-chalk/5 text-chalk/60 hover:text-chalk"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-chalk/60" aria-hidden="true" />
                <input
                    type="search"
                    name="player-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search name or number"
                    aria-label="Search players by name or shirt number"
                    className="w-full rounded-full border border-glass-border bg-chalk/5 py-2 pl-9 pr-3 font-body text-sm text-chalk placeholder:text-chalk/60 focus:border-floodlight/50"
                />
            </div>

            <div className="max-h-96 min-h-0 flex-1 overflow-y-auto lg:max-h-none">
                <RosterList groups={groups} hasRows={rows.length > 0} isLoading={isLoading} />
            </div>
        </aside>
    )
}
