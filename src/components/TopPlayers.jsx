import { Link } from "react-router-dom"
import SilhouettePlaceholder from "./SilhouettePlaceholder"

/**
 * The three best-rated players. The jersey number is the artwork: it works with no photo, and
 * a transparent cut-out in photo_url is dropped in over it when one exists.
 */
function TopCard({ entry, rank }) {
    const { player, rating } = entry
    const isLead = rank === 1

    return (
        <Link
            to={`/players/${player.id}`}
            className={`spotlight-card group relative flex min-h-[16rem] flex-col justify-end overflow-hidden rounded-xl border border-line bg-gradient-to-br from-pitch/30 to-night p-6 hover:border-floodlight/40 ${
                isLead ? "lg:col-span-2" : ""
            }`}
        >
            <span
                className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[11rem] font-bold leading-none text-chalk/[0.07]"
                aria-hidden="true"
            >
                {player.jersey_number ?? rank}
            </span>

            {player.photo_url ? (
                <img
                    src={player.photo_url}
                    alt=""
                    className="pointer-events-none absolute bottom-0 right-0 h-full w-1/2 object-contain object-bottom"
                    loading="lazy"
                />
            ) : (
                <SilhouettePlaceholder className="pointer-events-none absolute bottom-0 right-0 h-full w-1/2 object-contain object-bottom" />
            )}

            <div className="relative">
                {rating !== null && (
                    <div className="font-display text-6xl font-bold tabular-nums text-floodlight" aria-label={`Rating ${rating.toFixed(1)}`}>
                        {rating.toFixed(1)}
                    </div>
                )}
                <h3 className="font-display text-2xl uppercase tracking-wide text-chalk transition-colors group-hover:text-floodlight">
                    {player.name}
                </h3>
                <p className="font-body text-sm text-chalk/70">
                    {player.position}
                    {player.team?.name && ` · ${player.team.name}`}
                </p>
            </div>
        </Link>
    )
}

export default function TopPlayers({ ranked }) {
    const top = ranked.filter((entry) => entry.rating !== null).slice(0, 3)
    if (top.length === 0) return null

    return (
        <section aria-labelledby="top-players-heading" className="mb-10">
            <h2 id="top-players-heading" className="mb-3 font-display text-sm uppercase tracking-wide text-chalk/70">
                <span className="text-floodlight">Best</span> Rated
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                {top.map((entry, i) => (
                    <TopCard key={entry.player.id} entry={entry} rank={i + 1} />
                ))}
            </div>
        </section>
    )
}
