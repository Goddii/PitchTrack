import { useState, useCallback, useMemo } from "react"
import { useParams, useSearchParams, Link } from "react-router-dom"
import { Calendar, Users2, ShieldQuestion } from "lucide-react"
import PublicNavbar from "../components/PublicNavbar"
import FixtureStrip from "../components/FixtureStrip"
import EmptyState from "../components/EmptyState"
import ErrorState from "../components/ErrorState"
import SquadGrid from "../components/SquadGrid"
import SquadTable from "../components/SquadTable"
import SquadLeaders from "../components/SquadLeaders"
import TeamHero from "../components/TeamHero"
import { NextMatchCard, RecentFormCard, TeamInfoCard, TeamStatsCard } from "../components/TeamRail"
import { summarizeTeam } from "../utils/teamSummary"
import { DEFAULT_TEAM_TAB, TEAM_TABS } from "../utils/teamTabs"
import { useAsync } from "../hooks/useAsync"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"

const NO_ITEMS = []
const MAX_FIXTURES = 6
const FORM_LENGTH = 5

const byDateAsc = (a, b) => new Date(a.match_date) - new Date(b.match_date)
const involves = (teamId) => (m) => m.home_team?.id === teamId || m.away_team?.id === teamId

function PageFrame({ user, children }) {
    return (
        <div>
            <PublicNavbar user={user} />
            {children}
        </div>
    )
}

function MatchesPanel({ upcoming, past }) {
    return (
        <div className="flex flex-col gap-8">
            <section aria-labelledby="team-upcoming">
                <h2 id="team-upcoming" className="mb-4 font-display text-xl uppercase tracking-wide text-chalk">Upcoming matches</h2>
                {upcoming.length > 0 ? (
                    <FixtureStrip fixtures={upcoming} teams={NO_ITEMS} loading={false} error={null} />
                ) : (
                    <EmptyState icon={Calendar} title="No upcoming matches" message="Nothing scheduled for this club yet" />
                )}
            </section>
            <section aria-labelledby="team-past">
                <h2 id="team-past" className="mb-4 font-display text-xl uppercase tracking-wide text-chalk">Past matches</h2>
                {past.length > 0 ? (
                    <FixtureStrip fixtures={past} teams={NO_ITEMS} loading={false} error={null} />
                ) : (
                    <EmptyState icon={Calendar} title="No past matches logged yet" />
                )}
            </section>
        </div>
    )
}

export default function TeamDetails() {
    const { id } = useParams()
    const { user, isAuthenticated } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const [togglingFollow, setTogglingFollow] = useState(false)
    const [followOverride, setFollowOverride] = useState(null) // { id, value } from an optimistic toggle

    const requestedTab = searchParams.get("tab")
    const tab = TEAM_TABS.some((t) => t.value === requestedTab) ? requestedTab : DEFAULT_TEAM_TAB
    const changeTab = useCallback(
        (next) => setSearchParams(next === DEFAULT_TEAM_TAB ? {} : { tab: next }, { replace: true }),
        [setSearchParams]
    )

    const { data, loading, error, refetch } = useAsync(
        (signal) =>
            Promise.all([
                api.teams.get(id, { signal }),
                api.teams.list({ signal }),
                api.matches.list({}, { signal }),
                api.players.list({ team_id: id }, { signal }),
            ]).then(([team, teams, matches, roster]) => ({ team, teams, matches, roster })),
        [id],
        null
    )
    const team = data?.team ?? null
    const teams = data?.teams ?? NO_ITEMS
    const allMatches = data?.matches ?? NO_ITEMS
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

    const summary = useMemo(() => (team ? summarizeTeam(team, teams, allMatches) : null), [team, teams, allMatches])

    if (loading) {
        return (
            <PageFrame user={user}>
                <div className="mx-auto max-w-7xl animate-pulse px-6 py-24 md:px-10">
                    <div className="mb-4 h-8 w-64 rounded bg-line/30" />
                    <div className="h-4 w-40 rounded bg-line/20" />
                </div>
            </PageFrame>
        )
    }
    // A 404 means the club is gone; anything else is a load failure worth retrying
    if (error && error.status !== 404) {
        return (
            <PageFrame user={user}>
                <ErrorState error={error} onRetry={refetch} title="Couldn't load this team" />
            </PageFrame>
        )
    }
    if (!team) {
        return (
            <PageFrame user={user}>
                <EmptyState
                    icon={ShieldQuestion}
                    title="Team not found"
                    message="This club may have been removed or the link is out of date"
                    action={
                        <Link to="/teams" className="font-body text-sm font-semibold text-floodlight transition-colors hover:text-chalk">
                            ← Back to Teams
                        </Link>
                    }
                />
            </PageFrame>
        )
    }

    const teamId = team.id
    const teamMatches = allMatches.filter(involves(teamId))
    // Live matches belong with what is still to play, so a club mid-game never shows an empty list
    const upcoming = teamMatches.filter((m) => m.status !== "completed").sort(byDateAsc).slice(0, MAX_FIXTURES)
    const past = teamMatches.filter((m) => m.status === "completed").sort(byDateAsc).slice(-MAX_FIXTURES)
    const captain = roster.find((p) => p.id === team.captain_id) ?? null

    return (
        <PageFrame user={user}>
            <main id="main" className="mx-auto grid max-w-7xl gap-4 px-4 py-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="flex min-w-0 flex-col gap-4">
                    <TeamHero
                        team={team}
                        league={summary.league}
                        tab={tab}
                        onTabChange={changeTab}
                        isFollowable={isAuthenticated}
                        followed={followed}
                        isToggling={togglingFollow}
                        onToggleFollow={handleToggleFollow}
                    />

                    <section
                        role="tabpanel"
                        id="team-panel"
                        aria-labelledby={`team-tab-${tab}`}
                        className="rounded-xl border border-glass-border bg-glass-bg p-4 md:p-5"
                    >
                        {tab === "overview" && (
                            <>
                                <h2 className="mb-4 font-display text-xl uppercase tracking-wide text-chalk">
                                    Squad <span className="ml-1 font-body text-sm normal-case tracking-normal text-chalk/60">{roster.length} players</span>
                                </h2>
                                {roster.length > 0 ? (
                                    <SquadGrid players={roster} captainId={team.captain_id} />
                                ) : (
                                    <EmptyState icon={Users2} title="No players listed yet" message="This club hasn't added a roster" />
                                )}
                            </>
                        )}
                        {tab === "squad" &&
                            (roster.length > 0 ? (
                                <SquadTable teamId={teamId} players={roster} />
                            ) : (
                                <EmptyState icon={Users2} title="No players listed yet" message="This club hasn't added a roster" />
                            ))}
                        {tab === "matches" && <MatchesPanel upcoming={upcoming} past={past} />}
                        {tab === "stats" && <SquadLeaders teamId={teamId} />}
                    </section>
                </div>

                <aside aria-label="Team details" className="flex min-w-0 flex-col gap-4">
                    <TeamInfoCard team={team} captain={captain} />
                    <TeamStatsCard lastTen={summary.lastTen} />
                    <RecentFormCard form={summary.league?.form.slice(-FORM_LENGTH) ?? NO_ITEMS} />
                    <NextMatchCard match={summary.nextMatch} teamId={teamId} />
                </aside>
            </main>
        </PageFrame>
    )
}
