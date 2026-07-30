import { useEffect, useMemo, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import {
    Star, LogOut, User, Mail, Save,
    AlertCircle, CheckCircle2,
    Trophy, Calendar, ArrowRight,
    Zap, ChevronRight,
} from "lucide-react"
import DashboardNav from "../components/DashboardNav"
import TeamCard from "../components/TeamCard"
import TeamcardSkeleton from "../components/TeamcardSkeleton"
import EmptyState from "../components/EmptyState"
import DashboardStatCard from "../components/DashboardStatCard"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"

/* ─────────────────────────────────────────────
   Sub-components (Dashboard-specific)
   ───────────────────────────────────────────── */

function SectionHeader({ title, action }) {
    return (
        <div className="flex items-center justify-between mb-5">
            <h2 className="font-display uppercase tracking-wide text-lg text-chalk">{title}</h2>
            {action && (
                <Link
                    to={action.to}
                    className="font-body text-xs font-semibold uppercase tracking-widest2 text-floodlight hover:text-chalk transition-colors inline-flex items-center gap-1"
                >
                    {action.label}
                    <ChevronRight size={13} />
                </Link>
            )}
        </div>
    )
}

function LiveMatchCard({ match }) {
    return (
        <Link
            to={`/matches/${match.id}`}
            className="group block bg-gradient-to-br from-floodlight/5 to-floodlight/[0.02] border border-floodlight/20 rounded-xl p-5 hover:border-floodlight/40 hover:shadow-[0_8px_32px_rgba(255,182,39,0.06)] transition-all duration-300"
        >
            <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-floodlight animate-pulse" />
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-floodlight">
                    Live · {match.minute}&prime;
                </span>
            </div>
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-chalk truncate">
                        {match.home_team?.name}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="font-display text-xl font-bold text-chalk tabular-nums">
                        {match.home_score}
                    </span>
                    <span className="font-body text-xs text-chalk/30">-</span>
                    <span className="font-display text-xl font-bold text-chalk tabular-nums">
                        {match.away_score}
                    </span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                    <p className="font-body text-sm font-semibold text-chalk truncate">
                        {match.away_team?.name}
                    </p>
                </div>
            </div>
            {match.venue && (
                <p className="font-body text-[11px] text-chalk/40 mt-3 truncate">{match.venue}</p>
            )}
        </Link>
    )
}

function FixtureCard({ match }) {
    const date = new Date(match.match_date)
    const day = date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
    const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })

    return (
        <Link
            to={`/matches/${match.id}`}
            className="group flex items-center justify-between bg-glass-bg border border-glass-border rounded-xl px-5 py-4 hover:border-chalk/15 hover:bg-chalk/[0.02] transition-all duration-200"
        >
            <div className="flex items-center gap-4 min-w-0">
                <div className="flex flex-col items-center shrink-0">
                    <span className="font-body text-[10px] uppercase tracking-widest2 text-chalk/40">{day}</span>
                </div>
                <div className="min-w-0">
                    <p className="font-body text-sm text-chalk truncate group-hover:text-floodlight transition-colors">
                        {match.home_team?.name} vs {match.away_team?.name}
                    </p>
                    <p className="font-body text-xs text-chalk/40 mt-0.5">{time}</p>
                </div>
            </div>
            {match.venue && (
                <span className="font-body text-[11px] text-chalk/30 hidden sm:block truncate max-w-[160px] text-right">
                    {match.venue}
                </span>
            )}
        </Link>
    )
}

function ResultCard({ match }) {
    return (
        <Link
            to={`/matches/${match.id}`}
            className="group flex items-center justify-between bg-glass-bg border border-glass-border rounded-xl px-5 py-4 hover:border-chalk/15 hover:bg-chalk/[0.02] transition-all duration-200"
        >
            <div className="flex items-center gap-4 min-w-0">
                <span className="font-body text-[10px] uppercase tracking-widest2 text-chalk/40 shrink-0">FT</span>
                <div className="min-w-0">
                    <p className="font-body text-sm text-chalk truncate group-hover:text-floodlight transition-colors">
                        {match.home_team?.name} vs {match.away_team?.name}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 font-display text-base font-bold tabular-nums text-chalk">
                <span>{match.home_score}</span>
                <span className="text-chalk/30 text-sm">-</span>
                <span>{match.away_score}</span>
            </div>
        </Link>
    )
}

function QuickLink({ to, icon: Icon, label, description }) {
    return (
        <Link
            to={to}
            className="group flex items-center gap-4 bg-glass-bg border border-glass-border rounded-xl px-5 py-4 hover:border-floodlight/30 hover:bg-floodlight/[0.03] transition-all duration-200"
        >
            <div className="p-2.5 rounded-lg bg-floodlight/10 text-floodlight group-hover:bg-floodlight/20 transition-colors">
                <Icon size={18} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold text-chalk group-hover:text-floodlight transition-colors">
                    {label}
                </p>
                {description && (
                    <p className="font-body text-xs text-chalk/40 mt-0.5">{description}</p>
                )}
            </div>
            <ChevronRight size={15} className="text-chalk/20 group-hover:text-floodlight/50 transition-colors shrink-0" />
        </Link>
    )
}

/* ─────────────────────────────────────────────
   Skeleton Loaders
   ───────────────────────────────────────────── */

function StatsRowSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-glass-bg border border-glass-border p-5 animate-pulse">
                    <div className="h-8 w-16 bg-line/20 rounded mb-3" />
                    <div className="h-3 w-24 bg-line/10 rounded" />
                </div>
            ))}
        </div>
    )
}

function CardGridSkeleton({ count = 3 }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <TeamcardSkeleton key={i} />
            ))}
        </div>
    )
}

function ListSkeleton({ rows = 3 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="rounded-xl bg-glass-bg border border-glass-border px-5 py-4 animate-pulse">
                    <div className="h-4 w-3/4 bg-line/15 rounded" />
                </div>
            ))}
        </div>
    )
}

/* ─────────────────────────────────────────────
   Main Dashboard Component
   ───────────────────────────────────────────── */

export default function Dashboard() {
    const { user, logout, updateProfile } = useAuth()

    // Data state
    const [favorites, setFavorites] = useState([])
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)

    // Profile state
    const [name, setName] = useState(user?.name || "")
    const [email, setEmail] = useState(user?.email || "")
    const [profileError, setProfileError] = useState("")
    const [profileSuccess, setProfileSuccess] = useState("")
    const [savingProfile, setSavingProfile] = useState(false)

    // ── Data fetching ──
    useEffect(() => {
        let cancelled = false
        setLoading(true)

        Promise.all([
            api.favorites.list(),
            api.matches.list(),
        ])
            .then(([favs, matchesData]) => {
                if (cancelled) return
                setFavorites(favs)
                setMatches(matchesData)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [])

    // ── Derived data ──
    const favoriteTeamIds = useMemo(() => new Set(favorites.map((f) => f.team.id)), [favorites])

    const liveMatches = useMemo(
        () => matches.filter((m) => m.status === "live"),
        [matches]
    )

    const favoriteTeamMatches = useMemo(
        () => matches.filter((m) => favoriteTeamIds.has(m.home_team?.id) || favoriteTeamIds.has(m.away_team?.id)),
        [matches, favoriteTeamIds]
    )

    const upcomingFixtures = useMemo(
        () => favoriteTeamMatches
            .filter((m) => m.status === "scheduled")
            .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
            .slice(0, 5),
        [favoriteTeamMatches]
    )

    const recentResults = useMemo(
        () => favoriteTeamMatches
            .filter((m) => m.status === "completed")
            .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
            .slice(0, 4),
        [favoriteTeamMatches]
    )

    // ── Stats ──
    const stats = useMemo(() => [
        { label: "Teams Followed",  value: favorites.length,    icon: Star,      accent: true },
        { label: "Live Now",        value: liveMatches.length,  icon: Zap,       accent: liveMatches.length > 0 },
        { label: "Upcoming",        value: matches.filter((m) => m.status === "scheduled").length, icon: Calendar, accent: false },
        { label: "Completed",       value: matches.filter((m) => m.status === "completed").length, icon: Trophy,   accent: false },
    ], [favorites.length, liveMatches.length, matches])

    // ── Handlers ──
    const handleUnfollow = useCallback(async (teamId) => {
        const prev = favorites
        setFavorites((f) => f.filter((fav) => fav.team.id !== teamId))
        try {
            await api.favorites.unfollow(teamId)
        } catch {
            setFavorites(prev)
        }
    }, [favorites])

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setProfileError("")
        setProfileSuccess("")
        setSavingProfile(true)
        try {
            await updateProfile({ name: name.trim(), email: email.trim().toLowerCase() })
            setProfileSuccess("Profile updated successfully")
        } catch (err) {
            setProfileError(err.message || "Couldn't update your profile")
        } finally {
            setSavingProfile(false)
        }
    }

    return (
        <div className="min-h-screen bg-night">
            <DashboardNav />

            {/* ── Hero / Welcome Section ── */}
            <section className="relative overflow-hidden">
                {/* Background ambient glow */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 50% 0%, rgba(255,182,39,0.06) 0%, transparent 60%)"
                    }}
                />
                <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                        <div>
                            <h1 className="font-display uppercase tracking-wide text-3xl md:text-4xl text-chalk">
                                Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                            </h1>
                            <p className="font-body text-sm text-chalk-muted mt-2 max-w-xl">
                                Here&rsquo;s what&rsquo;s happening with your teams and the league.
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-glass-border text-chalk/60 hover:border-flare/40 hover:text-flare transition-all duration-200 font-body text-sm font-semibold self-start shrink-0"
                        >
                            <LogOut size={15} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Main Content ── */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
                {/* Stats Cards */}
                {loading ? (
                    <StatsRowSkeleton />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
                        {stats.map((s) => (
                            <DashboardStatCard
                                key={s.label}
                                label={s.label}
                                value={s.value}
                                icon={s.icon}
                                accent={s.accent}
                            />
                        ))}
                    </div>
                )}

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* ── LEFT COLUMN (2/3) ── */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Favorite Teams */}
                        <div>
                            <SectionHeader
                                title="Your Teams"
                                action={!loading && favorites.length > 0 ? { to: "/teams", label: "Browse All" } : undefined}
                            />
                            {loading ? (
                                <CardGridSkeleton count={3} />
                            ) : favorites.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {favorites.map((fav) => (
                                        <div key={fav.team.id} className="relative group/card">
                                            <TeamCard team={fav.team} />
                                            <button
                                                onClick={() => handleUnfollow(fav.team.id)}
                                                aria-label={`Unfollow ${fav.team.name}`}
                                                className="absolute top-2 right-2 p-1.5 rounded-full bg-night/80 border border-glass-border text-floodlight opacity-0 group-hover/card:opacity-100 hover:text-flare hover:border-flare/50 transition-all duration-200"
                                            >
                                                <Star size={13} fill="currentColor" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Star}
                                    title="No teams followed yet"
                                    message="Browse the league and follow the clubs you care about to see them here"
                                    action={
                                        <Link
                                            to="/teams"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-floodlight text-night font-body font-semibold text-sm uppercase tracking-widest2 hover:bg-chalk transition-colors"
                                        >
                                            Browse Teams <ArrowRight size={14} />
                                        </Link>
                                    }
                                />
                            )}
                        </div>

                        {/* Upcoming Fixtures */}
                        <div>
                            <SectionHeader
                                title="Upcoming Fixtures"
                                action={!loading && upcomingFixtures.length > 0 ? { to: "/matches", label: "All Matches" } : undefined}
                            />
                            {loading ? (
                                <ListSkeleton rows={3} />
                            ) : upcomingFixtures.length > 0 ? (
                                <div className="space-y-2.5">
                                    {upcomingFixtures.map((m) => (
                                        <FixtureCard key={m.id} match={m} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Calendar}
                                    title="No upcoming fixtures"
                                    message="Follow some teams to see their upcoming matches here"
                                />
                            )}
                        </div>

                        {/* Recent Results */}
                        <div>
                            <SectionHeader
                                title="Recent Results"
                                action={!loading && recentResults.length > 0 ? { to: "/matches", label: "All Results" } : undefined}
                            />
                            {loading ? (
                                <ListSkeleton rows={3} />
                            ) : recentResults.length > 0 ? (
                                <div className="space-y-2.5">
                                    {recentResults.map((m) => (
                                        <ResultCard key={m.id} match={m} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Trophy}
                                    title="No recent results"
                                    message="Completed matches from your followed teams will appear here"
                                />
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN (1/3) ── */}
                    <div className="space-y-10">

                        {/* Quick Links */}
                        <div>
                            <SectionHeader title="Quick Links" />
                            <div className="space-y-2.5">
                                <QuickLink to="/teams" icon={Star} label="Browse Teams" description="Explore all clubs" />
                                <QuickLink to="/players" icon={User} label="Browse Players" description="View player profiles" />
                                <QuickLink to="/matches" icon={Calendar} label="View Matches" description="Fixtures & results" />
                            </div>
                        </div>

                        {/* Live Now */}
                        <div>
                            <SectionHeader
                                title="Live Now"
                                action={liveMatches.length > 0 ? { to: "/matches", label: "All Live" } : undefined}
                            />
                            {loading ? (
                                <div className="rounded-xl bg-glass-bg border border-glass-border p-5 animate-pulse">
                                    <div className="h-4 w-20 bg-line/20 rounded mb-4" />
                                    <div className="h-16 bg-line/10 rounded" />
                                </div>
                            ) : liveMatches.length > 0 ? (
                                <div className="space-y-2.5">
                                    {liveMatches.slice(0, 3).map((m) => (
                                        <LiveMatchCard key={m.id} match={m} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-glass-bg border border-glass-border rounded-xl p-6 text-center">
                                    <div className="w-10 h-10 rounded-full bg-chalk/5 flex items-center justify-center mx-auto mb-3">
                                        <Zap size={18} className="text-chalk/30" />
                                    </div>
                                    <p className="font-body text-sm text-chalk/50">Nothing live right now</p>
                                    <p className="font-body text-xs text-chalk/30 mt-1">Check back once kickoff rolls around</p>
                                </div>
                            )}
                        </div>

                        {/* Profile Section */}
                        <div>
                            <SectionHeader title="Profile" />
                            <form
                                onSubmit={handleProfileSubmit}
                                className="bg-glass-bg border border-glass-border rounded-xl p-5 space-y-4"
                            >
                                {profileError && (
                                    <div className="flex items-start gap-2 bg-flare/10 border border-flare/20 rounded-lg px-4 py-3 text-sm text-flare font-body">
                                        <AlertCircle size={15} className="mt-0.5 shrink-0" />
                                        <span>{profileError}</span>
                                    </div>
                                )}
                                {profileSuccess && (
                                    <div className="flex items-start gap-2 bg-pitch/20 border border-floodlight/20 rounded-lg px-4 py-3 text-sm text-chalk font-body">
                                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-floodlight" />
                                        <span>{profileSuccess}</span>
                                    </div>
                                )}

                                <label className="flex flex-col gap-1.5">
                                    <span className="font-body text-[10px] uppercase tracking-widest2 text-chalk/40">Name</span>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-chalk/30 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-night border border-glass-border rounded-lg pl-9 pr-3 py-2 font-body text-sm text-chalk placeholder:text-chalk/30 focus:outline-none focus:border-floodlight/50 transition-colors"
                                        />
                                    </div>
                                </label>

                                <label className="flex flex-col gap-1.5">
                                    <span className="font-body text-[10px] uppercase tracking-widest2 text-chalk/40">Email</span>
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-chalk/30 pointer-events-none" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-night border border-glass-border rounded-lg pl-9 pr-3 py-2 font-body text-sm text-chalk placeholder:text-chalk/30 focus:outline-none focus:border-floodlight/50 transition-colors"
                                        />
                                    </div>
                                </label>

                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-floodlight text-night font-body font-semibold text-sm uppercase tracking-widest2 hover:bg-chalk transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={14} />
                                    {savingProfile ? "Saving…" : "Save Changes"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
