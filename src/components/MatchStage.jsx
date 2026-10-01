import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Users } from "lucide-react"
import LineupPitch from "./LineupPitch"
import MatchStatusBadge from "./MatchStatusBadge"
import TeamEmblem from "./TeamEmblem"
import ErrorState from "./ErrorState"
import { buildLineup } from "../utils/lineup"
import { kickoffTime } from "../utils/matchBoard"
import football1 from "../assets/football1.png"

const PERSPECTIVE_PX = 1400
const NO_SHAPE = []
const LANDSCAPE_MIN_RATIO = 1.2 // the pitch area must be at least this much wider than tall
const PITCH_SIZE = {
    portrait: "aspect-[7/10] h-[min(100cqh,calc(100cqw*10/7))]",
    landscape: "aspect-[10/7] w-[min(100cqw,calc(100cqh*10/7))]",
}

/** Lay the pitch out across a wide area and up a tall one, following the area's actual shape. */
function useAreaOrientation(ref) {
    const [orientation, setOrientation] = useState("portrait")

    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return undefined

        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect
            setOrientation(height > 0 && width / height >= LANDSCAPE_MIN_RATIO ? "landscape" : "portrait")
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [ref])

    return orientation
}
const SIDE_DOT = { home: "bg-floodlight", away: "bg-chalk" }

function TeamBlock({ team, side, formation }) {
    const isHome = side === "home"
    const align = isHome ? "items-end text-right" : "items-start text-left"

    return (
        <div className={`flex min-w-0 flex-col gap-1.5 ${align}`}>
            <TeamEmblem name={team?.name} size="sm" />
            {team ? (
                <Link
                    to={`/teams/${team.id}`}
                    className="line-clamp-2 max-w-full break-words font-display text-sm uppercase tracking-wide text-chalk transition-colors hover:text-floodlight sm:text-lg"
                >
                    {team.name}
                </Link>
            ) : (
                <span className="font-display text-sm uppercase tracking-wide text-chalk/60 sm:text-lg">TBD</span>
            )}
            <span className="inline-flex items-center gap-1.5 font-body text-xs text-chalk/70">
                <span className={`size-2 rounded-full ${SIDE_DOT[side]}`} aria-hidden="true" />
                {isHome ? "Home" : "Away"}
                {formation && <span className="tabular-nums text-chalk/90">· {formation}</span>}
            </span>
        </div>
    )
}

function ScoreBlock({ match }) {
    const hasScore = (match.status === "live" || match.status === "completed") && match.home_score != null

    return (
        <div className="flex flex-col items-center gap-2">
            {hasScore ? (
                <span className="font-display text-4xl font-bold tabular-nums leading-none text-chalk sm:text-5xl">
                    {match.home_score}
                    <span className="mx-2 text-chalk/30" aria-hidden="true">-</span>
                    {match.away_score}
                </span>
            ) : (
                <span className="font-display text-3xl tabular-nums leading-none text-chalk/80 sm:text-4xl">
                    {kickoffTime(match.match_date) || "vs"}
                </span>
            )}
            <MatchStatusBadge status={match.status} minute={match.minute} />
        </div>
    )
}

function unavailableMessage(match) {
    return match.status === "scheduled"
        ? "Starting elevens appear here once they are announced."
        : "No lineup was recorded for this match."
}

function StageOverlay({ match, error, onRetry, isLoading, hasLineups }) {
    if (error) {
        return (
            <div className="rounded-xl border border-glass-border bg-night/90 backdrop-blur">
                <ErrorState error={error} onRetry={onRetry} title="Couldn't load lineups" />
            </div>
        )
    }
    if (isLoading) {
        return (
            <p role="status" className="animate-pulse rounded-lg bg-night/80 px-4 py-2 font-body text-sm text-chalk/80 backdrop-blur">
                Loading lineups…
            </p>
        )
    }
    if (hasLineups) return null

    return (
        <div className="flex max-w-xs flex-col items-center gap-2 rounded-xl border border-glass-border bg-night/85 px-6 py-5 text-center backdrop-blur">
            <Users size={22} className="text-chalk/60" strokeWidth={1.5} aria-hidden="true" />
            <p className="font-display text-sm uppercase tracking-wide text-chalk">Lineups not available</p>
            <p className="font-body text-xs text-chalk/70">{unavailableMessage(match)}</p>
        </div>
    )
}

function describePitch(match, home, away, hasLineups) {
    if (!hasLineups) return "Empty pitch: lineups are not available for this match"
    const homeName = match.home_team?.name ?? "Home"
    const awayName = match.away_team?.name ?? "Away"
    return `Starting lineups: ${homeName} ${home.formation ?? ""} against ${awayName} ${away.formation ?? ""}`
}

/** The centre of the Matches page: score, formations and both starting elevens for one match. */
export default function MatchStage({ match, rows, isLoading, error, onRetry }) {
    const home = useMemo(
        () => buildLineup(rows, match.home_team?.id, match.home_formation),
        [rows, match.home_team?.id, match.home_formation]
    )
    const away = useMemo(
        () => buildLineup(rows, match.away_team?.id, match.away_formation),
        [rows, match.away_team?.id, match.away_formation]
    )
    const hasLineups = !isLoading && home.starters.length + away.starters.length > 0
    const pitchAreaRef = useRef(null)
    const orientation = useAreaOrientation(pitchAreaRef)

    return (
        <section
            aria-label="Match stage"
            className="relative isolate flex min-h-0 flex-col overflow-hidden rounded-xl border border-glass-border bg-black"
        >
            <div className="absolute inset-0 -z-10" aria-hidden="true">
                <img src={football1} alt="" className="h-full w-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/85" />
            </div>

            <header className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 px-4 pb-2 pt-4 sm:gap-6">
                <TeamBlock team={match.home_team} side="home" formation={hasLineups ? home.formation : null} />
                <ScoreBlock match={match} />
                <TeamBlock team={match.away_team} side="away" formation={hasLineups ? away.formation : null} />
            </header>

            <div
                ref={pitchAreaRef}
                className="relative h-[min(142vw,75svh)] [container-type:size] lg:h-auto lg:min-h-0 lg:flex-1"
            >
                <div className="flex h-full w-full items-center justify-center" style={{ perspective: `${PERSPECTIVE_PX}px` }}>
                    <LineupPitch
                        homeShape={hasLineups ? home.shape : NO_SHAPE}
                        awayShape={hasLineups ? away.shape : NO_SHAPE}
                        orientation={orientation}
                        label={describePitch(match, home, away, hasLineups)}
                        className={PITCH_SIZE[orientation]}
                    />
                </div>
                <div className="absolute inset-0 z-10 grid place-items-center p-4">
                    <StageOverlay
                        match={match}
                        error={error}
                        onRetry={onRetry}
                        isLoading={isLoading}
                        hasLineups={hasLineups}
                    />
                </div>
            </div>
        </section>
    )
}
