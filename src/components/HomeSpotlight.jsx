import { useMemo } from "react"
import { Link } from "react-router-dom"
import { MapPin } from "lucide-react"
import TeamEmblem from "./TeamEmblem"
import MatchStatusBadge from "./MatchStatusBadge"
import PlayerCardSkeleton from "./PlayerCardSkeleton"
import { computeOverallRating, ratingTier } from "../utils/playerRating"
import { pickFeaturedMatch } from "../utils/leagueSummary"

/* ─────────────────────────────────────────
   Helpers
   ───────────────────────────────────────── */

function pickTopPlayer(players) {
    if (!players || players.length === 0) return null

    const ranked = players
        .map((p) => ({ player: p, rating: computeOverallRating(p.attributes) }))
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))

    // If the top player has no attributes, fall back to the first player (no badge)
    if (ranked.length > 0 && ranked[0].rating === null) {
        return { player: players[0], rating: null }
    }

    return ranked[0] || null
}

function formatKickoff(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
        weekday: "short", day: "numeric", month: "short",
    }) + " · " + date.toLocaleTimeString(undefined, {
        hour: "2-digit", minute: "2-digit",
    })
}

/* ─────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────── */

function MatchSpotlightCard({ match }) {
    if (!match) return null

    const isLive = match.status === "live"
    const hasScore = (isLive || match.status === "completed") && match.home_score != null
    const home = match.home_team?.name ?? "TBD"
    const away = match.away_team?.name ?? "TBD"

    return (
        <Link
            to={`/matches/${match.id}`}
            className="spotlight-card group flex h-full min-h-[13rem] flex-col gap-6 bg-gradient-to-br from-pitch/20 to-night border border-line rounded-xl p-6 md:p-8 hover:border-floodlight/40"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <MatchStatusBadge status={match.status} minute={match.minute} />
                {match.venue && (
                    <div className="flex items-center gap-1.5 text-chalk/70">
                        <MapPin size={12} aria-hidden="true" />
                        <span className="font-body text-xs truncate">{match.venue}</span>
                    </div>
                )}
            </div>

            <div className="grid flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
                <div className="flex min-w-0 flex-col items-center gap-3">
                    <TeamEmblem name={home} size="md" />
                    <span className="font-body text-sm font-semibold text-chalk text-center line-clamp-2" title={home}>
                        {home}
                    </span>
                </div>

                <div className="flex flex-col items-center px-2">
                    {hasScore ? (
                        <div className="font-display text-5xl md:text-6xl font-bold text-chalk tabular-nums whitespace-nowrap">
                            {match.home_score}
                            <span className="text-chalk/40 mx-2" aria-hidden="true">-</span>
                            {match.away_score}
                        </div>
                    ) : (
                        <>
                            <span className="font-display text-2xl uppercase tracking-widest2 text-chalk/70">vs</span>
                            {match.match_date && (
                                <span className="font-body text-xs text-chalk/70 mt-2 whitespace-nowrap">
                                    {formatKickoff(match.match_date)}
                                </span>
                            )}
                        </>
                    )}
                </div>

                <div className="flex min-w-0 flex-col items-center gap-3">
                    <TeamEmblem name={away} size="md" />
                    <span className="font-body text-sm font-semibold text-chalk text-center line-clamp-2" title={away}>
                        {away}
                    </span>
                </div>
            </div>

            <SpotlightCue label="View Match" />
        </Link>
    )
}

/** Always visible on touch; on pointer devices it appears on hover or keyboard focus. */
function SpotlightCue({ label }) {
    return (
        <div className="spotlight-cue flex items-center gap-1">
            <span className="font-body text-xs uppercase tracking-widest2 text-floodlight">{label}</span>
            <span className="text-floodlight text-xs" aria-hidden="true">→</span>
        </div>
    )
}

function PlayerSpotlightCard({ player, rating }) {
    if (!player) return null

    const initials = player.name
        ? player.name.split(" ").map((w) => w[0]).slice(0, 2).join("")
        : "??"

    const tierClass = rating !== null ? ratingTier(rating) : ""

    return (
        <Link
            to={`/players/${player.id}`}
            className="spotlight-card group flex h-full min-h-[13rem] flex-col bg-gradient-to-br from-pitch/20 to-night border border-line rounded-xl p-6 hover:border-floodlight/40"
        >
            {/* Top row: avatar + rating badge */}
            <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-pitch flex items-center justify-center overflow-hidden ring-2 ring-chalk/10 group-hover:ring-floodlight/30 transition-[box-shadow] duration-200">
                    {player.photo_url ? (
                        <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-display text-sm text-chalk/85">{initials}</span>
                    )}
                </div>
                {rating !== null && (
                    <div className={`flex items-center justify-center w-11 h-11 rounded-full border-2 shrink-0 ${tierClass}`}>
                        <span className="font-display text-sm font-bold">{rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Name */}
            <h3 className="font-display uppercase tracking-wide text-chalk group-hover:text-floodlight transition-colors truncate">
                {player.name}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-2 mt-1 text-chalk/60">
                <span className="font-body text-xs">{player.position}</span>
                {player.jersey_number && (
                    <>
                        <span className="text-chalk/20 text-xs" aria-hidden="true">·</span>
                        <span className="font-body text-xs">#{player.jersey_number}</span>
                    </>
                )}
            </div>

            {/* Team */}
            {player.team?.name && (
                <p className="font-body text-xs text-chalk/60 mt-1 truncate">{player.team.name}</p>
            )}

            <div className="mt-auto pt-4">
                <SpotlightCue label="View Profile" />
            </div>
        </Link>
    )
}

/* ─────────────────────────────────────────
   Main component
   ───────────────────────────────────────── */

export default function HomeSpotlight({ matches, players, loading }) {
    const featuredMatch = useMemo(() => pickFeaturedMatch(matches), [matches])
    const topPlayer = useMemo(() => pickTopPlayer(players), [players])

    return (
        <section className="section-padded section-padded-tight" aria-label="Featured match and in-form player">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-8 lg:gap-6">

                {/* ── Left: Featured Match ── */}
                <div>
                    <h2 className="font-display uppercase tracking-wide text-sm text-chalk/70 mb-3">
                        <span className="text-floodlight">Featured</span> Match
                    </h2>
                    {loading ? (
                        <div className="bg-pitch/10 border border-line rounded-xl p-5 animate-pulse">
                            <div className="h-4 w-16 bg-line/30 rounded mb-4" />
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-line/30" />
                                    <div className="h-3 w-16 bg-line/20 rounded" />
                                </div>
                                <div className="h-6 w-16 bg-line/20 rounded" />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-line/30" />
                                    <div className="h-3 w-16 bg-line/20 rounded" />
                                </div>
                            </div>
                            <div className="h-3 w-32 bg-line/20 rounded mx-auto" />
                        </div>
                    ) : featuredMatch ? (
                        <MatchSpotlightCard match={featuredMatch} />
                    ) : (
                        <div className="bg-pitch/10 border border-line rounded-xl p-6 flex items-center justify-center min-h-[220px]">
                            <div className="text-center">
                                <p className="font-body text-sm text-chalk/60">No matches available yet.</p>
                                <p className="font-body text-xs text-chalk/60 mt-1">
                                    Matches will appear here once they are scheduled.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right: Top-Rated Player ── */}
                <div>
                    <h2 className="font-display uppercase tracking-wide text-sm text-chalk/70 mb-3">
                        <span className="text-floodlight">In Form</span> Player
                    </h2>
                    {loading ? (
                        <PlayerCardSkeleton />
                    ) : topPlayer ? (
                        <PlayerSpotlightCard player={topPlayer.player} rating={topPlayer.rating} />
                    ) : (
                        <div className="bg-pitch/10 border border-line rounded-xl p-6 flex items-center justify-center min-h-[220px]">
                            <div className="text-center">
                                <p className="font-body text-sm text-chalk/60">No player data available yet.</p>
                                <p className="font-body text-xs text-chalk/60 mt-1">
                                    Players will appear here once they are added to the league.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </section>
    )
}
