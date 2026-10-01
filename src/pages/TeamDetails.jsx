import { useState, useCallback, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, MapPin, Calendar, Star, Users2, ShieldQuestion } from "lucide-react"
import PublicNavbar from "../components/PublicNavbar"
import FixtureStrip from "../components/FixtureStrip"
import EmptyState from "../components/EmptyState"
import PlayerFormationCard from "../components/PlayerFormationCard"
import FormationPitch from "../components/FormationPitch"
import ErrorState from "../components/ErrorState"
import FormPills from "../components/FormPills"
import { computeStandings } from "../utils/standings"
import { useAsync } from "../hooks/useAsync"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"

const NO_ITEMS = []
const MAX_FIXTURES = 6

const byDateAsc = (a, b) => new Date(a.match_date) - new Date(b.match_date)


export default function TeamDetails() {
    const { id } = useParams()
    const { user, isAuthenticated } = useAuth()
    const [togglingFollow, setTogglingFollow] = useState(false)
    const [followOverride, setFollowOverride] = useState(null) // { id, value } from an optimistic toggle

    const { data, loading, error, refetch } = useAsync(
        (signal) =>
            Promise.all([
                api.teams.get(id, { signal }),
                api.matches.list({ team_id: id }, { signal }),
                api.players.list({ team_id: id }, { signal }),
            ]).then(([team, matches, roster]) => ({ team, matches, roster })),
        [id],
        null
    )
    const team = data?.team ?? null
    const matches = data?.matches ?? NO_ITEMS
    const roster = data?.roster ?? NO_ITEMS

    // Follow state loads on its own, so auth resolving doesn't reload the whole page
    const { data: favorites } = useAsync(
        (signal) => (isAuthenticated ? api.favorites.list({ signal }) : Promise.resolve([])),
        [isAuthenticated],
        []
    )
    const serverFollowed = favorites.some((f) => String(f.team.id) === String(id))
    const followed = followOverride?.id === id ? followOverride.value : serverFollowed

    const handleToggleFollow = useCallback(async () => {
        if (togglingFollow) return
        setTogglingFollow(true)
        const prev = followed
        setFollowOverride({ id, value: !prev })
        try {
            if (prev) {
                await api.favorites.unfollow(Number(id))
            } else {
                await api.favorites.follow(Number(id))
            }
        } catch {
            setFollowOverride({ id, value: prev })
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

    const record = useMemo(
        () => (team ? computeStandings([team], matches)[0] : null),
        [team, matches]
    )

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
    // A 404 means the club is gone; anything else is a load failure worth retrying
    if (error && error.status !== 404) {
        return (
            <div>
                <PublicNavbar user={user} />
                <ErrorState error={error} onRetry={refetch} title="Couldn't load this team" />
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

    // Live matches belong with what is still to play, so a club mid-game never shows an empty list
    const upcoming = matches.filter((m) => m.status !== "completed").sort(byDateAsc).slice(0, MAX_FIXTURES)
    const past = matches.filter((m) => m.status === "completed").sort(byDateAsc).slice(-MAX_FIXTURES)

    return (
        <div>
            <PublicNavbar user={user} />

            <main id="main">
            {/*Hero*/}
            <section className="relative overflow-hidden bg-gradient-to-b from-night to-pitch/20 border-b border-line">
                <span
                    className="pointer-events-none absolute -bottom-8 right-0 max-w-full select-none whitespace-nowrap font-display text-[12rem] font-bold uppercase leading-none text-chalk/[0.04]"
                    aria-hidden="true"
                >
                    {team.name.split(" ")[0]}
                </span>
                <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-14">
                    <Link 
                        to="/teams"
                        className="inline-flex items-center min-h-11 gap-1.5 font-body text-sm text-chalk/60 hover:text-floodlight transition-colors mb-8"
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
                                {team.coach && <span className="flex items-center gap-1.5"> <Users2 size={14}/>Coach: {team.coach}</span>}

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

                    {record && (
                        <div className="mt-10 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
                            <dl className="grid grid-cols-4 gap-x-6 gap-y-4 sm:grid-cols-7">
                                {[
                                    ["P", record.played],
                                    ["W", record.wins],
                                    ["D", record.draws],
                                    ["L", record.losses],
                                    ["GF", record.goalsFor],
                                    ["GA", record.goalsAgainst],
                                    ["Pts", record.points],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <dt className="font-body text-xs uppercase tracking-widest2 text-chalk/70">{label}</dt>
                                        <dd
                                            className={`font-display text-3xl font-bold tabular-nums ${
                                                label === "Pts" ? "text-floodlight" : "text-chalk"
                                            }`}
                                        >
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                            <div>
                                <div className="mb-2 font-body text-xs uppercase tracking-widest2 text-chalk/70">Form</div>
                                <FormPills form={record.form} />
                            </div>
                        </div>
                    )}

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
                                      className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-evenly gap-x-3 gap-y-4 md:gap-x-5"
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
                <h2 className="font-display uppercase tracking-wide text-2xl text-chalk mb-8"> Upcoming matches</h2>
                {upcoming.length > 0 ? (
                    <FixtureStrip fixtures={upcoming} teams={NO_ITEMS} loading={false} error={null} />
                ): (
                    <EmptyState icon={Calendar} title="No upcoming matches" message="Nothing scheduled for this club yet"/>
                )}

            </section>

            {/* Past matches */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
                <h2 className="font-display uppercase tracking-wide text-2xl text-chalk mb-8"> Past Matches</h2>
                {past.length > 0 ? (
                    <FixtureStrip fixtures={past} teams={NO_ITEMS} loading={false} error={null} />
                ): (
                    <EmptyState icon={Calendar} title="No past matches logged yet"/>
                )}

            </section>
        </main>
        </div>
    )
}