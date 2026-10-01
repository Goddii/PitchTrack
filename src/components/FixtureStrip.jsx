import { Link } from "react-router-dom"
import TeamEmblem from "./TeamEmblem"
import MatchStatusBadge from "./MatchStatusBadge"
import ErrorState from "./ErrorState"

const SKELETON_COUNT = 4
const GHOST_FIXTURES = 3

function formatKickoff(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
}

function FixtureScore({ match }) {
    const hasScore = (match.status === "live" || match.status === "completed") && match.home_score != null

    if (!hasScore) {
        return (
            <div className="text-center">
                <div className="font-body text-xs uppercase tracking-widest2 text-chalk/70">vs</div>
                {match.match_date && (
                    <div className="font-body text-xs text-chalk/70 mt-1 whitespace-nowrap">
                        {formatKickoff(match.match_date)}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="font-display text-2xl font-bold text-chalk tabular-nums whitespace-nowrap">
            {match.home_score}
            <span className="text-chalk/40 mx-1.5" aria-hidden="true">-</span>
            {match.away_score}
        </div>
    )
}

function FixtureCard({ match, index }) {
    const home = match.home_team?.name ?? "TBD"
    const away = match.away_team?.name ?? "TBD"

    return (
        <li className="fixture-strip-item" style={{ "--i": index }}>
            <Link to={`/matches/${match.id}`} className="fixture-card" aria-label={`${home} versus ${away}`}>
                <MatchStatusBadge status={match.status} minute={match.minute} />
                <div className="fixture-card-teams">
                    <div className="fixture-card-team">
                        <TeamEmblem name={home} size="sm" />
                        <span className="fixture-card-name" title={home}>{home}</span>
                    </div>
                    <FixtureScore match={match} />
                    <div className="fixture-card-team">
                        <TeamEmblem name={away} size="sm" />
                        <span className="fixture-card-name" title={away}>{away}</span>
                    </div>
                </div>
            </Link>
        </li>
    )
}

/** Registered clubs in a ghosted fixture layout, so an empty league still looks like football. */
function GhostFixtures({ teams }) {
    const pairs = Array.from({ length: GHOST_FIXTURES }, (_, i) => [
        teams[(i * 2) % teams.length],
        teams[(i * 2 + 1) % teams.length],
    ])

    return (
        <>
            <ul className="fixture-strip" aria-hidden="true">
                {pairs.map(([home, away], i) => (
                    <li key={i} className="fixture-strip-item fixture-strip-ghost" style={{ "--i": i }}>
                        <div className="fixture-card">
                            <div className="fixture-card-teams">
                                <div className="fixture-card-team">
                                    <TeamEmblem name={home?.name} size="sm" />
                                    <span className="fixture-card-name">{home?.name ?? ""}</span>
                                </div>
                                <span className="font-body text-xs uppercase tracking-widest2 text-chalk/70">vs</span>
                                <div className="fixture-card-team">
                                    <TeamEmblem name={away?.name} size="sm" />
                                    <span className="fixture-card-name">{away?.name ?? ""}</span>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            <p className="fixture-strip-empty">Fixtures appear here once they are scheduled.</p>
        </>
    )
}

function StripSkeleton() {
    return (
        <ul className="fixture-strip" aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <li key={i} className="fixture-strip-item">
                    <div className="fixture-card animate-pulse">
                        <div className="h-5 w-16 rounded-md bg-line/40" />
                        <div className="h-10 rounded bg-line/30" />
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default function FixtureStrip({ fixtures, teams, loading, error, onRetry }) {
    if (error) {
        return <ErrorState error={error} onRetry={onRetry} title="League data unavailable" />
    }

    if (loading) return <StripSkeleton />

    if (fixtures.length === 0) {
        return teams.length > 0 ? (
            <GhostFixtures teams={teams} />
        ) : (
            <p className="fixture-strip-empty">Fixtures appear here once clubs and matches are added.</p>
        )
    }

    return (
        <ul className="fixture-strip">
            {fixtures.map((match, i) => (
                <FixtureCard key={match.id} match={match} index={i} />
            ))}
        </ul>
    )
}
