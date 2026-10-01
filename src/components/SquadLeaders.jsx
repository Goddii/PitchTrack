import { Link } from "react-router-dom"
import ErrorState from "./ErrorState"
import SilhouettePlaceholder from "./SilhouettePlaceholder"
import { useAsync } from "../hooks/useAsync"
import { squadLeaders } from "../utils/matchLog"
import api from "../services/api"

function LeaderRow({ entry, rank, field, isCurrent }) {
    const { player } = entry

    return (
        <li>
            <Link
                to={`/players/${player.id}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`spotlight-card group flex items-center gap-4 rounded-lg border px-3 py-3 ${
                    isCurrent ? "border-floodlight bg-floodlight/5" : "border-line hover:border-chalk/40"
                }`}
            >
                <span className="w-6 text-center font-display text-2xl font-bold tabular-nums text-chalk/40" aria-hidden="true">
                    {rank}
                </span>

                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-night/60">
                    {player.photo_url ? (
                        <img src={player.photo_url} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
                    ) : (
                        <SilhouettePlaceholder className="h-full w-full object-cover object-top" />
                    )}
                </span>

                <span className="min-w-0 flex-1">
                    <span className="block truncate font-display uppercase tracking-wide text-chalk transition-colors group-hover:text-floodlight">
                        {player.name}
                    </span>
                    <span className="font-body text-xs text-chalk/70">
                        {player.position}
                        {player.jersey_number != null && ` · #${player.jersey_number}`}
                    </span>
                </span>

                <span className="font-display text-3xl font-bold tabular-nums text-floodlight">{entry[field]}</span>
            </Link>
        </li>
    )
}

function LeaderList({ title, noun, entries, field, currentId }) {
    return (
        <div className="rounded-lg border border-line bg-pitch/10 p-6">
            <h3 className="mb-4 font-display text-lg uppercase tracking-wide text-chalk">{title}</h3>
            {entries.length === 0 ? (
                <p className="py-6 font-body text-sm text-chalk/70">No {noun} yet this season.</p>
            ) : (
                <ol className="m-0 list-none space-y-3 p-0">
                    {entries.map((entry, i) => (
                        <LeaderRow
                            key={entry.player.id}
                            entry={entry}
                            rank={i + 1}
                            field={field}
                            isCurrent={String(entry.player.id) === String(currentId)}
                        />
                    ))}
                </ol>
            )}
        </div>
    )
}

function LeadersSkeleton() {
    return (
        <div className="grid animate-pulse grid-cols-1 gap-6 md:grid-cols-2" aria-hidden="true">
            {[0, 1].map((n) => (
                <div key={n} className="h-64 rounded-lg border border-line bg-pitch/10" />
            ))}
        </div>
    )
}

/** The club's top three scorers and top three assist-makers, with the current player marked. */
export default function SquadLeaders({ teamId, currentPlayerId }) {
    const { data: totals, loading, error, refetch } = useAsync(
        (signal) => api.teams.playerStats(teamId, { signal }),
        [teamId],
        []
    )

    if (error) return <ErrorState error={error} onRetry={refetch} title="Couldn't load the squad leaders" />
    if (loading) return <LeadersSkeleton />

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <LeaderList title="Top scorers" noun="goals" entries={squadLeaders(totals, "goals")} field="goals" currentId={currentPlayerId} />
            <LeaderList title="Top assists" noun="assists" entries={squadLeaders(totals, "assists")} field="assists" currentId={currentPlayerId} />
        </div>
    )
}
