import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { MapPin } from "lucide-react"
import TeamEmblem from "./TeamEmblem"
import MatchStatusBadge from "./MatchStatusBadge"
import MatchCardSkeleton from "./MatchCardSkeleton"
import PlayerCardSkeleton from "./PlayerCardSkeleton"
import { computeOverallRating, ratingTier } from "../utils/playerRating"
import api from "../services/api"

/* ─────────────────────────────────────────
   Helpers
   ───────────────────────────────────────── */

function pickFeaturedMatch(matches) {
    if (!matches || matches.length === 0) return null
    const live = matches.find((m) => m.status === "live")
    if (live) return live

    const now = new Date()
    const upcoming = matches
        .filter((m) => m.status === "scheduled")
        .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
    if (upcoming.length > 0) return upcoming[0]

    const completed = matches
        .filter((m) => m.status === "completed")
        .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
    if (completed.length > 0) return completed[0]

    return matches[0]
}

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

    return (
        <Link
            to={`/matches/${match.id}`}
            className="group block h-full bg-gradient-to-br from-pitch/20 to-night border border-line rounded-xl p-5 hover:border-floodlight/40 transition-all duration-300"
        >
            {/* Status badge */}
            <div className="mb-4">
                <MatchStatusBadge
                    status={match.status}
                    minute={match.minute}
                />
            </div>

            {/* Teams + Score */}
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
                    <TeamEmblem name={match.home_team?.name} size="sm" />
                    <span className="font-body text-xs font-semibold text-chalk text-center truncate w-full">
                        {match.home_team?.name ?? "TBD"}
                    </span>
                </div>

                <div className="flex flex-col items-center shrink-0 px-2">
                    {hasScore ? (
                        <div className="flex items-center gap-2">
                            <span className="font-display text-2xl font-bold text-chalk tabular-nums">
                                {match.home_score}
                            </span>
                            <span className="font-display text-base text-chalk/20 font-bold">-</span>
                            <span className="font-display text-2xl font-bold text-chalk tabular-nums">
                                {match.away_score}
                            </span>
                        </div>
                    ) : (
                        <span className="font-body text-[10px] uppercase tracking-widest2 text-chalk/30">VS</span>
                    )}
                    {!hasScore && match.match_date && (
                        <span className="font-body text-[10px] text-chalk/40 mt-1 whitespace-nowrap">
                            {formatKickoff(match.match_date)}
                        </span>
                    )}
                </div>

                <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
                    <TeamEmblem name={match.away_team?.name} size="sm" />
                    <span className="font-body text-xs font-semibold text-chalk text-center truncate w-full">
                        {match.away_team?.name ?? "TBD"}
                    </span>
                </div>
            </div>

            {/* Venue */}
            {match.venue && (
                <div className="flex items-center gap-1.5 justify-center text-chalk/40">
                    <MapPin size={11} aria-hidden="true" />
                    <span className="font-body text-[11px] truncate">{match.venue}</span>
                </div>
            )}

            {/* Hover indicator */}
            <div className="mt-3 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-body text-[10px] uppercase tracking-widest2 text-floodlight">View Match</span>
                <span className="text-floodlight text-xs" aria-hidden="true">→</span>
            </div>
        </Link>
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
            className="group block h-full bg-gradient-to-br from-pitch/20 to-night border border-line rounded-xl p-5 hover:border-floodlight/40 transition-all duration-300"
        >
            {/* Top row: avatar + rating badge */}
            <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-pitch flex items-center justify-center overflow-hidden ring-2 ring-chalk/10 group-hover:ring-floodlight/30 transition-all">
                    {player.photo_url ? (
                        <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-display text-sm text-chalk/60">{initials}</span>
                    )}
                </div>
                {rating !== null && (
                    <div className={`flex items-center justify-center w-11 h-11 rounded-full border-2 shrink-0 ${tierClass}`}>
                        <span className="font-display text-sm font-bold">{rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Name */}
            <h4 className="font-display uppercase tracking-wide text-chalk group-hover:text-floodlight transition-colors truncate">
                {player.name}
            </h4>

            {/* Meta */}
            <div className="flex items-center gap-2 mt-1 text-chalk/50">
                <span className="font-body text-xs">{player.position}</span>
                {player.jersey_number && (
                    <>
                        <span className="text-chalk/20 text-[10px]" aria-hidden="true">·</span>
                        <span className="font-body text-xs">#{player.jersey_number}</span>
                    </>
                )}
            </div>

            {/* Team */}
            {player.team?.name && (
                <p className="font-body text-[11px] text-chalk/35 mt-1 truncate">{player.team.name}</p>
            )}

            {/* Hover indicator */}
            <div className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-body text-[10px] uppercase tracking-widest2 text-floodlight">View Profile</span>
                <span className="text-floodlight text-xs" aria-hidden="true">→</span>
            </div>
        </Link>
    )
}

/* ─────────────────────────────────────────
   Main component
   ───────────────────────────────────────── */

export default function HomeSpotlight() {
    const [matches, setMatches] = useState([])
    const [players, setPlayers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setLoading(true)

        Promise.all([
            api.matches.list(),
            api.players.list(),
        ])
            .then(([matchData, playerData]) => {
                if (cancelled) return
                setMatches(matchData)
                setPlayers(playerData)
            })
            .catch(() => {
                // Silently handle — component will render fallback state
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [])

    const featuredMatch = useMemo(() => pickFeaturedMatch(matches), [matches])
    const topPlayer = useMemo(() => pickTopPlayer(players), [players])

    return (
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                {/* ── Left: Featured Match ── */}
                <div>
                    <h3 className="font-display uppercase tracking-wide text-sm text-chalk-muted mb-4">
                        <span className="text-floodlight">Featured</span> Match
                    </h3>
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
                                <p className="font-body text-sm text-chalk/40">No matches available yet.</p>
                                <p className="font-body text-[11px] text-chalk/30 mt-1">
                                    Matches will appear here once they are scheduled.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right: Top-Rated Player ── */}
                <div>
                    <h3 className="font-display uppercase tracking-wide text-sm text-chalk-muted mb-4">
                        <span className="text-floodlight">In Form</span> Player
                    </h3>
                    {loading ? (
                        <PlayerCardSkeleton />
                    ) : topPlayer ? (
                        <PlayerSpotlightCard player={topPlayer.player} rating={topPlayer.rating} />
                    ) : (
                        <div className="bg-pitch/10 border border-line rounded-xl p-6 flex items-center justify-center min-h-[220px]">
                            <div className="text-center">
                                <p className="font-body text-sm text-chalk/40">No player data available yet.</p>
                                <p className="font-body text-[11px] text-chalk/30 mt-1">
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
