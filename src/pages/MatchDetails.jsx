import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, MapPin, Calendar, CalendarX } from "lucide-react"
import Navbar from "../components/Navbar"
import EmptyState from "../components/EmptyState"
import { MOCK_MATCHES } from "../data/mockData"

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    })
}

function TeamColumn({ team }) {
    return (
        <Link
            to={`/teams/${team.id}`}
            className="flex-1 flex flex-col items-center gap-3 text-center min-w-0 group"
        >
            <span className="w-20 h-20 rounded-full bg-pitch flex items-center justify-center font-display text-chalk/60 text-2xl shrink-0 border border-line group-hover:border-floodlight transition-colors">
                {team.name.charAt(0)}
            </span>
            <span className="font-display uppercase tracking-wide text-lg text-chalk truncate max-w-full group-hover:text-floodlight transition-colors">
                {team.name}
            </span>
        </Link>
    )
}
export default function MatchDetails() {
    const { id } = useParams()
    const [match, setMatch] = useState(null)
    const [loading, setLoading] = useState(true)

    //todo replace with fetch api/matches/${id}
    useEffect(() => {
        setLoading(true)
        const timer = setTimeout(() => {
            const found = MOCK_MATCHES.find((m) => String(m.id) === String(id))
            setMatch(found ?? null)
            setLoading(false)
        }, 400)
        return () => clearTimeout(timer)
    }, [id])

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 animate-pulse">
                    <div className="h-8 w-64 bg-line/30 rounded mb-4" />
                    <div className="h-4 w-40 bg-line/20 rounded" />
                </div>
            </div>
        )
    }

    if (!match) {
        return (
            <div>
                <Navbar />
                <EmptyState
                    icon={CalendarX}
                    title="Match not found"
                    message="This fixture may have been removed or the link is out of date"
                    action={
                        <Link to="/matches" className="font-body text-sm font-semibold text-floodlight hover:text-chalk transition-colors">
                            ← Back to Matches
                        </Link>
                    }
                />
            </div>
        )
    }

    const isCompleted = match.status === "completed"
    const isLive = match.status === "live"

    return (
        <div>
            <Navbar />

            {/* Hero */}
            <section className="bg-gradient-to-b from-night to-pitch/20 border-b border-line">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
                    <Link
                        to="/matches"
                        className="inline-flex items-center gap-1.5 font-body text-sm text-chalk/50 hover:text-floodlight transition-colors mb-8"
                    >
                        <ArrowLeft size={15} /> Back to Matches
                    </Link>

                    <div className="flex items-center justify-center mb-6">
                        {isLive ? (
                            <span className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-widest2 text-floodlight">
                                <span className="w-1.5 h-1.5 rounded-full bg-floodlight animate-pulse" />
                                Live · {match.minute}'
                            </span>
                        ) : (
                            <span className="font-body text-xs font-semibold uppercase tracking-widest2 text-chalk/40">
                                {isCompleted ? "Full time" : "Scheduled"}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <TeamColumn team={match.home_team} />

                        <div className="flex flex-col items-center shrink-0 px-2">
                            {isCompleted || isLive ? (
                                <span className="font-display text-5xl font-bold tabular-nums text-chalk">
                                    {match.home_score} - {match.away_score}
                                </span>
                            ) : (
                                <span className="font-display text-3xl text-chalk/40 uppercase tracking-widest2">vs</span>
                            )}
                        </div>

                        <TeamColumn team={match.away_team} />
                    </div>
                </div>
            </section>

            {/* Match info */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                <h2 className="font-display uppercase tracking-wide text-2xl text-chalk mb-8">Match Info</h2>
                <div className="bg-pitch/30 border border-line rounded-lg divide-y divide-line">
                    <div className="flex items-center gap-3 px-5 py-4 font-body text-sm">
                        <Calendar size={16} className="text-chalk/40 shrink-0" />
                        <span className="text-chalk/60">Date</span>
                        <span className="ml-auto text-chalk">{formatDate(match.match_date)}</span>
                    </div>
                    {!isCompleted && (
                        <div className="flex items-center gap-3 px-5 py-4 font-body text-sm">
                            <Calendar size={16} className="text-chalk/40 shrink-0" />
                            <span className="text-chalk/60">Kickoff</span>
                            <span className="ml-auto text-chalk">{formatTime(match.match_date)}</span>
                        </div>
                    )}
                    {match.venue && (
                        <div className="flex items-center gap-3 px-5 py-4 font-body text-sm">
                            <MapPin size={16} className="text-chalk/40 shrink-0" />
                            <span className="text-chalk/60">Venue</span>
                            <span className="ml-auto text-chalk">{match.venue}</span>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
