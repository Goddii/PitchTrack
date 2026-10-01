import { Link } from "react-router-dom"
import FormPills from "./FormPills"
import TeamEmblem from "./TeamEmblem"
import { kickoffDate, kickoffTime } from "../utils/matchBoard"

const RING_RADIUS = 30
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function Panel({ title, action, children }) {
    return (
        <section className="rounded-xl border border-glass-border bg-glass-bg p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-display text-sm uppercase tracking-wide text-chalk">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    )
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-baseline justify-between gap-3 border-b border-glass-border py-2.5 last:border-b-0">
            <dt className="font-body text-xs uppercase tracking-widest2 text-chalk/60">{label}</dt>
            <dd className="min-w-0 truncate text-right font-body text-sm text-chalk" title={String(value)}>
                {value}
            </dd>
        </div>
    )
}

/** Club facts. Rows with no value are hidden rather than shown empty. */
export function TeamInfoCard({ team, captain }) {
    const rows = [
        ["Nickname", team.nickname],
        ["Founded", team.founded_year],
        ["Head coach", team.coach],
        ["Captain", captain?.name],
        ["Stadium", team.stadium],
        ["City", team.city],
        ["Capacity", team.capacity?.toLocaleString()],
    ].filter(([, value]) => value)

    return (
        <Panel title="Team info">
            {rows.length > 0 ? (
                <dl>
                    {rows.map(([label, value]) => (
                        <InfoRow key={label} label={label} value={value} />
                    ))}
                </dl>
            ) : (
                <p className="font-body text-sm text-chalk/60">No club details added yet.</p>
            )}
        </Panel>
    )
}

function WinRateRing({ percent }) {
    const filled = (percent / 100) * RING_CIRCUMFERENCE

    return (
        <div className="relative size-20 shrink-0" role="img" aria-label={`Win rate ${percent} percent`}>
            <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden="true">
                <circle cx="40" cy="40" r={RING_RADIUS} fill="none" strokeWidth="7" className="stroke-chalk/15" />
                <circle
                    cx="40"
                    cy="40"
                    r={RING_RADIUS}
                    fill="none"
                    strokeWidth="7"
                    strokeLinecap="round"
                    className="stroke-floodlight"
                    strokeDasharray={`${filled} ${RING_CIRCUMFERENCE}`}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold tabular-nums text-chalk">
                {percent}%
            </span>
        </div>
    )
}

export function TeamStatsCard({ lastTen }) {
    const cells = [
        ["Wins", lastTen.wins, "text-emerald-300"],
        ["Draws", lastTen.draws, "text-chalk"],
        ["Losses", lastTen.losses, "text-flare"],
        ["Goals for", lastTen.goalsFor, "text-floodlight"],
        ["Goals against", lastTen.goalsAgainst, "text-chalk/80"],
    ]

    return (
        <Panel title={`Team stats (last ${lastTen.played || 10})`}>
            <div className="flex items-center gap-4">
                <WinRateRing percent={lastTen.winRate} />
                <dl className="grid flex-1 grid-cols-3 gap-x-2 gap-y-3">
                    {cells.map(([label, value, tone]) => (
                        <div key={label}>
                            <dd className={`font-display text-2xl font-bold leading-none tabular-nums ${tone}`}>{value}</dd>
                            <dt className="mt-1 font-body text-[0.625rem] uppercase leading-tight tracking-wider text-chalk/60">{label}</dt>
                        </div>
                    ))}
                </dl>
            </div>
        </Panel>
    )
}

export function RecentFormCard({ form }) {
    return (
        <Panel title="Recent form">
            <FormPills form={form} />
        </Panel>
    )
}

export function NextMatchCard({ match, teamId }) {
    if (!match) {
        return (
            <Panel title="Next match">
                <p className="font-body text-sm text-chalk/60">Nothing scheduled for this club yet.</p>
            </Panel>
        )
    }

    const { home_team: home, away_team: away } = match

    return (
        <Panel
            title="Next match"
            action={
                <Link to={`/matches?match=${match.id}`} className="font-body text-xs font-semibold text-floodlight hover:text-chalk">
                    View
                </Link>
            }
        >
            <div className="flex items-center justify-around gap-2 text-center">
                {[home, away].map((side, i) => (
                    <div key={side.id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                        {i === 1 && <span className="sr-only">versus</span>}
                        <TeamEmblem name={side.name} size="md" />
                        <span className={`max-w-full truncate font-body text-xs ${side.id === teamId ? "text-chalk" : "text-chalk/70"}`}>
                            {side.name}
                        </span>
                    </div>
                ))}
            </div>
            <p className="mt-3 border-t border-glass-border pt-3 text-center font-body text-sm text-chalk/80">
                {kickoffDate(match.match_date)} · {kickoffTime(match.match_date)}
                {match.venue && <span className="block text-xs text-chalk/60">{match.venue}</span>}
            </p>
        </Panel>
    )
}
