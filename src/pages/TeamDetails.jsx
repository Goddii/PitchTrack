import { useEffect, useState, useCallback, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, MapPin, Calendar, Star, Users2, ShieldQuestion } from "lucide-react"
import PublicNavbar from "../components/PublicNavbar"
import MatchCard from "../components/MatchCard"
import EmptyState from "../components/EmptyState"
import PlayerFormationCard from "../components/PlayerFormationCard"
import FormationPitch from "../components/FormationPitch"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"


export default function TeamDetails() {
    const { id } = useParams()
    const { user, isAuthenticated } = useAuth()
    const [team, setTeam] = useState(null)
    const [loading, setLoading] = useState(true)
    const [followed, setFollowed] = useState(false)
    const [togglingFollow, setTogglingFollow] = useState(false)
    const [matches, setMatches] = useState([])
    const [roster, setRoster] = useState([])

    useEffect(() => {
        let cancelled = false
        setLoading(true)

        const fetchData = async () => {
            try {
                const [teamData, matchesData, playersData] = await Promise.all([
                    api.teams.get(id),
                    api.matches.list({ team_id: id }),
                    api.players.list({ team_id: id }),
                ])
                if (cancelled) return
                setTeam(teamData)
                setMatches(matchesData)
                setRoster(playersData)

                // Check if user already follows this team
                if (isAuthenticated) {
                    try {
                        const favs = await api.favorites.list()
                        if (!cancelled) {
                            setFollowed(favs.some((f) => String(f.team.id) === String(id)))
                        }
                    } catch { /* ignore */ }
                }
            } catch {
                if (!cancelled) setTeam(null)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchData()
        return () => { cancelled = true }
    }, [id, isAuthenticated])

    const handleToggleFollow = useCallback(async () => {
        if (togglingFollow) return
        setTogglingFollow(true)
        const prev = followed
        setFollowed((f) => !f)
        try {
            if (prev) {
                await api.favorites.unfollow(Number(id))
            } else {
                await api.favorites.follow(Number(id))
            }
        } catch {
            setFollowed(prev)
        } finally {
            setTogglingFollow(false)
        }
    }, [id, followed, togglingFollow])

    /* ── Group roster by position for formation layout ── */
    const lines = useMemo(() => {
      const groups = {
        Forward: [],
        Midfielder: [],
        Defender: [],
        Goalkeeper: [],
      }
      roster.forEach((p) => {
        if (groups[p.position]) {
          groups[p.position].push(p)
        }
      })
      return groups
    }, [roster])

    if (loading) {
        return (
            <div>
                <PublicNavbar user={user} />
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
                <PublicNavbar user={user} />
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

    const upcoming = matches.filter((m) => m.status !== "completed" && m.status !== "live")
    const past = matches.filter((m) => m.status === "completed")

    return (
        <div>
            <PublicNavbar user={user} />

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
                        {isAuthenticated && (
                            <button
                                onClick={handleToggleFollow}
                                disabled={togglingFollow}
                                aria-pressed={followed}
                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded font-body font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                    followed
                                    ? "bg-pitch/20 border border-floodlight text-floodlight"
                                    : "bg-floodlight text-night hover:bg-chalk"
                                }`}
                            >
                                <Star size={16} fill={followed ? "currentColor" : "none"} />
                                {followed ? "Following" : "Follow"}
                            </button>
                        )}

                    </div>

                </div>

            </section>

            {/* ROSTER — Formation pitch with position-based layout */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                <h2 className="font-display uppercase tracking-wide text-2xl text-chalk mb-8">Lineup</h2>
                {roster.length > 0 ? (
                    <FormationPitch className="min-h-[450px] md:min-h-[580px]">
                        <div className="flex flex-col justify-evenly h-full min-h-[450px] md:min-h-[580px] py-6 md:py-10 px-3 md:px-6">
                            {["Forward", "Midfielder", "Defender", "Goalkeeper"].map(
                                (position) =>
                                  lines[position]?.length > 0 && (
                                    <div
                                      key={position}
                                      className="flex justify-center items-center gap-x-3 md:gap-x-5 gap-y-4 flex-wrap"
                                    >
                                      {lines[position].map((player) => (
                                        <PlayerFormationCard
                                          key={player.id}
                                          player={player}
                                          teamName={team.name}
                                        />
                                      ))}
                                    </div>
                                  )
                            )}
                        </div>
                    </FormationPitch>
                ) : (
                    <EmptyState
                      icon={Users2}
                      title="No players listed yet"
                      message="This club hasn't added a roster"
                    />
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