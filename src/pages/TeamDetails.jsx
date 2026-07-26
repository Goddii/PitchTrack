import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, MapPin, Calendar, Star, Users2, ShieldQuestion } from "lucide-react"
import Navbar from "../components/Navbar"
import MatchCard from "../components/MatchCard"
import EmptyState from "../components/EmptyState"
import { MOCK_TEAMS, MOCK_MATCHES, MOCK_PLAYERS} from "../data/mockData"


export default function TeamDetails() {
    const { id } = useParams()
    const [team, setTeam] = useState(null)
    const [loading, setLoading] = useState(true)
    const [followed, setFollowed] = useState(false)

    //todo replace with fetch api/teams/${id}
    useEffect(() => {
        setLoading(true)
        const timer = setTimeout(() => {
            const found = MOCK_TEAMS.find((t) => String(t.id) === String(id))
            setTeam(found ?? null)
            setLoading(false)
        }, 400)
        return () => clearTimeout(timer)
    }, [id])

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 animate-pulse">
                    <div className="h-8 w-64 bg-line/30 rounded mb-4"/>
                    <div className="h-4 w-40 bg-line/20 rounded"/>

                </div>
            </div>
        )
    }
    if (!team) {
        return (
            <div>
                <Navbar />
                <EmptyState 
                    icon={ShieldQuestion}
                    title="Team not found"
                    message="This club may have been removed or the link is out of date"
                    action = {
                        <Link to="/teams" className="font-body text-sm font-semibold text-floodlight hover:text-chalk transition-colors">
                            ← Back to Teams
                        </Link>
                    }
                />
            </div>
        )
    }

    const teamMatches = MOCK_MATCHES.filter(
        (m) => m.home_team.id === team.id || m.away_team.id === team.id
    )

    const upcoming = teamMatches.filter((m) => m.status !== "completed")
    const past = teamMatches.filter((m) => m.status === "completed")
    const roster = MOCK_PLAYERS.filter((p) => p.team.id === team.id)


    return (
        <div>
            <Navbar />

            {/*Hero*/}
            <section className="bg-gradient-to-b from-night to-pitch/20 border-b border-line">
                <div className="max-w--7xl mx-auto px-6 md:px-10 py-14">
                    <Link 
                        to="/teams"
                        className="inline-flex items-center gap-1.5 font-body text-sm text-chalk/50 hover:text-floodlight transition-colors mb-8"
                    >
                        <ArrowLeft size={15} /> Back to Teams
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="w-24  h-24 rounded-full bg-pitch flex items-center justify-center shrink-0 border border-line">
                            {team.logo_url ? (
                                <img  src={team.logo_url} alt={`${team.name} logo`} className="w-full h-full object-cover rounded-full"/>
                            ): (
                                <span className="font-display text-chalk/60 text-3xl">
                                    {team.name.charAt(0)}
                                </span>
                            )}

                        </div>
                        <div className="flex-1">
                            <h1 className="font-display uppercase tracking-wide text-4xl md:text-5xl text-chalk mb-3">
                                {team.name}
                            </h1>
                            <div className="flex flex-wrap gap-x-5 gap-y-2 font-body text-sm text-chalk/60">
                                <span className="flex items-center gap-1.5"><MapPin size={14}/> {team.city} </span>
                                <span className="flex items-center gap-1.5"> <Calendar size={14} /> Est. {team.founded_year}</span>
                                {team.coach && <span className="flex items-center gap-1.5"> <Users2 size={14}/>Coach:{team.coach}</span>}

                            </div>

                        </div>
                        <button
                            onClick = {() => setFollowed((f) => !f)}
                            aria-pressed={followed}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded font-body font-semibold text-sm transition-colors cursor-pointer ${
                                followed
                                ? "bg-pitch/20 border border-floodlight text-floodlight"
                                : "bg-floodlight text-night hover:bg-chalk"
                            }`}
                        >
                            <Star size={16} fill={followed ? "currentColor" : "none"} />
                            {followed ? "Following" : "Follow"}

                        </button>

                    </div>

                </div>

            </section>

            {/* ROSTER */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                <h2 className="font-display uppercase tracking-wide text-2xl text-chalk mb-8">Roster</h2>
                {roster.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {roster.map((player) => (
                            <Link
                                key={player.id}
                                to={`/player/${player.id}`}
                                className="bg-pitch/10 border border-line rounded-lg p-4 flex items-center gap-3 hover:border-floodlight transition-colors"
                            >
                                <span className="font-display text-lg text-floodlight tabular-nums w-8 shrink-0">
                                    #{player.jersey_number}
                                </span>
                                <div className="min-w-0">
                                    <div className="font-body text-sm text-chalk truncate"> {player.name}</div>
                                    <div className="font-body text-xs text-chalk/45">
                                    {player.position}</div>
                                </div>
                            
                            </Link>
                        ))}
                    </div>
                ): (
                    <EmptyState icon={Users2} title="No player listed yet" message="This club hasn't added a roster"/>
                )}

            </section>

            {/* Upcoming matches */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 pb-16">
                <h2 className="font-display uppercase tracking-wide text-2l text-chalk mb-8"> Upcoming matches</h2>
                {upcoming.length > 0 ? (
                    <div className="bg-pitch/30 border border-line rounded-lg overflow-hidden">
                        {upcoming.map((m) => (
                            <MatchCard key={m.id} match={m} />
                        ))}
                    </div>
                ): (
                    <EmptyState icon={Calendar} title="No upcoming matches" message="Nothing scheduled for this club yet"/>
                )}

            </section>

            {/* Past matches */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
                <h2 className="font-display uppercase tracking-wide text-2xl text-chalk mb-8"> Past Matches</h2>
                {past.length > 0 ? (
                    <div className="bg-pitch/30 border border-line rounded-lg overflow-hidden">
                        {past.map((m) => (
                            <MatchCard key={m.id} match={m} />
                        ))}
                    </div>
                ): (
                    <EmptyState icon={Calendar} title="No past matches logged yet"/>
                )}

            </section>
        </div>
    )
}