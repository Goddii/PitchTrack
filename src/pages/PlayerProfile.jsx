import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, UserX} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import PublicNavbar from "../components/PublicNavbar"
import PlayerOverview from "../components/PlayerOverview"
import SquadRail from "../components/SquadRail"
import StatRing from "../components/StatRing"
import SilhouettePlaceholder from "../components/SilhouettePlaceholder"
import EmptyState from "../components/EmptyState"
import ErrorState from "../components/ErrorState"
import { useAsync } from "../hooks/useAsync"
import { computeOverallRating } from "../utils/playerRating"
import { attributeGauges } from "../utils/playerAttributes"
import { statRings, teamActivity } from "../utils/playerStats"
import api from "../services/api"

const MAX_GAUGES = 6
const MAX_RATING = 10
const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Forward"]

const WALKIN_STYLES = `
@keyframes pt-walk-in{
    0% {opacity: 0; transform: translateX(-10%) scale(0.94); filter: blur(8px);}
    60% {filter: blur(0px);}
    100% {opacity: 1; transform: translateX(0) scale(1); filter: blur(0px);}
}

@keyframes pt-sweep {
    0% {transform: translateX(-130%) skewX(-12deg); opacity: 0;}
    35% {opacity: 0.55}
    100% {transform: translateX(230%) skewX(-12deg); opacity: 0;}
}

@keyframes pt-rise-in {
    0% {opacity: 0; transform: translateY(12px)}
    100% {opacity: 1; transform: translateY(0)}

}

.player-walkin-card { animation: pt-walk-in 0.85s cubic-bezier(0.22, 1, 0.36, 1) both; }
.player-walkin-sweep { animation: pt-sweep 1.05s ease-out 0.25s both; }
.player-walkin-meta > * { animation: pt-rise-in 0.5s ease-out both;}
.player-walkin-meta > *:nth-child(1) { animation-delay: 0.5s }
.player-walkin-meta > *:nth-child(2) { animation-delay: 0.6s }
.player-walkin-meta > *:nth-child(3) { animation-delay: 0.7s }
@media (prefers-reduced-motion: reduce ) {
    .player-walkin-card, .player-walkin-sweep, .player-walkin-meta > * { animation: none !important }
}
`;

function CardTally({ yellow, red }) {
    return (
        <div className="mt-6 flex items-center justify-center gap-6">
            <span className="flex items-center gap-2 font-display text-xl font-bold tabular-nums text-chalk" aria-label={`${yellow} yellow cards`}>
                <span className="h-6 w-4 rounded-sm bg-yellow-400" aria-hidden="true" />
                {yellow}
            </span>
            <span className="flex items-center gap-2 font-display text-xl font-bold tabular-nums text-chalk" aria-label={`${red} red cards`}>
                <span className="h-6 w-4 rounded-sm bg-red-500" aria-hidden="true" />
                {red}
            </span>
        </div>
    )
}

/**
 * Rating plus the season's real numbers. While stats load it holds the space with placeholders;
 * if they fail to load it falls back to the player's attribute gauges.
 */
function HeroGauges({ rating, seasonStats, activity, fallback, failed }) {
    const ratingRing =
        rating !== null ? <StatRing label="Rating" display={rating.toFixed(1)} ratio={rating / MAX_RATING} emphasis /> : null

    if (seasonStats) {
        return (
            <div>
                <div className="grid grid-cols-3 justify-items-center gap-x-4 gap-y-6">
                    {ratingRing}
                    {statRings(seasonStats, activity).map((r) => (
                        <StatRing key={r.key} label={r.label} display={r.display} ratio={r.ratio} />
                    ))}
                </div>
                <CardTally yellow={seasonStats.yellow_cards} red={seasonStats.red_cards} />
            </div>
        )
    }

    if (failed) {
        return fallback.length > 0 ? (
            <div className="grid grid-cols-3 justify-items-center gap-x-4 gap-y-6 sm:grid-cols-4">
                {ratingRing}
                {fallback.map((g) => (
                    <StatRing key={g.key} label={g.label} display={Math.round(g.value)} ratio={g.value / 100} />
                ))}
            </div>
        ) : null
    }

    return (
        <div className="grid animate-pulse grid-cols-3 justify-items-center gap-x-4 gap-y-6" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[4.5rem] w-[4.5rem] rounded-full border-4 border-chalk/10" />
            ))}
        </div>
    )
}

// Squad order for the rail: goalkeepers to forwards, then by shirt number
function orderSquad(squad) {
    const rank = (p) => POSITION_ORDER.indexOf(p.position)
    return [...squad].sort((a, b) => rank(a) - rank(b) || (a.jersey_number ?? 0) - (b.jersey_number ?? 0))
}

export default function PlayerProfile() {
    const { user } = useAuth()
    const { id } = useParams();
    const { data: player, loading, error, refetch } = useAsync(
        (signal) => api.players.get(id, { signal }),
        [id],
        null
    )

    const teamId = player?.team?.id
    const { data: squad } = useAsync(
        (signal) => (teamId ? api.players.list({ team_id: teamId }, { signal }) : Promise.resolve([])),
        [teamId],
        []
    )
    const orderedSquad = useMemo(() => orderSquad(squad), [squad])

    // The season's numbers and the club's matches, so each ring can show a share of what the club played
    const { data: season, error: seasonError } = useAsync(
        (signal) =>
            teamId
                ? Promise.all([
                      api.players.stats(id, { signal }),
                      api.matches.list({ team_id: teamId }, { signal }),
                  ]).then(([stats, matches]) => ({ stats, matches }))
                : Promise.resolve(null),
        [id, teamId],
        null
    )

    if (loading) {
        return (
            <div>
                <PublicNavbar user={user} />
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 animate-pulse">
                    <div className="h-8 w-56 bg-line/30 rounded mb-4"/>
                    <div className="h-4 w-36 bg-line/20 rounded"/>

                </div>
            </div>
        )
    }

    // A 404 means the profile is gone; anything else is a load failure worth retrying
    if (error && error.status !== 404) {
        return (
            <div>
                <PublicNavbar user={user} />
                <ErrorState error={error} onRetry={refetch} title="Couldn't load this player" />
            </div>
        )
    }

    if (!player) {
        return (
            <div>
                <PublicNavbar user={user} />
                <EmptyState
                icon={UserX}
                title="Player not found"
                message="This profile may have been removed, or the link is out of date"
                action={
                    <Link to="/players" className="font-body text-sm font-semibold text-floodlight hover:text-chalk transition-colors">
                          ← Back to Players
                    </Link>
                }

                />
            </div>
        )
    }

    const nameParts = player.name.split(" ")
    const surname = nameParts.slice(-1)[0]
    const givenNames = nameParts.slice(0, -1).join(" ")
    const rating = computeOverallRating(player.attributes)
    const gauges = attributeGauges(player.attributes, MAX_GAUGES)
    const details = [
        player.nationality,
        player.age != null ? `Age ${player.age}` : null,
        player.height_cm != null ? `${player.height_cm} cm` : null,
    ].filter(Boolean)
    const activity = season ? teamActivity(player.team.id, season.matches) : null

    return (
        <div key={player.id}>
            <style>{WALKIN_STYLES}</style>
            <PublicNavbar user={user} />

            <main id="main">
            <section className="relative overflow-hidden bg-gradient-to-b from-night to-pitch/20 border-b border-line">
                <span
                    className="pointer-events-none absolute -bottom-6 left-0 max-w-full select-none whitespace-nowrap font-display text-[clamp(8rem,22vw,20rem)] font-bold uppercase leading-none text-chalk/[0.04]"
                    aria-hidden="true"
                >
                    {surname}
                </span>

                <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-12">
                    <Link
                    to="/players"
                    className="inline-flex items-center min-h-11 gap-1.5 font-body text-sm text-chalk/70 hover:text-floodlight transition-colors mb-6"
                    >
                        <ArrowLeft size={15} /> Back to Players
                    </Link>

                    <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
                            {/* A transparent cut-out in photo_url sits on the card's gradient */}
                            <div className="player-walkin-card relative h-64 w-48 shrink-0 overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-pitch/60 to-night">
                                {player.photo_url ? (
                                    <img src={player.photo_url} alt={player.name} className="h-full w-full object-contain object-bottom" />
                                ) : (
                                    <>
                                        <SilhouettePlaceholder className="absolute inset-0 h-full w-full object-cover object-top" />
                                        <span className="absolute -bottom-4 -right-2 select-none font-display text-[7rem] font-bold leading-none text-chalk/10">
                                            {player.jersey_number}
                                        </span>
                                    </>
                                ) }
                                <div className="player-walkin-sweep absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-chalk/25 to-transparent"/>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-floodlight"/>
                            </div>

                            <div className="player-walkin-meta text-center sm:text-left">
                                {player.jersey_number != null && (
                                    <div
                                        className="select-none font-display text-7xl font-bold leading-none text-transparent"
                                        style={{ WebkitTextStroke: "2px var(--color-floodlight)" }}
                                        aria-label={`Shirt number ${player.jersey_number}`}
                                    >
                                        {player.jersey_number}
                                    </div>
                                )}
                                <h1 className="mt-2">
                                    {givenNames && (
                                        <span className="block font-display text-lg uppercase tracking-wide text-chalk/80">{givenNames}</span>
                                    )}
                                    <span className="block font-display text-5xl font-bold uppercase leading-none tracking-wide text-chalk md:text-7xl">
                                        {surname}
                                    </span>
                                </h1>
                                <p className="mt-3 font-display text-lg uppercase tracking-widest2 text-floodlight">{player.position}</p>
                                {details.length > 0 && (
                                    <p className="font-body text-sm text-chalk/70">{details.join(" · ")}</p>
                                )}
                                <Link
                                to = {`/teams/${player.team.id}`}
                                className="mt-1 inline-block font-body text-sm text-floodlight transition-colors hover:text-chalk"
                                >
                                    {player.team.name}
                                </Link>
                            </div>
                        </div>

                        <HeroGauges
                            rating={rating}
                            seasonStats={season?.stats ?? null}
                            activity={activity}
                            fallback={gauges}
                            failed={Boolean(seasonError)}
                        />
                    </div>
                </div>

                <SquadRail squad={orderedSquad} currentId={player.id} />
            </section>

            <PlayerOverview player={player} squad={orderedSquad} seasonStats={season?.stats ?? null} />

            {player.bio && (
                <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10" aria-labelledby="bio-heading">
                    <div className="max-w-3xl rounded-lg border border-line bg-pitch/10 p-6">
                        <h2 id="bio-heading" className="mb-2 font-display text-lg uppercase tracking-wide text-chalk">Biography</h2>
                        <p className="font-body text-sm leading-relaxed text-chalk/70">{player.bio}</p>
                    </div>
                </section>
            )}

        </main>
        </div>
    )
}
