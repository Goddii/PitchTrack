import { useEffect, useMemo, useState, useCallback, memo } from "react"
import { useSearchParams } from "react-router-dom"
import {
  Calendar,
  Trophy,
  Zap,
  Flame,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import PublicNavbar from "../components/PublicNavbar"
import FeaturedMatchHero from "../components/FeaturedMatchHero"
import MatchFilters from "../components/MatchFilters"
import LeagueSection from "../components/LeagueSection"
import MatchCard from "../components/MatchCard"
import EmptyMatches from "../components/EmptyMatches"
import MatchSkeleton from "../components/MatchSkeleton"
import api from "../services/api"

/* ─────────────────────────────────────────
   Helpers
   ───────────────────────────────────────── */

function formatSectionDate(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dNorm = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const tomorrowNorm = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())

  if (dNorm.getTime() === todayNorm.getTime()) return "Today"
  if (dNorm.getTime() === tomorrowNorm.getTime()) return "Tomorrow"

  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function formatSectionDateShort(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

/* ─────────────────────────────────────────
   Quick Stats Bar
   ───────────────────────────────────────── */

const StatsBar = memo(function StatsBar({ total, live, upcoming, completed }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[
        { label: "Total", value: total, icon: Trophy, accent: false },
        { label: "Live", value: live, icon: Zap, accent: live > 0 },
        { label: "Upcoming", value: upcoming, icon: Calendar, accent: false },
        { label: "Finished", value: completed, icon: Flame, accent: false },
      ].map((stat) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-xl p-4 border transition-all duration-200 hover:translate-y-[-1px] ${
            stat.accent
              ? "bg-gradient-to-br from-flare/10 to-transparent border-flare/20 hover:shadow-[0_4px_20px_rgba(255,107,53,0.08)]"
              : "bg-glass-bg border-glass-border hover:border-chalk/10"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-display text-2xl font-bold text-chalk tabular-nums tracking-tight">
                {stat.value}
              </div>
              <div className="font-body text-[10px] text-chalk-muted uppercase tracking-widest2 mt-1">
                {stat.label}
              </div>
            </div>
            <div
              className={`p-2 rounded-lg ${
                stat.accent
                  ? "bg-flare/15 text-flare"
                  : "bg-chalk/5 text-chalk/30"
              }`}
            >
              <stat.icon size={16} strokeWidth={1.5} />
            </div>
          </div>
          <div
            className={`absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent ${
              stat.accent ? "via-flare/20" : "via-chalk/5"
            } to-transparent`}
          />
        </div>
      ))}
    </div>
  )
})

/* 
   Main Component
   */

export default function Matches() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // ── Data ──
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Filters ──
  const [tab, setTab] = useState(searchParams.get("status") || "all")
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [sortBy, setSortBy] = useState("date")
  const [dateFilter, setDateFilter] = useState("all")

  // ── Data fetch ──
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    api.matches
      .list()
      .then((data) => {
        if (!cancelled) setMatches(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // ── Debounce search input ──
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(handle)
  }, [query])

  // ── Sync filters to URL ──
  useEffect(() => {
    const params = {}
    if (tab !== "all") params.status = tab
    if (debouncedQuery) params.q = debouncedQuery
    setSearchParams(params, { replace: true })
  }, [tab, debouncedQuery, setSearchParams])

  // ── Compute derived data ──
  const liveMatches = useMemo(
    () => matches.filter((m) => m.status === "live"),
    [matches]
  )

  const featuredMatch = useMemo(() => {
    if (liveMatches.length > 0) return liveMatches[0]
    const upcoming = matches.filter((m) => m.status === "scheduled")
    return upcoming.length > 0 ? upcoming[0] : null
  }, [matches, liveMatches])

  // ── Stats ──
  const stats = useMemo(() => {
    const live = matches.filter((m) => m.status === "live").length
    const upcoming = matches.filter((m) => m.status === "scheduled").length
    const completed = matches.filter((m) => m.status === "completed").length
    return { total: matches.length, live, upcoming, completed }
  }, [matches])

  // ── Filtered + sorted matches ──
  const filteredMatches = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    const today = new Date()
    const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const tomorrowNorm = new Date(todayNorm)
    tomorrowNorm.setDate(tomorrowNorm.getDate() + 1)

    let filtered = matches

    // Status tab filter
    if (tab !== "all") {
      const statusKey = tab === "upcoming" ? "scheduled" : tab
      filtered = filtered.filter((m) => m.status === statusKey)
    }

    // Date filter (today / tomorrow / all)
    if (dateFilter === "today") {
      filtered = filtered.filter((m) => {
        const d = new Date(m.match_date)
        const dNorm = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        return dNorm.getTime() === todayNorm.getTime()
      })
    } else if (dateFilter === "tomorrow") {
      filtered = filtered.filter((m) => {
        const d = new Date(m.match_date)
        const dNorm = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        return dNorm.getTime() === tomorrowNorm.getTime()
      })
    }

    // Search filter
    if (q) {
      filtered = filtered.filter(
        (m) =>
          m.home_team?.name?.toLowerCase().includes(q) ||
          m.away_team?.name?.toLowerCase().includes(q) ||
          m.venue?.toLowerCase().includes(q)
      )
    }

    return [...filtered].sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1
      if (a.status !== "live" && b.status === "live") return 1
      return new Date(a.match_date) - new Date(b.match_date)
    })
  }, [matches, tab, debouncedQuery, dateFilter])

  // ── Group by date ──
  const groupedByDate = useMemo(() => {
    const groups = {}
    filteredMatches.forEach((m) => {
      const key = new Date(m.match_date).toDateString()
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    })
    return Object.entries(groups).map(([dateKey, dayMatches]) => ({
      dateKey,
      title: formatSectionDate(dayMatches[0].match_date),
      subtitle: formatSectionDateShort(dayMatches[0].match_date),
      matches: dayMatches,
    }))
  }, [filteredMatches])

  // ── Handlers ──
  const handleTabChange = useCallback((newTab) => {
    setTab(newTab)
  }, [])

  const handleQueryChange = useCallback((newQuery) => {
    setQuery(newQuery)
  }, [])

  const handleReset = useCallback(() => {
    setTab("all")
    setQuery("")
    setDebouncedQuery("")
    setDateFilter("all")
  }, [])

  const isEmpty = !loading && groupedByDate.length === 0

  return (
    <div className="min-h-screen bg-night">
      {/* ── Navigation ── */}
      <PublicNavbar user={user} />

      {/* ── Featured Hero ── */}
      {!loading && featuredMatch && <FeaturedMatchHero match={featuredMatch} />}

      {/* ── Page Header ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-8 md:pt-12 pb-0">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display uppercase tracking-wide text-3xl md:text-4xl lg:text-5xl text-chalk leading-tight">
              Matches
            </h1>
            <p className="font-body text-sm text-chalk-muted mt-2 max-w-lg">
              Track every fixture across the league. Follow live scores, check upcoming kickoffs, and review completed results.
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.location.reload()}
              className="p-2.5 rounded-lg border border-glass-border text-chalk/40 hover:text-chalk hover:border-chalk/20 transition-all duration-200"
              aria-label="Refresh matches"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
            <button
              className="p-2.5 rounded-lg border border-glass-border text-chalk/40 hover:text-chalk hover:border-chalk/20 transition-all duration-200"
              aria-label="Calendar view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats bar always visible */}
        {!loading && (
          <StatsBar
            total={stats.total}
            live={stats.live}
            upcoming={stats.upcoming}
            completed={stats.completed}
          />
        )}
      </section>

      {/* ── Sticky Filters ── */}
      <MatchFilters
        tab={tab}
        onTabChange={handleTabChange}
        query={query}
        onQueryChange={handleQueryChange}
        liveCount={liveMatches.length}
        sortBy={sortBy}
        onSortChange={setSortBy}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-10">
        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-glass-bg border border-glass-border p-4 animate-pulse"
                >
                  <div className="h-7 w-12 bg-line/20 rounded mb-2" />
                  <div className="h-2.5 w-16 bg-line/10 rounded" />
                </div>
              ))}
            </div>
            <MatchSkeleton variant="hero" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <MatchSkeleton key={i} variant="card" />
              ))}
            </div>
          </div>
        ) : isEmpty ? (
          <EmptyMatches
            title={
              tab === "live"
                ? "Nothing live right now"
                : tab === "upcoming"
                  ? "No upcoming matches"
                  : tab === "completed"
                    ? "No completed matches"
                    : "No matches found"
            }
            message={
              query
                ? "No teams match your search. Try a different name."
                : tab === "live"
                  ? "Check back once kickoff rolls around."
                  : "Try adjusting your filters or browse all matches."
            }
            onReset={query || tab !== "all" ? handleReset : undefined}
            showCTA={!query && tab === "all"}
          />
        ) : (
          <>
            <div className="space-y-2">
              {groupedByDate.map((group) => (
                <LeagueSection
                  key={group.dateKey}
                  title={group.title}
                  subtitle={group.subtitle}
                  matchCount={group.matches.length}
                  icon={Calendar}
                  defaultOpen={group.matches.some((m) => m.status === "live")}
                  gameweek={((group.matches[0]?.id * 7) % 6) + 1}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                    {group.matches.map((m) => (
                      <MatchCard key={m.id} match={m} />
                    ))}
                  </div>
                </LeagueSection>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
