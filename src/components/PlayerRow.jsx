import { memo } from "react"
import { Link } from "react-router-dom"
import { ratingTier } from "../utils/playerRating"

/** One line of the players list: number, name, position, club and rating. */
function PlayerRow({ player, rating }) {
    const team = player.team?.name ?? ""

    return (
        <Link
            to={`/players/${player.id}`}
            className="player-row group grid min-h-14 grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-line px-3 py-3 last:border-b-0 hover:bg-pitch/20 md:grid-cols-[3.5rem_minmax(0,1.4fr)_7rem_minmax(0,1fr)_4rem] md:gap-4 md:px-4"
        >
            <span className="text-right font-display text-2xl font-bold tabular-nums text-chalk/40" aria-hidden="true">
                {player.jersey_number ?? "–"}
            </span>

            <div className="flex min-w-0 items-center gap-3">
                {player.photo_url && (
                    <img src={player.photo_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover object-top" loading="lazy" />
                )}
                <div className="min-w-0">
                    <div className="truncate font-display uppercase tracking-wide text-chalk transition-colors group-hover:text-floodlight">
                        {player.name}
                    </div>
                    <div className="truncate font-body text-xs text-chalk/70 md:hidden">
                        {player.position}
                        {team && ` · ${team}`}
                    </div>
                </div>
            </div>

            <span className="hidden font-body text-sm text-chalk/70 md:block">{player.position}</span>
            <span className="hidden truncate font-body text-sm text-chalk/70 md:block">{team}</span>

            {rating !== null ? (
                <span
                    className={`flex h-9 w-12 items-center justify-center justify-self-end rounded-lg border font-display text-sm font-bold tabular-nums ${ratingTier(rating)}`}
                    aria-label={`Rating ${rating.toFixed(1)}`}
                >
                    {rating.toFixed(1)}
                </span>
            ) : (
                <span className="justify-self-end font-body text-sm text-chalk/60" aria-label="Not rated">—</span>
            )}
        </Link>
    )
}

export default memo(PlayerRow)
